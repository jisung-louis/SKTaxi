import type {ContentDetailBodyBlockViewData} from '@/shared/types/contentDetailViewData';

export interface NoticeDetailCommentSourceItem {
  authorName: string;
  content: string;
  id: string;
  likeCount: number;
  postedAt: string;
}

export interface NoticeDetailAttachmentSourceItem {
  fileName: string;
  id: string;
  sizeLabel: string;
}

export interface NoticeDetailSourceItem {
  attachments: NoticeDetailAttachmentSourceItem[];
  bodyBlocks: ContentDetailBodyBlockViewData[];
  bookmarkCount: number;
  category: string;
  comments: NoticeDetailCommentSourceItem[];
  id: string;
  isNew: boolean;
  likeCount: number;
  postedAt: string;
  title: string;
}
