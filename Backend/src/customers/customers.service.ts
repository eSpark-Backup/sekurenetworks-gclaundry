import {
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { differenceInMinutes } from 'date-fns';

@Injectable()
export class CustomersService {

  private prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient()
  }

  async create(data: any) {
    const customer =  await this.prisma.customer.create({ data });
    return { message: "Customer Update Successfully", data: customer, statusCode: 200 }
  }

  async findAll(filter: { take: number, skip: number, name: string | null }) {

    let { take, skip, name } = filter
    if (take) take = Number(take)
    if (skip) skip = Number(skip)

    const [data, count] = await this.prisma.$transaction([
      this.prisma.customer.findMany({
        where: { schoolName: { contains: name, mode: "insensitive" } },
        include: { kiosks: {where: { isDeleted: false}, include: { customer: { select: { firstName: true, phone: true , id: true } }, onSiteContact: true }, } },
        skip,
        take
      }),
      this.prisma.customer.count({ where: { schoolName: { contains: name, mode: "insensitive" } }, })
    ])

    return { data, count };
  }

  async findOne(id: string) {

    let customer = await this.prisma.customer.findFirstOrThrow({
      where: { id },
      include: { kiosks: { where: { isDeleted: false} ,include: { customer: { select: { firstName: true, id: true } }, onSiteContact: true },} }
    });

    if (!customer) {
      throw new NotFoundException('Customer not found!');
    }

    customer.kiosks = customer.kiosks.map((kiosk) => {
      const mins = differenceInMinutes(new Date(), kiosk.lastSeen);
      return {
        ...kiosk,
        status: mins <= 6 ? "ONLINE" : "OFFLINE",
      };
    })

    return customer;

  }

  async update(id, updateCustomerDto: any) {

    let customer = await this.prisma.customer.findFirst({ where: { id } });

    if (!customer) {
      throw new NotFoundException('Customer not found!');
    }
    delete updateCustomerDto.kiosks
    customer =  await this.prisma.customer.update({
      data: { ...customer, ...updateCustomerDto, },
      where: { id }
    });
    
    return { message: "Customer Update Successfully", data: customer, statusCode: 200 }
  }

  async remove(id: string) {
    const customer = await this.prisma.customer.findFirst({ where: { id } });

    if (!customer) {
      throw new NotFoundException('Customer not found!');
    }
    await this.prisma.customer.delete({ where: { id } })
    return { message: "customer deleted successfully", statusCode: 200 }
  }
}
