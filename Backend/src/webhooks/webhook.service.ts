import { Injectable, NotFoundException, Scope } from '@nestjs/common';
import { ClientsService } from '../clients/clients.service';
import { KioskService } from '../kiosks/kiosk.service';
import { SmsService } from '../sms/sms.service';
import { ConfigService } from '@nestjs/config';
@Injectable({ scope: Scope.REQUEST })
export class WebhookService {
  constructor(
    private readonly clientService: ClientsService,
    private readonly kioskService: KioskService,
    private readonly smsService: SmsService,
    private readonly configService: ConfigService
  ) {}

  async createClient(body: any) {
    return this.clientService.create(body);
  }

  hexToDecimal(hex) {
    return parseInt(hex, 16);
  }

  calculateKioskInventory(ToF1, ToF2) {
    let inventoryScented, inventoryUnscented;
    if (ToF1 >= 0) {
      inventoryScented = this.processInventory(ToF1);
    }
    if (ToF2 >= 0) {
      inventoryUnscented = this.processInventory(ToF2);
    }
    return {
      inventoryUnscented,
      inventoryScented,
    };
  }

  processInventory(ToF) {
    if (ToF < 35) return 'Locked';
    if (ToF >= 35 && ToF < 75) return 'Error';
    if (ToF >= 271 && ToF <= 290) return '0%';
    if (ToF === 291) return 'Connection';
    ToF = parseFloat(
      Math.round(100 - ((ToF - 75) / (270 - 75)) * 100).toFixed(2)
    );
    ToF = ToF < 0 ? 0 : ToF;
    return ToF > 100 ? '100%' : `${ToF}%`;
  }

  checkIfLowInventory(inventoryScented, inventoryUnscented) {
    const scented = inventoryScented
      ? parseInt(inventoryScented.replace('%', '')) < 30
      : false;
    const unscented = inventoryUnscented
      ? parseInt(inventoryUnscented.replace('%', '')) < 30
      : false;
    return scented || unscented;
  }

  async updateKioskSensor(kioskId, sensorData) {
    // try {
    //   const kioskCols = {};
    //   const smsToList = this.configService.get('sms.SMS_TO_LIST') ?? [];
    //   let isNotified = false;
    //   if (
    //     (sensorData['afterDispense'] && sensorData['afterDispense']['ToF1']) ||
    //     sensorData['ToF1']
    //   ) {
    //     const ToF1 = sensorData?.ToF1 ?? sensorData?.afterDispense?.ToF1;
    //     const ToF2 = sensorData?.ToF2 ?? sensorData?.afterDispense?.ToF2;
    //     const { inventoryScented, inventoryUnscented } =
    //       this.calculateKioskInventory(ToF1, ToF2);

    //     if (inventoryScented) {
    //       kioskCols['inventoryScented'] = inventoryScented;
    //     }
    //     if (inventoryUnscented) {
    //       kioskCols['inventoryUnscented'] = inventoryUnscented;
    //     }
    //     const isLowInventory = this.checkIfLowInventory(
    //       inventoryScented,
    //       inventoryUnscented
    //     );
    //     if (isLowInventory) {
    //       const kiosk = await this.kioskService.findOne({
    //         kioskId,
    //       });
    //       isNotified = true;
    //       if (!kiosk.isNotified) {
    //         const result = await this.smsService.sendMessage(
    //           this.parsePhoneNumbers(smsToList),
    //           `Your GC kiosk ${kiosk.kioskName} has low inventory(UnScented: ${inventoryUnscented}, Scented: ${inventoryScented}). Please refill the kiosk.`
    //         );
    //         isNotified = Boolean(result);
    //       }
    //     }
    //   }
    //   kioskCols['checkInTime'] = new Date().toISOString();
      // await mongoose.connection.db.collection('kiosks').updateOne(
      //   {
      //     kioskId,
      //   },
      //   {
      //     $set: {
      //       ...kioskCols,
      //       isNotified,
      //       status: {
      //         ...sensorData,
      //       },
      //       updatedAt: new Date().toISOString(),
      //     },
      //   },
      // );
      // const response = await mongoose.connection.db
      //   .collection('kiosk-sensor-data')
      //   .insertOne({
      //     kioskId,
      //     ...sensorData,
      //     createdAt: new Date().toISOString(),
      //   });
      // return JSON.parse(JSON.stringify(response));
    // } catch (e) {
    //   console.log('++++ e ++++', e);
    // }
  }

  async getKioskStatus({ kioskId }) {
    // const response = await this.kioskService.findOneByCondition({
    //   kioskId,
    // });
    // console.log('+++++ response +++', response);
    // if (!response) {
    //   throw new NotFoundException('No Kiosk found for provided kioskId');
    // }
    // return { isActive: response.isActive };
  }

  async resendPasswordToken(kioskId, phone) {
    const client = await this.clientService.findByTel(phone);
    if (client.length === 0) {
      throw new NotFoundException('No client found for provided phone number');
    }
    const otp = client[0].masterPin;
    await this.smsService.saveSmsTransaction({
      kioskId,
      phone,
      otp,
    });
    const response = await this.smsService.sendMessage(
      phone,
      `Your GC reset password token is ${otp}.`
    );
    return {
      passcode: otp,
      response: response
        ? 'SMS sent successfully'
        : 'SMS failed as Phone number is not verified',
    };
  }

  // async notifyLowInventory() {
  //   const lowInventoryKiosks =
  //     await this.kioskService.fetchAllKiosksWithLowInventory();
  //   const kioskPromise = lowInventoryKiosks.map(async (kiosk) => {
  //     const result = [];
  //     if (kiosk?.onSiteContact?.phone) {
  //       result.push(
  //         await this.smsService.sendMessage(
  //           this.parsePhoneNumbers(kiosk.onSiteContact.phone),
  //           `Your GC kiosk ${kiosk.kioskId} has low inventory(UnScented: ${kiosk.inventoryUnscented}, Scented: ${kiosk.inventoryScented}). Please refill the kiosk.`,
  //         ),
  //       );
  //     }
  //     if (kiosk?.onSiteContactSecondary?.phone) {
  //       result.push(
  //         await this.smsService.sendMessage(
  //           this.parsePhoneNumbers(kiosk.onSiteContactSecondary.phone),
  //           `Your GC kiosk "${kiosk.kioskName}" has low inventory(UnScented: ${kiosk.inventoryUnscented}, Scented: ${kiosk.inventoryScented}). Please refill the kiosk.`,
  //         ),
  //       );
  //     }
  //     return result;
  //   });
  //   return Promise.all(kioskPromise);
  // }

  parsePhoneNumbers(phoneNumbers) {
    return phoneNumbers.map((phoneNumber) => {
      // Remove all non-digit characters from the phone number
      const digits = phoneNumber.replace(/\D/g, '');

      // Check if the phone number starts with '1', which is the country code for the US and Canada
      if (digits.startsWith('1')) {
        return phoneNumber; // The phone number already has a country code, so return it as-is
      } else {
        return '+1' + digits; // Add '+1' as the country code and return the modified phone number
      }
    });
  }
}
