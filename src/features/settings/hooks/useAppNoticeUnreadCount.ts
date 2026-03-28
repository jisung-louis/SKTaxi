import React from 'react';

import {useAuth} from '@/features/auth';
import {useAppNoticeRepository} from '@/di/useRepository';

interface UseAppNoticeUnreadCountResult {
  count: number;
  error: string | null;
  loading: boolean;
  reload: () => Promise<void>;
}

export const useAppNoticeUnreadCount =
  (): UseAppNoticeUnreadCountResult => {
    const {user} = useAuth();
    const appNoticeRepository = useAppNoticeRepository();
    const [count, setCount] = React.useState(0);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const load = React.useCallback(async () => {
      if (!user?.uid) {
        setCount(0);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const nextCount = await appNoticeRepository.getUnreadCount();
        setCount(nextCount);
      } catch (loadError) {
        console.error('앱 공지 미읽음 수를 불러오지 못했습니다.', loadError);
        setError('앱 공지 미읽음 수를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    }, [appNoticeRepository, user?.uid]);

    React.useEffect(() => {
      load().catch(() => undefined);
    }, [load]);

    return {
      count,
      error,
      loading,
      reload: load,
    };
  };
