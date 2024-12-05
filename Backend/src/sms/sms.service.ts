import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';
// import { SmsTransaction, SmsTransactionDocument } from './entities/sms.schema';

@Injectable()
export class SmsService {
  private readonly TWILIO_ACCOUNT_SID;
  private readonly TWILIO_AUTH_TOKEN;
  private readonly TWILIO_FROM_NUMBER;
  private readonly client;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.TWILIO_ACCOUNT_SID = this.configService.get(
      'sms.twilio.TWILIO_ACCOUNT_SID',
    );
    this.TWILIO_AUTH_TOKEN = this.configService.get(
      'sms.twilio.TWILIO_AUTH_TOKEN',
    );
    this.TWILIO_FROM_NUMBER = this.configService.get('TWILIO_FROM_NUMBER');
    this.client = twilio(this.TWILIO_ACCOUNT_SID, this.TWILIO_AUTH_TOKEN, {
      logLevel: 'debug',
    });
  }

  async sendMessage(to, body) {
    console.log('++++ to +++', to);
    console.log('++++ body +++', body);
    const message = await this.client.messages
      .create({
        body,
        from: this.TWILIO_FROM_NUMBER,
        to,
      })
      .catch((error) => console.log('++++ Error ++++', error));
    console.log('++++ message +++', message);
    return message;
  }

  async saveSmsTransaction({ kioskId, phone, otp }) {
    // otp = createHash('md5').update(otp).digest('hex');
    // const createdTransaction = new this.SmsTransactionModel({
    //   _id: new mongoose.Types.ObjectId(),
    //   kioskId,
    //   phone,
    //   otp,
    // });
    // return createdTransaction.save();
  }

  async sendEmail() {
    // return this.emailService.sendEmail({
    //   to: 'pswamis@gmail.com',
    //   from: this.configService.get('email.from'),
    //   templateId: this.configService.get('email.template.demo'),
    // });
  }
}
