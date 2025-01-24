import { PrismaClient } from '@prisma/client';
import { subMinutes } from 'date-fns';
import { jsPDF } from 'jspdf';
import { Response } from 'express';
import autoTable from 'jspdf-autotable';

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

    const transactions = await this.prisma.transaction.findMany({
      where: { status: "SUCCESS" },
      select: { quantity: true },
    });

    const totalSuccessSheets = transactions.reduce((sum, t) => sum + (t.quantity || 0), 0);

    const totalWaterSaved = totalSuccessSheets * 4.78;
    const totalCarbonDioxideAvoided = totalSuccessSheets * 0.14;
    const totalPlasticSheetsEliminated = totalSuccessSheets * 0.031;


    return {
      kiosk: { total, online, offline },
      totalClients,
      totalCustomers,
      totalLowInventoryKiosk,
      totalSheetsUsed: totalSuccessSheets,
      totalWaterSaved,
      totalCarbonDioxideAvoided,
      totalPlasticSheetsEliminated
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

    if (!ids?.length) {
      return { data: [], count };
    }

    // Pre-fetch all data in bulk
    const kiosksData = await this.prisma.kiosk.findMany({
      where: { macId: { in: ids } },
      select: { macId: true, name: true },
    });

    const transactions = await this.prisma.transaction.findMany({
      where: { kioskId: { in: ids }, time },
      // select: {
      //   kioskId: true,
      //   tissueType: true,
      //   status: true,
      //   quoteId: true,
      //   questionId: true,
      //   selectedAnswer: true,
      //   quantity: true,
      // },
      include: {
        questions: {
          include: {
            question: true,
          }
        }
      },
    });

    // const questionsMap = await this.prisma.question.findMany({
    //   where: { id: { in: transactions.map((t) => t.questionId).filter(Boolean) } },
    //   select: { id: true, question: true },
    // });

    const quotesMap = await this.prisma.quote.findMany({
      where: { id: { in: transactions.map((t) => t.quoteId).filter(Boolean) } },
      select: { id: true, quote: true },
    });

    // Process data for each kiosk
    const reports = kiosksData.map((kiosk) => {
      const kioskTransactions = transactions.filter((t) => t.kioskId === kiosk.macId);

      let SCENTED = "scented";
      let UNSCENTED = "unscented";


      //Questions and Answers
      const KioksQuestion = kioskTransactions.map((t) => t.questions?.map((e) => {
        return {
          question: e.question,
          selectedAnswer: e.answer
        }
      }))

      // Flatten the array
      const flatKioksQuestion = KioksQuestion.flatMap(e => e)


      // Transform the data for the survey
      const surveys = Object.values(
        flatKioksQuestion.reduce((acc, { question, selectedAnswer }) => {
          const { id, question: questionText } = question;

          if (!acc[id]) {
            acc[id] = {
              question: questionText,
              count: 0,
              answers: {}
            };
          }

          acc[id].count += 1;
          acc[id].answers[selectedAnswer] = (acc[id].answers[selectedAnswer] || 0) + 1;

          return acc;
        }, {})
      ).map(({ question, count, answers }) => ({
        question,
        count,
        answers: Object.entries(answers).map(([answer, count]) => ({
          answer,
          count
        }))
      }));



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
      // const surveys = kioskTransactions
      //   .filter((t) => t.questionId)
      //   .reduce((acc, t) => {
      //     const question = questionsMap.find((q) => q.id === t.questionId);


      //     if (question) {
      //       let survey = acc.find((s) => s.question === question.question);
      //       if (!survey) {
      //         survey = { question: question.question, count: 0, answers: [] };
      //         acc.push(survey);
      //       }
      //       survey.count += 1;
      //       if (t.selectedAnswer) {
      //         const answer = survey.answers.find((a) => a.answer === t.selectedAnswer);
      //         if (answer) answer.count += 1;
      //         else survey.answers.push({ answer: t.selectedAnswer, count: 1 });
      //       }
      //     }
      //     return acc;
      //   }, []);



      return {
        id: kiosk.macId,
        name: kiosk.name,
        scented,
        unscented,
        success,
        failed,
        env: envMsg,
        surveys
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
          questions: {
            include: {
              question: true
            }
          },
          quote: true,
        },
      });

      //Questions and Answers
      // const KioksQuestion = transactions.map((t) => t.questions?.map((e) => {
      //   return {
      //     question: e.question.question,
      //     selectedAnswer: e.answer
      //   }
      // }))

      // console.log(KioksQuestion.flatMap(e => e));
      


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
          error: transaction.error,
          question1: transaction.questions?.map((e) => e.question.id)[0] || "N/A",
          selectedAnswer1: transaction.questions?.map((e) => e.answer)[0] || "N/A",
          question2: transaction.questions?.map((e) => e.question.id)[1] || "N/A",
          selectedAnswer2: transaction.questions?.map((e) => e.answer)[1] || "N/A",
          quoteId: transaction.quoteId,
          time: transaction.time,
          kioskId: transaction.kioskId,
          quote: transaction.quote,
        })),
      };

      reports.push(data);
    }




    const doc = new jsPDF({ orientation: 'landscape' });  // Create a new PDF document

    let isFirstPage = true;

    // Set the title with center alignment
    if (isFirstPage) {
      doc.setFontSize(18);
      doc.text('Transactions Report', doc.internal.pageSize.width / 2, 15, { align: 'center' });
      isFirstPage = false;
    }

    let yPosition = 30;  // Start from this Y-position for the body

    // Iterate through the reports for each kiosk
    reports.forEach((report) => {
      // Add kiosk name as a subtitle
      doc.setFontSize(14);
      doc.text(`Kiosk: ${report.kiosk.name}`, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
      yPosition += 10;

      if (report.transactions?.length === 0) {
        doc.setFontSize(12);
        doc.text('No transactions found', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
        yPosition += 15;
      } else {
        // Prepare data for the table
        const tableData = report.transactions.map(transaction => [
          transaction.id,
          transaction.quantity,
          transaction.tissueType,
          transaction.status,
          transaction.error || "N/A",
          new Date(transaction.time).toLocaleString("en-US", { hour12: true }),
          // transaction.question?.question || "N/A",
          transaction.question1 || "N/A",
          // (transaction.question?.options?.map((e, index) => `${index + 1}. ${e.option}`).join(", ")) || "None",
          // transaction.question?.options.find(e => e.is_valid)?.option || "None",
          transaction.selectedAnswer1 || "N/A",
          transaction.question2 || "N/A",
          transaction.selectedAnswer2 || "N/A",
          // transaction.quote?.quote || "N/A"
          transaction.quoteId || "N/A"
        ]);

        // Add the table
        autoTable(doc, {
          startY: yPosition,
          head: [['ID', 'Quantity', 'Type', 'Status', 'Error', 'Time', 'Question 1', 'Selected Answer 1', 'Question 2', 'Selected Answer 2', 'Quote']],
          body: tableData,
          didDrawPage: (data) => {
            // Re-add the title on each new page
            doc.setFontSize(10);
            // doc.text('Transactions Report', doc.internal.pageSize.width / 2, 15, { align: 'center' });
            doc.text(`Page ${data.pageNumber}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
          },
          styles: { fontSize: 8, cellPadding: 1.5 },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 15 },
            2: { cellWidth: 20 },
            3: { cellWidth: 20 },
            4: { cellWidth: 20 },
            5: { cellWidth: 30 },
            6: { cellWidth: 25 },
            7: { cellWidth: "auto" },
            8: { cellWidth: 25 },
            9: { cellWidth: "auto" },
            10: { cellWidth: 25 },
          },
          headStyles: { fillColor: [255, 7, 25], textColor: 255 },
          willDrawCell: (data) => {
            // Wrap text for certain columns
            if (data.section === 'body' && [6, 7, 8, 9, 10].includes(data.column.index)) {
              data.cell.styles.cellWidth = 'wrap';
            }
          },
        });

        // Update yPosition for the next kiosk's data
        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      // Add a page break if there's not enough space for the next kiosk's data
      if (yPosition > doc.internal.pageSize.height - 20) {
        doc.addPage();
        yPosition = 30;
      }
    });

    // Send the PDF as a downloadable file
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=transactions-report.pdf',
    });

    res.send(doc.output());

  }
}



