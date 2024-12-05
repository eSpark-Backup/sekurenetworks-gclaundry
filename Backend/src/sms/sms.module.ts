import { Module } from "@nestjs/common";
import { SmsService } from "./sms.service";
import { SmsController } from "./sms.controller";
// import { SmsTransaction, SmsTransactionSchema } from './entities/sms.schema';

@Module({
  imports: [],
  providers: [SmsService],
  controllers: [SmsController],
  exports: [SmsService],
})
export class SmsModule {}
