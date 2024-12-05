import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CustomersService } from './customers.service';

@Controller()
export class CustomersController {
  constructor(private readonly customerService: CustomersService) {}

  @Post()
  async create(@Body() createCityDto: any) {
    const data = await this.customerService.create(createCityDto);
    return data;
  }

  @Get()
  findAll(@Query() filter: { take: number, skip: number, name: string | null }) {
    return this.customerService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCityDto: any) {
    return this.customerService.update(id, updateCityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customerService.remove(id);
  }
}
