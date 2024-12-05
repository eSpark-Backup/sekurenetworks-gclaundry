import { Module } from '@nestjs/common';
import { KioskModule } from 'src/kiosks/kiosk.module';
import { QuotesController } from './quotes.controller';
import { QuotesService } from './quotes.service';

@Module({
  imports: [KioskModule],
  providers: [QuotesService],
  controllers: [QuotesController],
  exports: [QuotesService]
})
export class QuotesModule {}
