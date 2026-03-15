import type {ContentDetailBodyBlockViewData} from '@/shared/types/contentDetailViewData';

import type {CommunityBoardCategory} from '@/features/community/model/communityHomeData';

export interface BoardDetailCommentSourceItem {
  authorName: string;
  content: string;
  id: string;
  likeCount: number;
  postedAt: string;
}

export interface BoardDetailSourceItem {
  authorName: string;
  bodyBlocks: ContentDetailBodyBlockViewData[];
  bookmarkCount: number;
  category: CommunityBoardCategory;
  comments: BoardDetailCommentSourceItem[];
  createdAt: string;
  id: string;
  isAnonymous: boolean;
  likeCount: number;
  title: string;
}
