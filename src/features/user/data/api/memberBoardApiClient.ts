import {httpClient, type ApiSuccessResponse} from '@/shared/api';
import type {
  BoardPageResponseDto,
  BoardPostSummaryDto,
} from '@/features/board/data/dto/boardDto';

interface MemberBoardPageParams {
  page?: number;
  size?: number;
}

export class MemberBoardApiClient {
  getMyPosts(params?: MemberBoardPageParams) {
    return httpClient.get<
      ApiSuccessResponse<BoardPageResponseDto<BoardPostSummaryDto>>
    >('/v1/members/me/posts', {
      params,
    });
  }

  getMyBookmarks(params?: MemberBoardPageParams) {
    return httpClient.get<
      ApiSuccessResponse<BoardPageResponseDto<BoardPostSummaryDto>>
    >('/v1/members/me/bookmarks', {
      params,
    });
  }
}

export const memberBoardApiClient = new MemberBoardApiClient();
