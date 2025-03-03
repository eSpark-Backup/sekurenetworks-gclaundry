import {
  Injectable,
  NotFoundException
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { MqttService } from 'src/mqtt/mqtt.service';
import { classYearOptions, ethnicityOptions, expectedMajorOptions, genderOptions } from 'src/kiosks/dto/const';
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

      const { gender, ethnicity, classYear, expectedMajor } = data

      if (gender && !genderOptions.includes(gender)) {
        return { message: "Gender is invalid", statusCode: 400 }
      }

      if (ethnicity && !ethnicityOptions.includes(ethnicity)) {
        return {
          message: "Ethnicity is invalid", statusCode: 400
        }
      }

      if (classYear && !classYearOptions.includes(classYear)) {
        return { message: "Class year is invalid", statusCode: 400 }
      }

      if (expectedMajor && !expectedMajorOptions.includes(expectedMajor)) {
        return { message: "Expected major is invalid", statusCode: 400 }
      }


      data.password = crypto.createHash('sha256').update(data.password).digest('hex')
      const client = await this.prisma.users.create({ data });
      await this.publishUsers(client.customerId)
      return { message: "Client created successfully", data: client, statusCode: 200 }
    } catch (error) {
      return { message: error.message, statusCode: 400 }
    }
  }

  async createMany(data: any) {
    try {
      const studentIds = data.map((student) => student.studentId).filter(Boolean);
      const emails = data.map((student) => student.email).filter(Boolean);
      const phones = data.map((student) => student.phone).filter(Boolean);

      const requiredFields = [
        'studentId', 'email', 'phone', 'password', 'classYear',
        'expectedMajor', 'scent', 'financialAid', 'ethnicity', 'customerId'
      ];

      const isMissingData = data.some(student =>
        requiredFields.some(field => !student[field])
      );

      if (isMissingData) {
        return { message: "Some fields are missing", statusCode: 400 }
      }


      const existingUsers = await this.prisma.users.findMany({
        where: {
          OR: [
            { studentId: { in: studentIds } },
            { email: { in: emails } },
            { phone: { in: phones } },
          ],
        },
        select: { studentId: true, email: true, phone: true },
      });


      if (existingUsers.length > 0) {
        return { message: "Some students already exist or duplicate entry", statusCode: 400 }
      }


      const existingCustomers = await this.prisma.customer.findMany({ where: { id: { in: data.map((client) => client?.customerId).filter(Boolean) } }, select: { id: true } });

      const existingCustomerIds = new Set(existingCustomers.map(customer => customer.id));

      const invalidClients = data.filter(client => !existingCustomerIds.has(client.customerId));

      if (invalidClients.length > 0) {
        return { message: "Some Customer ID does not exist or matched with current available customers", statusCode: 400 }
      }

      data.forEach((client) => {
        client.password = crypto.createHash('sha256').update
        (client.password).digest('hex');
      });

      const result = await this.prisma.users.createMany({ data });

      if (result.count > 0) {
        const customerIds = data.map((client) => client.customerId).filter(Boolean);
        for (const customerId of customerIds) {
          await this.publishUsers(customerId);
        }
      }

      return { message: "Clients uploaded successfully", statusCode: 200 }

    } catch (error) {
      return { message: "CSV data is invalid or internal server error", statusCode: 400 }
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
    const client = await this.prisma.users.findFirst({ where: { id }, include: { customer: true } });
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
