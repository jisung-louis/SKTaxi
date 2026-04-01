export type NoticeStackParamList = {
  NoticeMain: undefined;
  NoticeSearch:
    | {
        initialQuery?: string;
      }
    | undefined;
  NoticeDetail: {
    initialCommentId?: string;
    noticeId: string;
  };
};
