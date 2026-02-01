// SKTaxi: Firestore 실시간 구독을 위한 공통 훅
// 반복되는 구독 로직을 추상화하여 재사용성 향상

import { useState, useEffect, useRef, useCallback } from 'react';
import { Unsubscribe, SubscriptionCallbacks } from '../../repositories/interfaces';

/**
 * 구독 상태 타입
 */
export interface SubscriptionState<T> {
  data: T;
  loading: boolean;
  error: Error | null;
}

/**
 * 구독 함수 타입
 * Repository의 subscribe 메서드와 동일한 시그니처
 */
export type SubscribeFn<T> = (callbacks: SubscriptionCallbacks<T>) => Unsubscribe;

/**
 * Firestore 실시간 구독을 관리하는 공통 훅
 *
 * @param subscribeFn - Repository의 구독 메서드
 * @param initialValue - 초기값
 * @param enabled - 구독 활성화 여부 (기본값: true)
 * @returns 구독 상태 (data, loading, error)
 *
 * @example
 * const { data: parties, loading, error } = useFirestoreSubscription(
 *   (callbacks) => partyRepository.subscribeToParties(callbacks),
 *   []
 * );
 */
export function useFirestoreSubscription<T>(
  subscribeFn: SubscribeFn<T>,
  initialValue: T,
  enabled: boolean = true
): SubscriptionState<T> {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // 구독 해제 함수를 ref로 관리
  const unsubscribeRef = useRef<Unsubscribe | null>(null);
  // 마운트 상태 추적 (메모리 누수 방지)
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;

    if (!enabled) {
      // 구독 비활성화 시 상태 초기화
      setData(initialValue);
      setLoading(false);
      setError(null);

      // 기존 구독 해제
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }

      return;
    }

    setLoading(true);
    setError(null);

    // 구독 시작
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

    // 클린업
    return () => {
      isMountedRef.current = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- initialValue는 초기값으로만 사용되며 변경 시 재구독 불필요
  }, [subscribeFn, enabled]);

  return { data, loading, error };
}

/**
 * 조건부 구독을 위한 확장 훅
 * 조건이 충족될 때만 구독을 시작
 *
 * @param condition - 구독 조건
 * @param subscribeFn - 구독 함수 팩토리
 * @param initialValue - 초기값
 */
export function useConditionalSubscription<T, D extends unknown[]>(
  condition: boolean,
  subscribeFn: () => SubscribeFn<T>,
  initialValue: T,
  deps: D
): SubscriptionState<T> {
  // deps를 메모이제이션하여 subscribeFn 안정화
  const stableSubscribeFn = useCallback(() => {
    if (!condition) {
      // 조건 미충족 시 빈 구독 반환
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
