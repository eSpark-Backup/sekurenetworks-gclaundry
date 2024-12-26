import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { KioskService } from 'src/kiosks/kiosk.service';
import { MqttService } from 'src/mqtt/mqtt.service';

@Injectable()
export class QuestionsService {
  private prisma: PrismaClient;
  constructor(
    private kioskService: KioskService,
    private mqttService: MqttService
  ) {
    this.prisma = new PrismaClient()
  }



  async create(questionData: any) {
    const kiosk = await this.kioskService.findOne(questionData.kioskId);
    const question = await this.prisma.question.create({
      data: {
        isActive: questionData.isActive ?? true,
        question: questionData.question,
        kioskId: kiosk.macId,
        options: questionData.options,
      }
    });
    await this.publishQuestion(kiosk.macId)
    return question
  }
  async update(data: any, id: string) {
    const question = await this.prisma.question.findFirst({
      where: { id },
    });
    if (!question) {
      throw new NotFoundException('Question not found!');
    }

    const kiosks = data.kiosks
    
    delete data.kiosks

    let updatedQustion = await this.prisma.question.update({ data, where: { id } })

    const kioskIds = kiosks.map((kiosk) => kiosk.kioskId) 

    for (const kioskId of kioskIds) {
      const kioskRelations = await this.prisma.kioskRelation.findMany({
        where: { kioskId: kioskId },
        include: { question: true },
      });

      const Questions = kioskRelations.map((rel) => (rel.question)).filter(Boolean);

      const topic = `survey/${kioskId}`;
      this.mqttService.publish(topic, JSON.stringify(Questions)); 
    }

    return {
      ...updatedQustion,
      kiosks
    };
  }



  async delete(id: string) {

    const question = await this.prisma.question.findFirst({ where: { id } });
    
    if (!question) throw new NotFoundException('Question not found!');
    const count = await this.prisma.question.count({ where: { kioskId: question.kioskId } });
    if (count <= 1) throw new BadRequestException("Atleast 1 Question is required")

    let questionsRelations = await this.prisma.kioskRelation.findMany({ where: { questionId: id } });

    if (questionsRelations.length > 0) {
      await this.prisma.kioskRelation.deleteMany({ where: { questionId: id } });
    }

    let questions = await this.prisma.question.delete({ where: { id } })

    const kioskIds = questionsRelations.map((kiosk) => kiosk.kioskId) 

    for (const kioskId of kioskIds) {
      const kioskRelations = await this.prisma.kioskRelation.findMany({
        where: { kioskId: kioskId },
        include: { question: true },
      });

      const Questions = kioskRelations.map((rel) => (rel.question)).filter(Boolean);


      const topic = `survey/${kioskId}`;
      this.mqttService.publish(topic, JSON.stringify(Questions)); 
    }
    

    // await this.publishQuestion(question.kioskId)
    return questions;
  }

  async getAllQuestionsbyId(macID: string) {
    // return this.prisma.question.findMany({
    //   where: { kioskId: macID },
    // });

    if (!macID) {
      throw new BadRequestException("macID is required to get questions")
    }

    const relations = await this.prisma.kioskRelation.findMany({
      where: { type: "QUESTION", kioskId: macID },
      include: { question: true }
    });

    return relations.map((relation) => ({
      ...relation.question,
      relationId: relation.id,
    }));

  }


  async publishQuestion(macId: string) {
    let questions = await this.prisma.question.findMany({ where: { isActive: true, kioskId: macId } })
    this.mqttService.publish(`survey/${macId}`, JSON.stringify(questions));
  }

  async createGeneral(questionData: any) {
    const question = await this.prisma.question.create({
      data: {
        isActive: questionData.isActive ?? true,
        question: questionData.question,
        options: questionData.options,
      }
    });
    // await this.publishQuestion(kiosk.macId)
    return question
  }


  async getAllQuestions() {
    // Fetch all questions along with their relations
    const questions = await this.prisma.question.findMany({
      include: { relations: true },
    });

    // Extract unique kiosk IDs from relations
    const kioskIds = [
      ...new Set(questions.flatMap((q) => q.relations.map((r) => r.kioskId))),
    ];

    // Fetch kiosk details for the extracted IDs
    const kiosks = await this.prisma.kiosk.findMany({
      where: {
        macId: { in: kioskIds },
      },
      select: {
        macId: true,
        name: true,
      },
    });

    // Map kiosk details by ID for quick lookup
    const kioskMap = Object.fromEntries(kiosks.map((kiosk) => [kiosk.macId, kiosk]));

    // Attach kiosk details to questions
    const questionsWithKioskDetails = questions.map((question) => ({
      id: question.id,
      question: question.question,
      isActive: question.isActive,
      options: question.options,
      kiosks: question.relations.map((relation) => ({
        kioskId: relation.kioskId,
        kioskName: kioskMap[relation.kioskId]?.name || null,
      })),
    }));


    return questionsWithKioskDetails;
  }

}
