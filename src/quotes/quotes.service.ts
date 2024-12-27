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

    const kiosks = data.kiosks
    
    delete data.kiosks

    const updatedQoute = await this.prisma.quote.update({ data, where: { id } });

    const kioskIds = kiosks.map((kiosk) => kiosk.kioskId) 

    for (const kioskId of kioskIds) {
      const kioskRelations = await this.prisma.kioskRelation.findMany({
        where: { kioskId: kioskId },
        include: { quote: true },
      });

      const Quotes = kioskRelations.map((rel) => (rel.quote)).filter(rel => rel.isActive === true).filter(Boolean);

      const topic = `survey/${kioskId}`;
      this.mqttService.publish(topic, JSON.stringify(Quotes)); 
    }


    // await this.publishQoutes(quote.kioskId)
    delete updatedQoute.kioskId

    return {
      ...updatedQoute,
      kiosks
    }
  }

  async delete(id: string) {
    const quote = await this.prisma.quote.findFirst({ where: { id } })
    if (!quote) throw new NotFoundException('Quote not found!');
    const count = await this.prisma.quote.count({ where: { kioskId: quote.kioskId } })
    if (count <= 1) throw new BadRequestException("Atleast 1 qoute is required")

    let quotesRelations = await this.prisma.kioskRelation.findMany({ where: { quoteId: id } });

    if (quotesRelations.length > 0) {
      await this.prisma.kioskRelation.deleteMany({ where: { quoteId: id } });
    }

    await this.prisma.quote.delete({ where: { id } })

    const kioskIds = quotesRelations.map((kiosk) => kiosk.kioskId) 

    for (const kioskId of kioskIds) {
      const kioskRelations = await this.prisma.kioskRelation.findMany({
        where: { kioskId: kioskId },
        include: { quote: true },
      });

      const Quotes = kioskRelations.map((rel) => (rel.quote)).filter(rel => rel.isActive === true).filter(Boolean);


      const topic = `survey/${kioskId}`;
      this.mqttService.publish(topic, JSON.stringify(Quotes)); 
    }


    // await this.publishQoutes(quote.kioskId)
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

  async getAllQuotes() {
    // Step 1: Fetch all quotes along with their relations
    const quotes = await this.prisma.quote.findMany({
      include: { relations: true },
    });
  
    // Step 2: Extract unique kiosk IDs from relations
    const kioskIds = [
      ...new Set(quotes.flatMap((quote) => quote.relations.map((relation) => relation.kioskId))),
    ];
  
    // Step 3: Fetch kiosk details for the extracted IDs
    const kiosks = await this.prisma.kiosk.findMany({
      where: {
        macId: { in: kioskIds },
      },
      select: {
        macId: true,
        name: true,
      },
    });
  
    // Step 4: Map kiosk details by ID for quick lookup
    const kioskMap = Object.fromEntries(kiosks.map((kiosk) => [kiosk.macId, kiosk]));
  
    // Step 5: Attach kiosk details to quotes
    const quotesWithKioskDetails = quotes.map((quote) => ({
      id: quote.id,
      quote: quote.quote,
      isActive: quote.isActive,
      kiosks: quote.relations.map((relation) => ({
        kioskId: relation.kioskId,
        kioskName: kioskMap[relation.kioskId]?.name || null,
      })),
    }));
  
    return quotesWithKioskDetails;
  }



  async publishQoutes(macId: string) {
    let questions = await this.prisma.quote.findMany({ where: { isActive: true, kioskId: macId } })
    this.mqttService.publish(`message/${macId}`, JSON.stringify(questions));
  }

}
