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
import { ClientsService } from './clients.service';

@Controller()
export class ClientsController {
  constructor(private readonly clientService: ClientsService) {}

  @Post()
  create(@Body() createClientDto: any) {
    return this.clientService.create(createClientDto);
  }

  @Get()
  findAll(@Query() filter: { take: number, skip: number, email: string | null}) {
    return this.clientService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateKioskDto: any) {
    return this.clientService.update(id, updateKioskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientService.remove(id);
  }
}
