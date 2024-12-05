import { Body, Controller, Post } from '@nestjs/common';
import { SmsService } from './sms.service';

@Controller()
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post()
  sendSms(@Body() smsDto) {
    return this.smsService.sendMessage(smsDto.to, smsDto.body);
  }

  @Post('/email')
  sendEmail() {
    return this.smsService.sendEmail();
  }
}
