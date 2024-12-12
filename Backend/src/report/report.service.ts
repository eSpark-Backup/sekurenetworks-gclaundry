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

async analytics({
  from,
  to,
  kiosks,
  customerId,
  take,
  skip,
}: {
  from: Date | null;
  to: Date | null;
  kiosks: string | null;
  customerId: string | null;
  take: number;
  skip: number;
}) {
  if (take) take = Number(take);
  if (skip) skip = Number(skip);

  const time = { gte: from, lte: to };

  // Fetch kiosk IDs
  const ids = kiosks
    ? kiosks.split(",")
    : (
        await this.prisma.kiosk.findMany({
          where: { customerId, isDeleted: false },
          select: { macId: true },
          skip: skip * take,
          take,
        })
      ).map((e) => e.macId);

     

  const count = await this.prisma.kiosk.count({
    where: { customerId, isDeleted: false },
  });

  if (!ids.length) {
    return { data: [], count };
  }

  // Pre-fetch all data in bulk
  const kiosksData = await this.prisma.kiosk.findMany({
    where: { macId: { in: ids } },
    select: { macId: true, name: true },
  });

  const transactions = await this.prisma.transaction.findMany({
    where: { kioskId: { in: ids }, time },
    select: {
      kioskId: true,
      tissueType: true,
      status: true,
      quoteId: true,
      questionId: true,
      selectedAnswer: true,
      quantity: true,
    },
  });

  const questionsMap = await this.prisma.question.findMany({
    where: { id: { in: transactions.map((t) => t.questionId).filter(Boolean) } },
    select: { id: true, question: true },
  });

  const quotesMap = await this.prisma.quote.findMany({
    where: { id: { in: transactions.map((t) => t.quoteId).filter(Boolean) } },
    select: { id: true, quote: true },
  });

  // Process data for each kiosk
  const reports = kiosksData.map((kiosk) => {
    const kioskTransactions = transactions.filter((t) => t.kioskId === kiosk.macId);
 
   let SCENTED = "scented";
   let UNSCENTED = "unscented";


    // Aggregations
    const scented = kioskTransactions
      .filter((t) => t.tissueType === SCENTED)
      .reduce((sum, t) => sum + (t.quantity || 0), 0);
    const unscented = kioskTransactions
      .filter((t) => t.tissueType === UNSCENTED)
      .reduce((sum, t) => sum + (t.quantity || 0), 0);
    const success = kioskTransactions.filter((t) => t.status === "SUCCESS").length;
    const failed = kioskTransactions.filter((t) => t.status === "FAILED").length;

    // Environmental messages
    const envMsg = kioskTransactions
      .filter((t) => t.quoteId)
      .reduce((acc, t) => {
        const quote = quotesMap.find((q) => q.id === t.quoteId);
        if (quote) {
          const existing = acc.find((e) => e.quote === quote.quote);
          if (existing) existing.count += 1;
          else acc.push({ quote: quote.quote, count: 1 });
        }
        return acc;
      }, []);

    // Surveys
    const surveys = kioskTransactions
      .filter((t) => t.questionId)
      .reduce((acc, t) => {
        const question = questionsMap.find((q) => q.id === t.questionId);
        if (question) {
          let survey = acc.find((s) => s.question === question.question);
          if (!survey) {
            survey = { question: question.question, count: 0, answers: [] };
            acc.push(survey);
          }
          survey.count += 1;
          if (t.selectedAnswer) {
            const answer = survey.answers.find((a) => a.answer === t.selectedAnswer);
            if (answer) answer.count += 1;
            else survey.answers.push({ answer: t.selectedAnswer, count: 1 });
          }
        }
        return acc;
      }, []);

    return {
      name: kiosk.name,
      scented,
      unscented,
      success,
      failed,
      env: envMsg,
      surveys,
    };
  });

  return {
    data: reports,
    count,
  };
}




}
