import type {
  NoticeCommentDto,
  NoticeDetailDto,
  NoticeLikeResponseDto,
  NoticeReadResponseDto,
  NoticeSummaryDto,
} from '../dto/noticeDto';
import type {Notice, NoticeComment, NoticeAttachment} from '../../model/types';

const toDate = (value: string) => new Date(value);

const mapNoticeAttachments = (
  attachments: NoticeDetailDto['attachments'],
): NoticeAttachment[] =>
  attachments.map(attachment => ({
    downloadUrl: attachment.downloadUrl,
    name: attachment.name,
    previewUrl: attachment.previewUrl,
  }));

export const mapNoticeSummaryDto = (dto: NoticeSummaryDto): Notice => ({
  author: dto.author,
  category: dto.category,
  commentCount: dto.commentCount,
  content: dto.rssPreview,
  contentAttachments: [],
  contentDetail: '',
  createdAt: dto.postedAt,
  department: dto.department,
  id: dto.id,
  isLiked: dto.isLiked,
  isRead: dto.isRead,
  likeCount: dto.likeCount,
  link: '',
  postedAt: dto.postedAt,
  source: 'RSS',
  title: dto.title,
  viewCount: dto.viewCount,
});

export const mapNoticeDetailDto = (dto: NoticeDetailDto): Notice => ({
  author: dto.author,
  category: dto.category,
  commentCount: dto.commentCount,
  content: dto.rssPreview,
  contentAttachments: mapNoticeAttachments(dto.attachments),
  contentDetail: dto.bodyHtml,
  createdAt: dto.postedAt,
  department: dto.department,
  id: dto.id,
  isLiked: dto.isLiked,
  isRead: dto.isRead,
  likeCount: dto.likeCount,
  link: dto.link,
  postedAt: dto.postedAt,
  source: dto.source,
  title: dto.title,
  viewCount: dto.viewCount,
});

export const mapNoticeCommentDto = (
  noticeId: string,
  dto: NoticeCommentDto,
): NoticeComment => ({
  anonId: dto.isAnonymous
    ? `${noticeId}:${dto.anonymousOrder ?? dto.authorId ?? dto.id}`
    : undefined,
  anonymousOrder: dto.anonymousOrder ?? undefined,
  content: dto.content,
  createdAt: toDate(dto.createdAt),
  id: dto.id,
  isAnonymous: dto.isAnonymous,
  isDeleted: dto.isDeleted,
  noticeId,
  parentId: dto.parentId ?? null,
  replies: [],
  updatedAt: toDate(dto.updatedAt),
  userDisplayName: dto.authorName ?? '익명',
  userId: dto.authorId ?? '',
});

export const mapNoticeLikeResponseDto = (dto: NoticeLikeResponseDto) => ({
  isLiked: dto.isLiked,
  likeCount: dto.likeCount,
});

export const mapNoticeReadResponseDto = (dto: NoticeReadResponseDto) => ({
  isRead: dto.isRead,
  noticeId: dto.noticeId,
  readAt: dto.readAt,
});
