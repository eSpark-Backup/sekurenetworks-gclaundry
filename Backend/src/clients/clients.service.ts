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
      data.password = crypto.createHash('sha256').update(data.password).digest('hex')

      const kiosksConnect = data.kiosksIds?.map((id) => ({ macId: id })) || [];

      const client = await this.prisma.users.create({
        data: {
          ...data,
          kiosks: {
            connect: kiosksConnect,
          },
        },
      })

      // const client = await this.prisma.users.create({ data });
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
      this.prisma.users.findMany({ where: { email: { contains: email, mode: 'insensitive' } }, take, skip, select: { id: true, customer: true, firstName: true, lastName: true, email: true, } }),
      this.prisma.users.count({ where: { email: { contains: email, mode: 'insensitive' } } })
    ])
    return { data, count };
  }

  async findOne(id) {
    console.log('+++ id +++', id);

    const client = await this.prisma.users.findFirst({ where: { id }, include: { customer: true } });
    delete client.password;
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
    let questions = await this.prisma.users.findMany({ where: { customerId } })
    this.mqttService.publish(`users/${customerId}`, JSON.stringify(questions));
  }
}
