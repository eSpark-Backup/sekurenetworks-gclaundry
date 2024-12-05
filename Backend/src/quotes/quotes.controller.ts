import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { QuotesService } from './quotes.service';

@Controller('quotes')
export class QuotesController {
  constructor(private quoteService: QuotesService) {}
  @Post()
  create(@Body() data: any) {
    return this.quoteService.create(data);
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.quoteService.update(data, id);
  }
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.quoteService.delete(id);
  }
  @Get(':id')
  findAll(@Param('id') id: string) {
    return this.quoteService.getAllQuotes(id);
  }
}
