import {
  reportApiClient,
  ReportApiClient,
} from '@/shared/api/reportApiClient';

import type {
  CreateReportPayload,
  IReportRepository,
  ReportReceipt,
} from './IReportRepository';

export class SpringReportRepository implements IReportRepository {
  constructor(
    private readonly apiClient: ReportApiClient = reportApiClient,
  ) {}

  async createReport(payload: CreateReportPayload): Promise<ReportReceipt> {
    const response = await this.apiClient.createReport({
      category: payload.category,
      reason: payload.reason.trim(),
      targetId: payload.targetId,
      targetType: payload.targetType,
    });

    return response.data;
  }
}
