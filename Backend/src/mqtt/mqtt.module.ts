import { Global, Module } from '@nestjs/common';
import { KioskModule } from 'src/kiosks/kiosk.module';
import { MqttService } from './mqtt.service';

@Global() 
@Module({
  imports: [KioskModule],
  controllers: [],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}
