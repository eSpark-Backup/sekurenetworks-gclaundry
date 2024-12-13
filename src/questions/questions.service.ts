import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { KioskService } from 'src/kiosks/kiosk.service';
import { MqttService } from 'src/mqtt/mqtt.service';

@Injectable()
export class QuestionsService {
  private prisma: PrismaClient;
  constructor(
    private kioskService: KioskService,
    private mqttService:MqttService
  ) {
    this.prisma = new PrismaClient()
  }

  async create(questionData: any) {
    const kiosk = await this.kioskService.findOne(questionData.kioskId);
    const question = await this.prisma.question.create({data:{
      isActive: questionData.isActive ?? true,
      question: questionData.question,
      kioskId: kiosk.macId,
      options: questionData.options,
    }});
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
    let updatedQustion = await this.prisma.question.update({data,where:{id}})
    await this.publishQuestion(question.kioskId)
    return updatedQustion;
  }
  async delete(id: string) {
    const question = await this.prisma.question.findFirst({where: { id }});
    if (!question) throw new NotFoundException('Question not found!');
    const count = await this.prisma.question.count({where: { kioskId:question.kioskId }});
    if(count <= 1) throw new BadRequestException("Atleast 1 qoute is required")
    let questions = await this.prisma.question.delete({ where: {id}})
    await this.publishQuestion(question.kioskId)
    return questions;
  }
  getAllQuestions(macID: string) {
    return this.prisma.question.findMany({
      where: { kioskId: macID},
    });
  }

  async publishQuestion(macId: string){
    let questions = await this.prisma.question.findMany({where:{ isActive:true ,kioskId:macId}})
    this.mqttService.publish(`survey/${macId}`,JSON.stringify(questions));
  }

}
