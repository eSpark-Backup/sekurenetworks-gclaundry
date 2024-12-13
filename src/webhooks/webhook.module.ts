import { Module } from '@nestjs/common';
import { ClientsModule } from '../clients/clients.module';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { KioskModule } from '../kiosks/kiosk.module';
import { SmsModule } from '../sms/sms.module';

@Module({
  imports: [ClientsModule, KioskModule, SmsModule],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
