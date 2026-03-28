import {
  type ReportCategory,
} from '@/shared/lib/moderation';
import {reportApiClient} from '@/shared/api/reportApiClient';
import { authInstance } from '@/shared/lib/firebase';

import type { BoardPost } from '../model/types';
import { boardModerationRuntime } from '../data/composition/boardModerationRuntime';

export const BOARD_REPORT_CATEGORIES: ReportCategory[] = [
  '스팸',
  '욕설/혐오',
  '불법/위험',
  '음란물',
  '기타',
];

const getCurrentUserId = () => authInstance.currentUser?.uid;

export async function getBoardHiddenAuthorMap(
  authorIds: string[],
): Promise<Record<string, boolean>> {
  if (authorIds.length === 0) {
    return {};
  }

  const decisions = await Promise.all(
    authorIds.map(async (authorId) => ({
      authorId,
      hide: await boardModerationRuntime.shouldHideContent(
        authorId,
        getCurrentUserId(),
      ),
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
      hide: await boardModerationRuntime.shouldHideContent(
        post.authorId,
        getCurrentUserId(),
      ),
    })),
  );

  return decisions.filter(({ hide }) => !hide).map(({ post }) => post);
}

export function submitBoardPostReport(
  postId: string,
  category: ReportCategory,
  reason: string,
): Promise<string> {
  return reportApiClient
    .createReport({
      category,
      reason: reason.trim(),
      targetId: postId,
      targetType: 'POST',
    })
    .then(response => response.data.id);
}

export function submitBoardCommentReport(
  commentId: string,
  category: ReportCategory,
  reason: string,
): Promise<string> {
  return reportApiClient
    .createReport({
      category,
      reason: reason.trim(),
      targetId: commentId,
      targetType: 'COMMENT',
    })
    .then(response => response.data.id);
}

export function blockBoardAuthor(authorId: string): Promise<void> {
  return boardModerationRuntime.blockUser(authorId, getCurrentUserId());
}
