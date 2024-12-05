import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';

@Controller('questions')
export class QuestionsController {
  constructor(private questionService: QuestionsService) {}
  @Post()
  create(@Body() data: any) {
    return this.questionService.create(data);
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.questionService.update(data, id);
  }
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.questionService.delete(id);
  }
  @Get(':id')
  findAll(@Param('id') id: string) {
    return this.questionService.getAllQuestions(id);
  }
}
