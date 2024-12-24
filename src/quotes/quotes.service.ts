import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { KioskService } from 'src/kiosks/kiosk.service';
import { MqttService } from 'src/mqtt/mqtt.service';

@Injectable()
export class QuotesService {
  private prisma: PrismaClient;
  constructor(
    private kioskService: KioskService,
    private mqttService: MqttService
  ) {
    this.prisma = new PrismaClient()
  }

  async createGeneral(quotesData: any) {

    const quote = await this.prisma.quote.create({
      data: {
        isActive: quotesData.isActive ?? true,
        quote: quotesData.quote
      }
    });
    // await this.publishQoutes(quotesData.kioskId)
    return quote
  }

  async create(quotesData: any) {

    const kiosk = await this.kioskService.findOne(quotesData.kioskId);

    if (!kiosk) {
      throw new NotFoundException('kiosk not found!');
    }

    const quote = await this.prisma.quote.create({
      data: {
        isActive: quotesData.isActive ?? true,
        quote: quotesData.quote,
        kioskId: quotesData.kioskId
      }
    });
    await this.publishQoutes(quotesData.kioskId)
    return quote
  }

  async getQuotesByKiosk(macId: string) {
    const qoutes = await this.prisma.quote.findMany({ where: { kioskId: macId } });
    return qoutes
  }

  async update(data: any, id: string) {
    const quote = await this.prisma.quote.findFirst({
      where: { id },
    });
    if (!quote) {
      throw new NotFoundException('Quote not found!');
    }
    const updatedQoute = await this.prisma.quote.update({ data, where: { id } });
    await this.publishQoutes(quote.kioskId)
    return updatedQoute
  }

  async delete(id: string) {
    const quote = await this.prisma.quote.findFirst({ where: { id } })
    if (!quote) throw new NotFoundException('Quote not found!');
    const count = await this.prisma.quote.count({ where: { kioskId: quote.kioskId } })
    if (count <= 1) throw new BadRequestException("Atleast 1 qoute is required")

    let QuotesRelations = await this.prisma.kioskRelation.findMany({ where: { quoteId: id } });

    if (QuotesRelations.length > 0) {
      await this.prisma.kioskRelation.deleteMany({ where: { quoteId: id } });
    }


    await this.prisma.quote.delete({ where: { id } })
    await this.publishQoutes(quote.kioskId)
    return { message: "Quote deleted Sucessfully" };
  }

  async getAllQuotesbyId(macId: string) {
    // return this.prisma.quote.findMany({
    //   where: { kioskId: macId },
    // });

    if (!macId) {
      throw new BadRequestException("macID is required to get questions")
    }


    const relations = await this.prisma.kioskRelation.findMany({
      where: { type: "QUOTE", kioskId: macId },
      include: { quote: true },
    });

    return relations.map((relation) => ({
      ...relation.quote,
      relationId: relation.id,
    }));
  }

  getAllQuotes() {
    return this.prisma.quote.findMany();
  }



  async publishQoutes(macId: string) {
    let questions = await this.prisma.quote.findMany({ where: { isActive: true, kioskId: macId } })
    this.mqttService.publish(`message/${macId}`, JSON.stringify(questions));
  }

}
