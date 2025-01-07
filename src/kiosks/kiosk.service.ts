import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common';

import { PrismaClient } from '@prisma/client';
import { differenceInMinutes, fromUnixTime, subMinutes } from 'date-fns';
import { MachineInfo } from 'src/types/kiosk';
import { Transaction } from 'src/types/transaction';
import { sendEmail } from 'src/utils/emailHandler';
import { adjectives, colors, starWars, uniqueNamesGenerator } from 'unique-names-generator';
import { getDefaultMsgs, getDefaultSurvey } from './dto/const';
import { log } from './dto/logs';
import { StatusDto } from './dto/status.schema';
import { MqttService } from 'src/mqtt/mqtt.service';

@Injectable()
export class KioskService {
  private prisma: PrismaClient;

  constructor(
    @Inject(forwardRef(() => MqttService))
    private mqttService: MqttService
  ) {
    this.prisma = new PrismaClient()
  }



  async getKioskData(macId: string) {

    let kiosk = await this.prisma.kiosk.findFirst({
      where: { macId },
    });

    if (!kiosk) {

      const name: string = uniqueNamesGenerator({
        dictionaries: [adjectives, colors, starWars],
        style: 'upperCase',
        separator: " ",
        length: 2,
      });

      const data = {
        macId,
        name,
      }

      kiosk = await this.prisma.kiosk.create({ data })

      // const qoutes = getDefaultMsgs(macId)
      // const survey = getDefaultSurvey(macId)

      // await this.prisma.$transaction([
        // this.prisma.question.createMany({ data: survey }),
      //   this.prisma.quote.createMany({ data: qoutes })
      // ])

      await this.prisma.log.create({ data: { type: 'INFO', kioskId: macId, detail: log.created, createdAt: new Date() } })

    }

    const { answer_required, type, sheets_per_transaction, screen_sequence, isDeleted, customerId } = kiosk

    if (isDeleted) {
      await this.prisma.kiosk.update({ data: { isDeleted: false }, where: { macId } })
      await this.prisma.log.create({ data: { type: 'INFO', kioskId: macId, detail: log.activate, createdAt: new Date() } })
    }

    const config = { answer_required, type, sheets_per_transaction, screen_sequence, customerId }

    const [survey, environmental_messages] = await this.prisma.$transaction([
      this.prisma.question.findMany({ where: { kioskId: macId } }),
      this.prisma.quote.findMany({ where: { kioskId: macId } })
    ])
    let users = []
    if (type === 'AUTH') users = await this.prisma.users.findMany({ where: { customerId } })
    return { config, survey, environmental_messages, users }
  }

  async addTransaction(data: Transaction[]) {
    for await (const transaction of data) {
      // Logging errors of trasaction if any
      if (transaction.error) await this.prisma.log.create({ data: { type: 'ERROR', kioskId: transaction.kioskId, detail: transaction.error, createdAt: new Date() } })
      // converting datetime unix into datetime
      transaction.time = fromUnixTime(transaction.time as any)
      // creating data into database
      await this.prisma.transaction.create({ data: transaction });
    }
  }

  async verisionInfo(macId: string, data: MachineInfo) {
    const { machineInfo } = await this.prisma.kiosk.update({ where: { macId }, data: { machineInfo: data as any } })
    return machineInfo
  }

  async findAll(filter: { take: number, skip: number, name: string | null, status: string | null, error: string | null, customerId: string | null }) {

    let { take, skip, name, status, error, customerId } = filter
    let filters = {}
    if (take) take = Number(take)
    if (skip) skip = Number(skip)
    if (customerId) filters = { ...filters, customerId }
    if (status) {
      if (status.toLowerCase() == "online") {
        filters = { ...filters, lastSeen: { gte: subMinutes(new Date(), 6) } }
      } else {
        filters = { ...filters, lastSeen: { lte: subMinutes(new Date(), 6) } }
      }
    }
    if (error) filters = {
      ...filters, OR: [
        { scented: { lte: 20 } },
        { unscented: { lte: 20 } }
      ]
    }

    const [kiosks, count] = await this.prisma.$transaction([
      this.prisma.kiosk.findMany({
        take,
        skip,
        where: {
          ...filters,
          name: { contains: name, mode: 'insensitive' },
          isDeleted: false
        },
        include: {
          customer: true,
          onSiteContact: true,
        }

      }),
      this.prisma.kiosk.count({
        where: {
          ...filters,
          name: { contains: name, mode: 'insensitive' },
          isDeleted: false
        },
      }),
    ])

    const data = kiosks.map((kiosk) => {
      const mins = differenceInMinutes(new Date(), kiosk.lastSeen);


      return {
        ...kiosk,
        status: mins <= 6 ? "ONLINE" : "OFFLINE",
      };
    });

    return { data, count }

  }

  async findOne(macId: string) {
    const kiosk = await this.prisma.kiosk.findFirst({
      where: {
        macId,
        isDeleted: false,
      },
      include: { customer: { select: { firstName: true, id: true } }, onSiteContact: true },
    });
    if (!kiosk) throw new NotFoundException('Kiosk not found!');
    const mins = differenceInMinutes(new Date(), kiosk.lastSeen);
    return {
      ...kiosk,
      status: mins <= 6 ? "ONLINE" : "OFFLINE",
    };
  }

  async findByIds(macIds: string[]) {
    return await this.prisma.kiosk.findMany({
      where: {
        isDeleted: {
          not: true
        },
        macId: {
          in: macIds,
        }
      },
      include: { customer: { select: { firstName: true, id: true } }, onSiteContact: true },
    });
  }

  async update(macId: string, data: any) {
    if (data.onSiteContact?.email) {
      await this.prisma.onSiteContact.upsert({ create: { ...data.onSiteContact, kioskId: macId }, update: { ...data.onSiteContact, kioskId: macId }, where: { kioskId: macId } })
    }
    delete data.onSiteContact
    let kiosk = await this.prisma.kiosk.findFirst({ where: { macId, isDeleted: { not: true } } });
    if (!kiosk) throw new NotFoundException('Kiosk not found!');
    kiosk = await this.prisma.kiosk.update({ data, where: { macId } })
    return { message: "Kiosk Update Successfully", data: kiosk, statusCode: 200 }
  }

  async delete(macId: string) {
    await this.prisma.kiosk.update({ where: { macId }, data: { isDeleted: true } });
    return { message: "Kiosk deleted successfully", statusCode: 200 }
  }

  async updateStatus(data: StatusDto) {

    let { macId, scented, unscented, temperature, is_door_open, scented_motor_stuck, unscented_motor_stuck } = data
    const kiosk = await this.prisma.kiosk.findFirst({ where: { macId } })
    const errors: string[] = kiosk.errors as string[]

    // converting tof values into percentage
    if (scented) scented = 100 - (scented * 100 / 260)
    if (unscented) unscented = 100 - (unscented * 100 / 260)

    const conditions = [
      {
        name: "Scented",
        value: scented,
        rules: [
          { condition: scented == null, error: "Error reading scented value" },
          { condition: scented <= 20, error: "SCENTED LOW INVENTORY" },
          { condition: scented < 0 || scented > 100, error: "Sensor Error in scented" }
        ]
      },
      {
        name: "Unscented",
        value: unscented,
        rules: [
          { condition: unscented == null, error: "Error reading unscented value" },
          { condition: unscented <= 20, error: "UNSCENTED LOW INVENTORY" },
          { condition: unscented < 0 || unscented > 100, error: "Sensor Error in unscented" }
        ]
      },
      {
        name: "Door Open",
        value: is_door_open,
        rules: [
          { condition: is_door_open == null, error: "Error reading door status" },
          { condition: is_door_open, error: "DOOR IS LEFT OPEN" }
        ]
      },
      {
        name: "Scented motor",
        value: scented_motor_stuck,
        rules: [
          { condition: scented_motor_stuck == null, error: "Error reading scented motor value" },
          { condition: scented_motor_stuck, error: "SCENTED MOTOR STUCK" }
        ]
      },
      {
        name: "Unscented motor",
        value: unscented_motor_stuck,
        rules: [
          { condition: unscented_motor_stuck == null, error: "Error reading unscented motor value" },
          { condition: unscented_motor_stuck, error: "UNSCENTED MOTOR STUCK" }
        ]
      },
      {
        name: "Temperature",
        value: temperature,
        rules: [
          { condition: temperature >= 50, error: "TEMPERATURE IS ABOVE 50 C" }
        ]
      }
    ];
    // Iterate over condition checks and apply the logging function
    for await (let { rules } of conditions) {
      for await (const { condition, error } of rules) {
        if ((condition) && !errors.includes(error)) {
          await sendEmail({ to: process.env.EMAIL_FROM, subject: `Error in Kiosk ${kiosk.name}`, text: error.toUpperCase(), })
          await this.prisma.log.create({ data: { kioskId: macId, type: "ERROR", detail: error.toUpperCase(), createdAt: new Date() } })
          errors.push(error);
        } else if (!condition && errors.includes(error)) {
          errors.splice(errors.indexOf(error), 1);
        }
      }
    }
    const value = { scented, unscented, temperature, errors }
    await this.prisma.kiosk.update({ where: { macId }, data: { ...value, lastSeen: new Date() } })
  }

  async findAllKiosks() {
    return await this.prisma.kiosk.findMany({ where: { isDeleted: false }, select: { macId: true, name: true } });
  }


  async assignToKiosks(data: any) {
    const { kioskIds, dataIds, type } = data;

    // Build the relations array
    const relations = [];
    kioskIds.forEach((kioskId) => {
      dataIds.forEach((dataId) => {
        relations.push({
          kioskId,
          ...(type === "QUESTION" ? { questionId: dataId } : { quoteId: dataId }),
          type,
        });
      });
    });

    // Fetch existing relations from the database
    const existingRelations = await this.prisma.kioskRelation.findMany({
      where: {
        kioskId: { in: kioskIds },
        type,
        ...(type === "QUESTION" ? { questionId: { in: dataIds } } : { quoteId: { in: dataIds } }),
      },
      select: {
        kioskId: true,
        ...(type === "QUESTION" ? { questionId: true } : { quoteId: true }),
      },
    });

    // Create a Set of existing relations for quick lookup
    const existingSet = new Set(
      existingRelations.map((relation) =>
        `${relation.kioskId}-${type === "QUESTION" ? (relation as any).questionId : (relation as any).quoteId}`
      )
    );

    // Filter out duplicates
    const filteredRelations = relations.filter(
      (relation) =>
        !existingSet.has(`${relation.kioskId}-${type === "QUESTION" ? relation.questionId : relation.quoteId}`)
    );

    // Create new relations
    if (filteredRelations.length > 0) {
      await this.prisma.kioskRelation.createMany({
        data: filteredRelations,
      });
    }


    const questionsByKiosk = new Map<string, any[]>();
    for (const relation of filteredRelations) {
      if (!questionsByKiosk.has(relation.kioskId)) {
        questionsByKiosk.set(relation.kioskId, []);
      }
    }

    for (const [kioskId] of questionsByKiosk) {
      const kioskRelations = await this.prisma.kioskRelation.findMany({
        where: { kioskId: kioskId },
        include: { question: true, quote: true },
      });


      const QuestionsOrQuotes = kioskRelations.map((rel) => (type === "QUESTION" ? rel.question : rel.quote)).filter(rel => rel?.isActive === true).filter(Boolean); 
   
      if (QuestionsOrQuotes.length > 0) {
        const topic = `survey/${kioskId}`;
        this.mqttService.publish(topic, JSON.stringify(QuestionsOrQuotes));
      }
    }

    return { message: "Assigned Successfully", statusCode: 200 };
  }


  async unassignItem(id: string) {
    // Fetch and validate the relation
    const relation = await this.prisma.kioskRelation.findFirst({ where: { id } });
    if (!relation) throw new NotFoundException("Item not found");

    // Delete the relation
    await this.prisma.kioskRelation.delete({ where: { id } });

    // Fetch all remaining relations for the kiosk
    const kioskRelations = await this.prisma.kioskRelation.findMany({
      where: { kioskId: relation.kioskId },
      include: { question: true, quote: true },
    });

    // If no more relations exist for the kiosk, return early
    if (!kioskRelations.length) {
      return { message: "Unassigned Successfully", statusCode: 200 };
    }

    // Determine the type of data to publish (quotes or questions)
    const topic = `survey/${relation.kioskId}`;

    if (relation.quoteId) {
      // Extract and publish quotes
      const quotes = kioskRelations.map((rel) => rel.quote).filter(rel => rel.isActive === true).filter(Boolean);
      this.mqttService.publish(topic, JSON.stringify(quotes));

    }

    if (relation.questionId) {
      // Extract and publish questions
      const questions = kioskRelations.map((rel) => rel.question).filter(rel => rel.isActive === true).filter(Boolean);
      this.mqttService.publish(topic, JSON.stringify(questions));

    }

    return { message: "Unassigned Successfully", statusCode: 200 };
  }



  async unassignFromKiosks(data: any) {
    const { kioskIds, dataIds, type } = data;
  
    // Fetch existing relations that match the provided kioskIds, dataIds, and type
    const existingRelations = await this.prisma.kioskRelation.findMany({
      where: {
        kioskId: { in: kioskIds },
        type,
        ...(type === "QUESTION" ? { questionId: { in: dataIds } } : { quoteId: { in: dataIds } }),
      },
      select: {
        id: true,
        kioskId: true,
        ...(type === "QUESTION" ? { questionId: true } : { quoteId: true }),
      },
    });
  
    // Delete the relations
    const relationIds = existingRelations.map((relation) => relation.id);
    if (relationIds.length > 0) {
      await this.prisma.kioskRelation.deleteMany({
        where: { id: { in: relationIds } },
      });
    }
  
    // Group remaining questions or quotes by kiosk
    const questionsOrQuotesByKiosk = new Map();
  
    for (const kioskId of kioskIds) {
      const kioskRelations = await this.prisma.kioskRelation.findMany({
        where: { kioskId },
        include: { question: true, quote: true },
      });
  
      const remainingQuestionsOrQuotes = kioskRelations
        .map((rel) => (type === "QUESTION" ? rel.question : rel.quote))
        .filter((rel) => rel?.isActive === true)
        .filter(Boolean);
  
      if (remainingQuestionsOrQuotes.length > 0) {
        questionsOrQuotesByKiosk.set(kioskId, remainingQuestionsOrQuotes);
      } else {
        questionsOrQuotesByKiosk.set(kioskId, []); // No active relations left
      }
    }
  
    // Publish updated lists to kiosks
    for (const [kioskId, questionsOrQuotes] of questionsOrQuotesByKiosk) {
      
      const topic = `survey/${kioskId}`;
      this.mqttService.publish(topic, JSON.stringify(questionsOrQuotes));
    }
  
    return { message: "Unassigned Successfully", statusCode: 200 };
  }

}





