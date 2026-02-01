// SKTaxi: Board 관련 훅 통합 내보내기

export { useBoardPosts } from './useBoardPosts';
export type { UseBoardPostsResult } from './useBoardPosts';

export { useBoardPost } from './useBoardPost';
export type { UseBoardPostResult } from './useBoardPost';

export { usePostActions } from './usePostActions';
export type { UsePostActionsResult } from './usePostActions';

export { useBoardComments } from './useBoardComments';
export type { UseBoardCommentsResult, CommentTreeNodeWithAnonymousOrder } from './useBoardComments';

export { useBoardWrite } from './useBoardWrite';
export type { UseBoardWriteResult } from './useBoardWrite';

export { useBoardEdit } from './useBoardEdit';
export type { UseBoardEditResult } from './useBoardEdit';

export { useBoardCategoryCounts } from './useBoardCategoryCounts';
export type { UseBoardCategoryCountsResult } from './useBoardCategoryCounts';

export { useUserBoardInteractions } from './useUserBoardInteractions';
export type { UseUserBoardInteractionsResult } from './useUserBoardInteractions';
