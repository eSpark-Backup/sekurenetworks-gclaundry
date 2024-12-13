import { PrismaClient } from '@prisma/client';
import { subMinutes } from 'date-fns';
import { jsPDF } from 'jspdf';
import { Response } from 'express';

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


  async getTransactionsDetail({
    from,
    to,
    kiosks,
    customerId,
    take,
    skip
  }: {
    from: Date | null,
    to: Date | null,
    kiosks: string | null,
    customerId: string | null,
    take: number,
    skip: number
  }, res: Response) {
    let ids = [];

    if (take) take = Number(take);
    if (skip) skip = Number(skip);

    if (kiosks) {
      ids = kiosks?.split(",");
    } else {
      ids = (
        await this.prisma.kiosk.findMany({
          where: { customerId, isDeleted: false },
          select: { macId: true },
          skip: skip * take,
          take,
        })
      ).map((e) => e.macId);
    }

    const count = await this.prisma.kiosk.count({
      where: { customerId, isDeleted: false },
    });

    const time = { gte: from, lte: to };
    const reports = [];

    for await (const kioskId of ids) {
      const kiosk = await this.prisma.kiosk.findFirst({
        where: { macId: kioskId },
        select: { name: true },
      });
      if (!kiosk) continue;

      // Fetch all transaction data for the current kiosk
      const transactions = await this.prisma.transaction.findMany({
        where: { kioskId, time },
        include: {
          kiosk: true,
          question: true,
          quote: true,
        },
      });

      const data = {
        kiosk: {
          id: kioskId,
          name: kiosk.name,
        },
        transactions: transactions.map((transaction) => ({
          id: transaction.id,
          quantity: transaction.quantity,
          tissueType: transaction.tissueType,
          status: transaction.status,
          selectedAnswer: transaction.selectedAnswer,
          error: transaction.error,
          questionId: transaction.questionId,
          quoteId: transaction.quoteId,
          time: transaction.time,
          kioskId: transaction.kioskId,
          question: transaction.question,
          quote: transaction.quote,
        })),
      };

      reports.push(data);
    }



    const doc = new jsPDF();

    // Set the title with center alignment
    doc.setFontSize(18);
    doc.text('Transactions Report', 105, 10, { align: 'center' });

    let yPosition = 20;  // Start from this Y-position for the body

    // Iterate through the data and add it to the PDF
    reports.forEach((report) => {
      doc.setFontSize(14);

      // Kiosk Name (Center aligned)
      if (yPosition > 270) {  // Check for page overflow before printing
        doc.addPage();
        yPosition = 10;  // Reset Y position to top of the new page
      }
      doc.text(`Kiosk: ${report.kiosk.name}`, 105, yPosition, { align: 'center' });
      yPosition += 10;

      if (report.transactions.length === 0) {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 10;  // Reset Y position to top of the new page
        }
        doc.text('No transactions found', 105, yPosition, { align: 'center' });
        yPosition += 10;
      }

      // Transaction details (Left aligned)
      report.transactions.forEach((transaction) => {

        // Check for page overflow before each text block
        const transactionDetails = [
          `Transaction ID: ${transaction.id}`,
          `Quantity: ${transaction.quantity}`,
          `Tissue Type: ${transaction.tissueType}`,
          `Status: ${transaction.status}`,
          `Error: ${transaction.error || "empty"}`,
          `Time: ${new Date(transaction.time).toLocaleString("en-US", {hour12: true })}`,
        ];


        // Check each line of transaction text
        transactionDetails.forEach((line) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 10;
          }
          doc.text(line, 10, yPosition);
          yPosition += 8;
        });

        // Handle wrapping for long "Question" text
        const questionLines = doc.splitTextToSize(`Question: ${transaction.question?.question || "empty"}`, 180);
        if (yPosition + questionLines.length * 5 > 270) {
          doc.addPage();
          yPosition = 10;  // Reset Y position to top of the new page
        }
        doc.text(questionLines, 10, yPosition);
        yPosition += questionLines.length * 8;  // Adjust Y position based on number of lines


        // Handle options text
        const optionsText = `Options: ${transaction.question?.options
          ?.map((e, index) => `${index + 1}. ${e.option}`)
          .join(", ") || "None"}`;
        const optionsLines = doc.splitTextToSize(optionsText, 180);
        if (yPosition + optionsLines.length * 8  > 270) {
          doc.addPage();
          yPosition = 10; // Reset Y position to top of the new page
        }
        doc.text(optionsLines, 10, yPosition);
        yPosition += optionsLines.length * 8 ;

        // Handle valid answer text
        const validAnswer = transaction.question?.options.find((e) => e.is_valid)?.option || "None";
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 10; // Reset Y position to top of the new page
        }
        doc.text(`Valid Answer: ${validAnswer}`, 10, yPosition);
        yPosition += 8;


        if (yPosition > 270) {
          doc.addPage();
          yPosition = 10;
        }
        doc.text(`Selected Answer: ${transaction.selectedAnswer}`, 10, yPosition);
        yPosition += 8;

        // Handle wrapping for long "Quote" text
        const quoteLines = doc.splitTextToSize(`Quote: ${transaction.quote?.quote || "empty"}`, 180);
        if (yPosition + quoteLines.length * 8 > 270) {
          doc.addPage();
          yPosition = 10;  // Reset Y position to top of the new page
        }
        doc.text(quoteLines, 10, yPosition);
        yPosition += quoteLines.length * 8;  // Adjust Y position based on number of lines

        yPosition += 15;  // Space between transactions
      });
    });




    // Send the PDF as a downloadable file
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=transactions-report.pdf',
    });

    res.send(doc.output());

  }
}



