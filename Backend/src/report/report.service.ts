import { PrismaClient } from '@prisma/client';
import { subMinutes } from 'date-fns';
export class ReportService {

  private prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient()
  }

  async dashboardAnalytics() {
    const totalLowInventoryKiosk = await this.prisma.kiosk.count({
      where: {
        isDeleted: false, OR: [
          { scented: { lte: 20 } },
          { unscented: { lte: 20 } }
        ]
      }
    });
    const total = await this.prisma.kiosk.count({ where: { isDeleted: false } });
    const online = await this.prisma.kiosk.count({ where: { lastSeen: { gte: subMinutes(new Date(), 6) }, isDeleted: false } });
    const offline = await this.prisma.kiosk.count({ where: { lastSeen: { lte: subMinutes(new Date(), 6) }, isDeleted: false } });

    const totalCustomers = await this.prisma.customer.count();
    const totalClients = await this.prisma.users.count();

    return {
      kiosk: { total, online, offline },
      totalClients,
      totalCustomers,
      totalLowInventoryKiosk,
    };

  }

  async analytics({ from, to, kiosks, customerId, take, skip }: { from: Date | null, to: Date | null, kiosks: string | null, customerId: string | null, take: number, skip: number }) {

    let ids = []

    if (kiosks) ids = kiosks?.split(",")
    else ids = (await this.prisma.kiosk.findMany({ where: { customerId, isDeleted: false }, select: { macId: true } })).map(e => e.macId)

    const time = { gte: from, lte: to }
    const reports = []
    for await (const kioskId of ids) {
      const kiosk = await this.prisma.kiosk.findFirst({ where: { macId: kioskId }, select: { name: true } })
      if (!kiosk) continue
      const [scented, unscented, success, failed] = await this.prisma.$transaction([
        this.prisma.transaction.aggregate({ _sum: { quantity: true }, where: { kioskId, tissueType: "scented", time } }),
        this.prisma.transaction.aggregate({ _sum: { quantity: true }, where: { kioskId, tissueType: "unscented", time } }),
        this.prisma.transaction.aggregate({ _count: { status: true }, where: { kioskId, status: "SUCCESS", time } }),
        this.prisma.transaction.aggregate({ _count: { status: true }, where: { kioskId, status: "FAILED", time } })
      ])
      const totalEnv = await this.prisma.transaction.groupBy({ by: ['quoteId'], where: { kioskId, time, quoteId: { not: null } }, _count: { quoteId: true } })
      const totalSurvey = await this.prisma.transaction.groupBy({ by: ['questionId'], where: { kioskId, time, questionId: { not: null } }, _count: { questionId: true } })

      const surveys = []
      const envMsg = []
      for await (const survey of totalSurvey) {
        const { question } = await this.prisma.question.findFirst({ where: { id: survey.questionId }, select: { question: true } })
        let selectedAnswers = await this.prisma.transaction.groupBy({ by: ['selectedAnswer'], where: { kioskId, time, questionId: survey.questionId, selectedAnswer: { not: null } }, _count: { selectedAnswer: true } })
        const answers = selectedAnswers.map((e) => { return { count: e._count.selectedAnswer, answer: e.selectedAnswer } })
        surveys.push({ count: survey._count.questionId, question, answers })
      }
      for await (const msg of totalEnv) {
        const { quote } = await this.prisma.quote.findFirst({ where: { id: msg.quoteId }, select: { quote: true } })
        envMsg.push({ count: msg._count.quoteId, quote })
      }
      const data = {
        name: kiosk.name,
        scented: scented._sum?.quantity ?? 0,
        unscented: unscented._sum?.quantity ?? 0,
        success: success._count?.status ?? 0,
        failed: failed._count?.status ?? 0,
        surveys,
        env: envMsg
      }
      reports.push(data)
    }
    
    return reports;
  }

}
