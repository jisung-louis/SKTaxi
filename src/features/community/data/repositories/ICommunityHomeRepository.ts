import type {
  CommunityBoardPageResult,
  CommunityBoardSearchFilters,
  CommunityChatRoomSourceItem,
} from '../../model/communityHomeData';

export interface GetCommunityBoardPostsParams {
  cursor?: string;
  filters: CommunityBoardSearchFilters;
  limit: number;
}

export interface ICommunityHomeRepository {
  getBoardPosts(
    params: GetCommunityBoardPostsParams,
  ): Promise<CommunityBoardPageResult>;
  getChatRooms(): Promise<CommunityChatRoomSourceItem[]>;
}
