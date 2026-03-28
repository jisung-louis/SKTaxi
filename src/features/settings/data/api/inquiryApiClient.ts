import {httpClient, type ApiSuccessResponse} from '@/shared/api';

import type {
  CreateInquiryRequestDto,
  InquiryCreateResponseDto,
  InquiryListItemResponseDto,
} from '../dto/inquiryDto';

export class InquiryApiClient {
  createInquiry(data: CreateInquiryRequestDto) {
    return httpClient.post<
      ApiSuccessResponse<InquiryCreateResponseDto>,
      CreateInquiryRequestDto
    >('/v1/inquiries', data);
  }

  getMyInquiries() {
    return httpClient.get<ApiSuccessResponse<InquiryListItemResponseDto[]>>(
      '/v1/inquiries/my',
    );
  }
}

export const inquiryApiClient = new InquiryApiClient();
