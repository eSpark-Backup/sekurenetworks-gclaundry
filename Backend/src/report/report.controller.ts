import { Controller, Get, Query } from '@nestjs/common';
import { ReportService } from './report.service';

@Controller()
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get()
  findAll() {
    return this.reportService.dashboardAnalytics();
  }

  @Get("/analytics")
  report(@Query() filter: { from: Date|null, to: Date|null, kiosks: string|null, customerId: string |null, take: number, skip: number }) {
    return this.reportService.analytics(filter);
  }
}
