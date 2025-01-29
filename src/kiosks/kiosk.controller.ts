import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query
} from '@nestjs/common';
import { KioskService } from './kiosk.service';
import { MqttService } from 'src/mqtt/mqtt.service';

@Controller()
export class KioskController {
  constructor(
    private readonly kioskService: KioskService,
    private readonly mqttService: MqttService
  ) { }

  @Get()
  findAll(@Query() filter: { take: number, skip: number, name: string | null, status: string | null ,error: string | null,customerId: string | null }) {
    return this.kioskService.findAll(filter);
  }

  @Get('/kiosk-list') 
  findAllKiosks() {
    return this.kioskService.findAllKiosks();
  }

  // @Get('/sq-em')
  // getKioksSQorEM(@Body() data: any) {
  //   return this.kioskService.getKioksSQandEM(data);
  // }

 
  @Get('/byKioskIds')
  findByKioskIds(@Query() { kioskIds }) {
    return this.kioskService.findByIds(kioskIds?.split(','));
  }

  @Get(':macId')
  findOne(@Param('macId') macId: string) {
    return this.kioskService.findOne(macId);
  }

  @Patch(':macId')
  async update(@Param('macId') macId: string, @Body() updateKioskDto: any) {
    const kiosk = await this.kioskService.update(macId, updateKioskDto);
    const { answer_required, type, auth_type, sheets_per_transaction, screen_sequence,customerId } = kiosk.data;
    const config = { answer_required, type, auth_type, sheets_per_transaction, screen_sequence,customerId }
    this.mqttService.publish(`config/${macId}`, JSON.stringify(config))
    return kiosk
  }

  @Patch(':macId/activate')
  activateKiosk(@Param('macId') macId: string, @Body() { isActive }: any) {
    return this.kioskService.update(macId, { isActive });
  }

  @Delete(':macId')
  delete(@Param('macId') macId: string) {
    return this.kioskService.delete(macId);
  }

  @Post('/assign')
  assignToKiosks(@Body() data: {
    kioskIds: string[],
    dataIds: string[],
    type: string,
  }) {
    return this.kioskService.assignToKiosks(data);
  }

  @Post('/unassign')
  unassignFromKiosks(@Body() data: {
    kioskIds: string[],
    dataIds: string[],
    type: string,
  }) {
    return this.kioskService.unassignFromKiosks(data);
  }

  @Delete('/unassign/:id')
  unassignItem(@Param('id') id: string) {
    return this.kioskService.unassignItem(id);
  }

  @Post('/add-transaction') 
  addTransaction(@Body() data: any) {
    return this.kioskService.addTransaction(data);
  }

}
