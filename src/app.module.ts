import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RouterModule } from '@nestjs/core';
import { ClientsModule } from './clients/clients.module';
import { FirebaseAdmin } from './common/firebase-admin/firebase-admin.service';
import configuration from './config/configuration';
import { CustomersModule } from './customers/customers.module';
import { ReportModule } from './report/report.module';
import { KioskModule } from './kiosks/kiosk.module';
import { PreAuthMiddleware } from './middlewares/pre-auth-middleware.service';
import { MqttModule } from './mqtt/mqtt.module';
import { QuestionsModule } from './questions/questions.module';
import { QuotesModule } from './quotes/quotes.module';
import { SmsModule } from './sms/sms.module';
import { WebhookModule } from './webhooks/webhook.module';

const config = configuration();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    CustomersModule,
    KioskModule,
    ClientsModule,
    ReportModule,
    SmsModule,
    WebhookModule,
    RouterModule.register([
      {
        path: 'customers',
        module: CustomersModule,
      },
      {
        path: 'kiosk',
        module: KioskModule,
      },
      {
        path: 'clients',
        module: ClientsModule,
      },
      {
        path: 'report',
        module: ReportModule,
      },
      {
        path: 'sms',
        module: SmsModule,
      },
      {
        path: 'webhook',
        module: WebhookModule,
      },
    ]),
    QuestionsModule,
    MqttModule,
    QuotesModule,
  ],
  providers: [FirebaseAdmin],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PreAuthMiddleware)
      .exclude('webhook/(.*)','/(.*)')
      .forRoutes({
        path: '*',
        method: RequestMethod.ALL,
      });
  }
}