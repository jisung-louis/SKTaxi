import { useEffect } from 'react';

import { incrementNoticeDetailView } from '../services/noticeReadStateService';
import { useNotice } from './useNotice';
import { useNoticeRepository } from './useNoticeRepository';

export const useNoticeDetail = (noticeId: string | undefined) => {
  const noticeRepository = useNoticeRepository();
  const detailState = useNotice(noticeId);

  useEffect(() => {
    incrementNoticeDetailView({
      noticeId,
      noticeRepository,
    }).catch((error) => {
      console.error('공지 조회수 증가 실패:', error);
    });
  }, [noticeId, noticeRepository]);

  return detailState;
};
