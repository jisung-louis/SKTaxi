import {httpClient, type ApiSuccessResponse} from '@/shared/api';

import type {
  CreateNoticeCommentRequestDto,
  NoticeBookmarkResponseDto,
  NoticeBookmarkSummaryDto,
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

interface GetMyNoticeBookmarksParams {
  page?: number;
  size?: number;
}

export class NoticeApiClient {
  bookmarkNotice(noticeId: string) {
    return httpClient.post<ApiSuccessResponse<NoticeBookmarkResponseDto>>(
      `/v1/notices/${noticeId}/bookmark`,
    );
  }

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

  getMyNoticeBookmarks(params?: GetMyNoticeBookmarksParams) {
    return httpClient.get<
      ApiSuccessResponse<NoticePageResponseDto<NoticeBookmarkSummaryDto>>
    >('/v1/members/me/notice-bookmarks', {
      params,
    });
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

  unbookmarkNotice(noticeId: string) {
    return httpClient.delete<ApiSuccessResponse<NoticeBookmarkResponseDto>>(
      `/v1/notices/${noticeId}/bookmark`,
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
