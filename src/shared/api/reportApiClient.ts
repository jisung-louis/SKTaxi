import type {ApiSuccessResponse} from './apiResponse';
import {httpClient} from './httpClient';

export type ReportTargetTypeDto = 'COMMENT' | 'MEMBER' | 'POST';

export interface CreateReportRequestDto {
  category: string;
  reason: string;
  targetId: string;
  targetType: ReportTargetTypeDto;
}

export interface CreateReportResponseDto {
  createdAt: string;
  id: string;
  status: string;
}

export class ReportApiClient {
  createReport(data: CreateReportRequestDto) {
    return httpClient.post<
      ApiSuccessResponse<CreateReportResponseDto>,
      CreateReportRequestDto
    >('/v1/reports', data);
  }
}

export const reportApiClient = new ReportApiClient();
