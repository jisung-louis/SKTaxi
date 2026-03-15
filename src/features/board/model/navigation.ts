export type BoardStackParamList = {
  BoardMain:
    | {
        fromHashtag?: boolean;
        searchText?: string;
      }
    | undefined;
  BoardDetail: {postId: string};
  BoardWrite: undefined;
  BoardEdit: {postId: string};
};
