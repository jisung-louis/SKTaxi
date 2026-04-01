export type BoardStackParamList = {
  BoardMain:
    | {
        fromHashtag?: boolean;
        initialSegment?: 'board' | 'chat';
        searchText?: string;
      }
    | undefined;
  BoardDetail: {
    initialCommentId?: string;
    postId: string;
  };
  BoardWrite: undefined;
  BoardEdit: {postId: string};
};
