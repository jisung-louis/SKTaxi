import React from 'react';

import {useAuth} from '@/features/auth';

import {notificationApiClient} from '../data/api/notificationApiClient';

interface UseNotificationUnreadCountResult {
  count: number;
  error: string | null;
  loading: boolean;
  reload: () => Promise<void>;
}

export const useNotificationUnreadCount =
  (): UseNotificationUnreadCountResult => {
    const {user} = useAuth();
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
        const response = await notificationApiClient.getUnreadCount();
        setCount(response.data.count);
      } catch (loadError) {
        console.error('일반 알림 미읽음 수를 불러오지 못했습니다.', loadError);
        setError('일반 알림 미읽음 수를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    }, [user?.uid]);

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
