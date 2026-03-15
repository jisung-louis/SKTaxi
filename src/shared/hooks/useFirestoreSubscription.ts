import { useCallback, useEffect, useRef, useState } from 'react';

import type { SubscriptionCallbacks, Unsubscribe } from '@/shared/types/subscription';

export interface SubscriptionState<T> {
  data: T;
  loading: boolean;
  error: Error | null;
}

export type SubscribeFn<T> = (callbacks: SubscriptionCallbacks<T>) => Unsubscribe;

export function useFirestoreSubscription<T>(
  subscribeFn: SubscribeFn<T>,
  initialValue: T,
  enabled: boolean = true,
): SubscriptionState<T> {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const unsubscribeRef = useRef<Unsubscribe | null>(null);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;

    if (!enabled) {
      setData(initialValue);
      setLoading(false);
      setError(null);

      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }

      return;
    }

    setLoading(true);
    setError(null);

    unsubscribeRef.current = subscribeFn({
      onData: (newData: T) => {
        if (isMountedRef.current) {
          setData(newData);
          setLoading(false);
        }
      },
      onError: (err: Error) => {
        if (isMountedRef.current) {
          setError(err);
          setLoading(false);
        }
      },
    });

    return () => {
      isMountedRef.current = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initialValue는 초기값으로만 사용되며 변경 시 재구독 불필요
  }, [enabled, subscribeFn]);

  return { data, loading, error };
}

export function useConditionalSubscription<T, D extends unknown[]>(
  condition: boolean,
  subscribeFn: () => SubscribeFn<T>,
  initialValue: T,
  deps: D,
): SubscriptionState<T> {
  const stableSubscribeFn = useCallback(() => {
    if (!condition) {
      return (callbacks: SubscriptionCallbacks<T>) => {
        callbacks.onData(initialValue);
        return () => {};
      };
    }

    return subscribeFn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [condition, ...deps]);

  return useFirestoreSubscription(stableSubscribeFn(), initialValue, condition);
}
