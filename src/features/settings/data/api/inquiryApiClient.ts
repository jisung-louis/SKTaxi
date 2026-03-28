import {httpClient, type ApiSuccessResponse} from '@/shared/api';

import type {
  CreateInquiryRequestDto,
  InquiryCreateResponseDto,
} from '../dto/inquiryDto';

export class InquiryApiClient {
  createInquiry(data: CreateInquiryRequestDto) {
    return httpClient.post<
      ApiSuccessResponse<InquiryCreateResponseDto>,
      CreateInquiryRequestDto
    >('/v1/inquiries', data);
  }
}

export const inquiryApiClient = new InquiryApiClient();
