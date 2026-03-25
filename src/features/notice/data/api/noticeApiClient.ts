import {httpClient, type ApiSuccessResponse} from '@/shared/api';

import type {
  CreateNoticeCommentRequestDto,
  NoticeCommentDto,
  NoticeDetailDto,
  NoticeLikeResponseDto,
  NoticePageResponseDto,
  NoticeReadResponseDto,
  NoticeSummaryDto,
  UpdateNoticeCommentRequestDto,
} from '../dto/noticeDto';

interface GetNoticesParams {
  category?: string;
  search?: string;
  page?: number;
  size?: number;
}

export class NoticeApiClient {
  createComment(noticeId: string, data: CreateNoticeCommentRequestDto) {
    return httpClient.post<
      ApiSuccessResponse<NoticeCommentDto>,
      CreateNoticeCommentRequestDto
    >(`/v1/notices/${noticeId}/comments`, data);
  }

  deleteComment(commentId: string) {
    return httpClient.delete<ApiSuccessResponse<null>>(
      `/v1/notice-comments/${commentId}`,
    );
  }

  getComments(noticeId: string) {
    return httpClient.get<ApiSuccessResponse<NoticeCommentDto[]>>(
      `/v1/notices/${noticeId}/comments`,
    );
  }

  getNotice(noticeId: string) {
    return httpClient.get<ApiSuccessResponse<NoticeDetailDto>>(
      `/v1/notices/${noticeId}`,
    );
  }

  getNotices(params: GetNoticesParams) {
    return httpClient.get<
      ApiSuccessResponse<NoticePageResponseDto<NoticeSummaryDto>>
    >('/v1/notices', {
      params,
    });
  }

  likeNotice(noticeId: string) {
    return httpClient.post<ApiSuccessResponse<NoticeLikeResponseDto>>(
      `/v1/notices/${noticeId}/like`,
    );
  }

  markAsRead(noticeId: string) {
    return httpClient.post<ApiSuccessResponse<NoticeReadResponseDto>>(
      `/v1/notices/${noticeId}/read`,
    );
  }

  unlikeNotice(noticeId: string) {
    return httpClient.delete<ApiSuccessResponse<NoticeLikeResponseDto>>(
      `/v1/notices/${noticeId}/like`,
    );
  }

  updateComment(commentId: string, data: UpdateNoticeCommentRequestDto) {
    return httpClient.patch<
      ApiSuccessResponse<NoticeCommentDto>,
      UpdateNoticeCommentRequestDto
    >(`/v1/notice-comments/${commentId}`, data);
  }
}

export const noticeApiClient = new NoticeApiClient();
