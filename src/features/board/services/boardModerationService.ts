import {
  blockUser,
  createReport,
  shouldHideContent,
  type ReportCategory,
} from '@/shared/lib/moderation';

import type { BoardPost } from '../model/types';

export const BOARD_REPORT_CATEGORIES: ReportCategory[] = [
  '스팸',
  '욕설/혐오',
  '불법/위험',
  '음란물',
  '기타',
];

export async function getBoardHiddenAuthorMap(
  authorIds: string[],
): Promise<Record<string, boolean>> {
  if (authorIds.length === 0) {
    return {};
  }

  const decisions = await Promise.all(
    authorIds.map(async (authorId) => ({
      authorId,
      hide: await shouldHideContent(authorId),
    })),
  );

  return decisions.reduce<Record<string, boolean>>((acc, { authorId, hide }) => {
    acc[authorId] = hide;
    return acc;
  }, {});
}

export async function filterVisibleBoardPosts(posts: BoardPost[]): Promise<BoardPost[]> {
  if (posts.length === 0) {
    return posts;
  }

  const decisions = await Promise.all(
    posts.map(async (post) => ({
      post,
      hide: await shouldHideContent(post.authorId),
    })),
  );

  return decisions.filter(({ hide }) => !hide).map(({ post }) => post);
}

export function submitBoardPostReport(
  postId: string,
  authorId: string,
  category: ReportCategory,
): Promise<string> {
  return createReport({
    targetType: 'post',
    targetId: postId,
    targetAuthorId: authorId,
    category,
  });
}

export function submitBoardCommentReport(
  commentId: string,
  authorId: string,
  category: ReportCategory,
): Promise<string> {
  return createReport({
    targetType: 'comment',
    targetId: commentId,
    targetAuthorId: authorId,
    category,
  });
}

export function blockBoardAuthor(authorId: string): Promise<void> {
  return blockUser(authorId);
}
