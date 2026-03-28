export type NoticeStackParamList = {
  NoticeMain: undefined;
  NoticeSearch:
    | {
        initialQuery?: string;
      }
    | undefined;
  NoticeDetail: { noticeId: string };
};
