import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { KioskService } from 'src/kiosks/kiosk.service';
import { MachineInfo } from 'src/types/kiosk';

@Controller()
export class WebhookController {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly kioskService: KioskService
  ) { }

  @Get('/kiosk/:macId')
  get(@Param('macId') macId: string) {
    return this.kioskService.getKioskData(macId);
  }

  @Put('/kiosk/:macId')
  versionInfo(@Param('macId') macId: string,@Body() data: MachineInfo) {
    return this.kioskService.verisionInfo(macId, data);
  }

  @Post('/client')
  create(@Body() createCityDto: any) {
    return this.webhookService.createClient(createCityDto);
  }

  @Get('/kiosk-status/:kioskId')
  modifyKioskUpdatedAt(@Param() { kioskId }: { kioskId: string }) {
    return this.webhookService.getKioskStatus({ kioskId });
  }

  @Post('/kiosk/sensor-data/:kioskId')
  updateKioskSensorData(
    @Param() { kioskId }: { kioskId: string },
    @Body() updateKioskDto,
  ) {
    console.log('+++++ updateKioskDto +++', updateKioskDto);
    return this.webhookService.updateKioskSensor(kioskId, updateKioskDto);
  }

  @Get('/resend-password/:kioskId/:phone')
  resetPassword(
    @Param() { kioskId, phone }: { kioskId: string; phone: string },
  ) {
    return this.webhookService.resendPasswordToken(kioskId, phone);
  }
}
