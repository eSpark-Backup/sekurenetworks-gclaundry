import {
  Injectable,
  NotFoundException
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { MqttService } from 'src/mqtt/mqtt.service';
@Injectable()
export class ClientsService {

  private prisma: PrismaClient;
  constructor(
    private mqttService: MqttService
  ) {
    this.prisma = new PrismaClient()
  }

  async create(data: any) {
    try {

      const existingUser = await this.prisma.users.findFirst({
        where: {
          OR: [
            { studentId: data.studentId },
            { phone: data.phone },
            { email: data.email },
          ],
        },
      });


      if (existingUser) {
        let errorMessage = 'Student already exists with ';

        if (existingUser.studentId === data.studentId) {
          errorMessage += 'ID';
        } else if (existingUser.phone === data.phone) {
          errorMessage += 'Phone';
        } else if (existingUser.email === data.email) {
          errorMessage += 'Email';
        }
        return { message: errorMessage, statusCode: 400 };
      }


      data.password = crypto.createHash('sha256').update(data.password).digest('hex')
      const client = await this.prisma.users.create({ data });
      await this.publishUsers(client.customerId)
      return { message: "Client created successfully", data: client, statusCode: 200 }
    } catch (error) {

    }
  }
  async findAll(filter: { take: number, skip: number, email: string | null }) {
    let { take, skip, email } = filter
    if (take) take = Number(take)
    if (skip) skip = Number(skip)
    const [data, count] = await this.prisma.$transaction([
      this.prisma.users.findMany({ where: { email: { contains: email, mode: 'insensitive' } }, take, skip, select: { id: true, customer: true, firstName: true, lastName: true, email: true, phone: true, studentId: true } }),
      this.prisma.users.count({ where: { email: { contains: email, mode: 'insensitive' } } })
    ])
    return { data, count };
  }

  async findOne(id) {
    const client = await this.prisma.users.findFirst({ where: { id }, select: { id: true, customer: true, firstName: true, lastName: true, email: true, customerId: true, phone: true, studentId: true } });
    if (!client) throw new NotFoundException('Client not found!')
    return client;
  }

  formatPhoneNumber(phoneNumberString) {
    const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return null;
  }
  async findByTel(tel) {
    tel = tel.toString();
    tel = tel.replace('+1', '');
    console.log('+++ tel +++', { tel: this.formatPhoneNumber(tel) });
    // return this.clientModel.find({ tel: this.formatPhoneNumber(tel) });
    return [];
  }

  async update(id, data: any) {
    const client = await this.prisma.users.findFirst({ where: { id } });
    if (!client) throw new NotFoundException('Client not found!');

    if (data.studentId || data.phone || data.email) {
      const existingUser = await this.prisma.users.findFirst({
        where: {
          OR: [
            data.studentId ? { studentId: data.studentId } : null,
            data.phone ? { phone: data.phone } : null,
            data.email ? { email: data.email } : null,
          ].filter(Boolean), // Remove null values
          NOT: { id }, // Exclude the current user
        },
      });

      if (existingUser) {
        let errorMessage = 'Student already exists with ';
        if (existingUser.studentId === data.studentId) errorMessage += 'ID';
        else if (existingUser.phone === data.phone) errorMessage += 'Phone';
        else if (existingUser.email === data.email) errorMessage += 'Email';
       

        return { message: errorMessage, statusCode: 400 };
      }
    }




    if (data.password) data.password = crypto.createHash('sha256').update(data.password).digest('hex')
    data = await this.prisma.users.update({ data, where: { id } });
    await this.publishUsers(client.customerId)
    return { message: "Client updated successfully", data, statusCode: 200 }
  }

  async remove(id) {
    const client = await this.prisma.users.findFirst({ where: { id } });
    if (!client) throw new NotFoundException('Client not found!')
    await this.prisma.users.delete({ where: { id } });
    await this.publishUsers(client.customerId)
    return { message: "Client deleted successfully", statusCode: 200 }
  }

  async publishUsers(customerId: string) {
    let users = await this.prisma.users.findMany({ where: { customerId } })
    this.mqttService.publish(`users/${customerId}`, JSON.stringify(users));
  }
}
