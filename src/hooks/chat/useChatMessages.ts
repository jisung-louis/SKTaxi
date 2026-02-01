// SKTaxi: 채팅 메시지 훅 - Repository 패턴 적용
// 페이지네이션과 실시간 구독을 결합한 채팅 메시지 관리

import { useState, useEffect, useCallback, useRef } from 'react';
import { useChatRepository } from '../../di';
import { ChatMessage } from '../../types/firestore';

const MESSAGES_PER_PAGE = 30;

export interface UseChatMessagesResult {
  messages: ChatMessage[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: Error | null;
  loadMore: () => Promise<void>;
}

/**
 * 채팅 메시지 훅 - Repository 패턴 사용
 *
 * @param chatRoomId - 채팅방 ID
 * @param enabled - 구독 활성화 여부
 * @returns 메시지 목록 및 페이지네이션 상태
 */
export function useChatMessages(
  chatRoomId: string | undefined,
  enabled: boolean = true
): UseChatMessagesResult {
  const chatRepository = useChatRepository();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // 커서 및 구독 관리를 위한 ref
  const oldestCursorRef = useRef<unknown>(null);
  const newestTimestampRef = useRef<unknown>(null);
  const realtimeUnsubscribeRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // 초기 메시지 로드
  const loadInitialMessages = useCallback(
    async (roomId: string) => {
      try {
        setLoading(true);
        setError(null);

        const result = await chatRepository.getInitialMessages(roomId, MESSAGES_PER_PAGE);

        if (!isMountedRef.current) {return;}

        if (result.data.length === 0) {
          setMessages([]);
          setHasMore(false);
          oldestCursorRef.current = null;
          newestTimestampRef.current = null;
          return;
        }

        setMessages(result.data);
        setHasMore(result.hasMore);
        oldestCursorRef.current = result.cursor;

        // 가장 최신 메시지의 타임스탬프 저장 (실시간 구독용)
        if (result.data.length > 0) {
          newestTimestampRef.current = result.data[0].createdAt;
        }

        // 실시간 구독 시작 (최신 메시지 이후의 새 메시지만)
        if (newestTimestampRef.current) {
          realtimeUnsubscribeRef.current = chatRepository.subscribeToNewMessages(
            roomId,
            newestTimestampRef.current,
            {
              onNewMessages: (newMessages: ChatMessage[]) => {
                if (!isMountedRef.current) {return;}

                setMessages((prev) => {
                  // 중복 제거
                  const existingIds = new Set(prev.map((msg) => msg.id));
                  const uniqueNewMessages = newMessages.filter(
                    (msg) => !existingIds.has(msg.id)
                  );

                  if (uniqueNewMessages.length === 0) {return prev;}

                  // inverted FlatList용: 새 메시지를 배열 앞에 추가
                  const updated = [...uniqueNewMessages, ...prev];

                  // 최신 타임스탬프 업데이트
                  if (uniqueNewMessages.length > 0) {
                    newestTimestampRef.current =
                      uniqueNewMessages[uniqueNewMessages.length - 1].createdAt;
                  }

                  return updated;
                });
              },
              onError: (err: Error) => {
                console.error('실시간 메시지 구독 실패:', err);
              },
            }
          );
        }
      } catch (err) {
        console.error('초기 메시지 로드 실패:', err);
        if (isMountedRef.current) {
          setError(err as Error);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [chatRepository]
  );

  // 이전 메시지 로드 (위로 스크롤 시)
  const loadMore = useCallback(async () => {
    if (!chatRoomId || loadingMore || !hasMore || !oldestCursorRef.current) {return;}

    try {
      setLoadingMore(true);

      const result = await chatRepository.getOlderMessages(
        chatRoomId,
        oldestCursorRef.current,
        MESSAGES_PER_PAGE
      );

      if (!isMountedRef.current) {return;}

      if (result.data.length === 0) {
        setHasMore(false);
        return;
      }

      setMessages((prev) => {
        // 중복 제거
        const existingIds = new Set(prev.map((msg) => msg.id));
        const uniqueNewMessages = result.data.filter((msg) => !existingIds.has(msg.id));

        if (uniqueNewMessages.length === 0) {
          setHasMore(false);
          return prev;
        }

        // inverted FlatList용: 이전 메시지를 배열 뒤에 추가
        return [...prev, ...uniqueNewMessages];
      });

      oldestCursorRef.current = result.cursor;
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('이전 메시지 로드 실패:', err);
      if (isMountedRef.current) {
        setError(err as Error);
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingMore(false);
      }
    }
  }, [chatRoomId, chatRepository, loadingMore, hasMore]);

  // 채팅방 변경 또는 활성화 상태 변경 시 처리
  useEffect(() => {
    isMountedRef.current = true;

    if (!chatRoomId || !enabled) {
      // 구독 비활성화: 상태 초기화
      setMessages([]);
      setLoading(false);
      setHasMore(true);
      oldestCursorRef.current = null;
      newestTimestampRef.current = null;

      if (realtimeUnsubscribeRef.current) {
        realtimeUnsubscribeRef.current();
        realtimeUnsubscribeRef.current = null;
      }
      return;
    }

    loadInitialMessages(chatRoomId);

    return () => {
      isMountedRef.current = false;
      if (realtimeUnsubscribeRef.current) {
        realtimeUnsubscribeRef.current();
        realtimeUnsubscribeRef.current = null;
      }
    };
  }, [chatRoomId, enabled, loadInitialMessages]);

  return { messages, loading, loadingMore, hasMore, error, loadMore };
}
