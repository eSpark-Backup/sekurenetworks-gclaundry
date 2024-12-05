import { Module } from '@nestjs/common';
import { KioskModule } from 'src/kiosks/kiosk.module';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
@Module({
  imports: [KioskModule],
  controllers: [QuestionsController],
  providers: [QuestionsService],
  exports: [QuestionsService],
})
export class QuestionsModule {}
