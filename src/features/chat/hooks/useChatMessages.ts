import { useCallback, useEffect, useRef, useState } from 'react';

import type { ChatMessage } from '../model/types';

import { useChatRepository } from './useChatRepository';

const MESSAGES_PER_PAGE = 30;

export interface UseChatMessagesResult {
  messages: ChatMessage[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: Error | null;
  loadMore: () => Promise<void>;
}

export const useChatMessages = (
  chatRoomId: string | undefined,
  enabled: boolean = true,
): UseChatMessagesResult => {
  const chatRepository = useChatRepository();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const oldestCursorRef = useRef<unknown>(null);
  const newestTimestampRef = useRef<unknown>(null);
  const realtimeUnsubscribeRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef(true);

  const loadInitialMessages = useCallback(
    async (roomId: string) => {
      try {
        setLoading(true);
        setError(null);

        const result = await chatRepository.getInitialMessages(roomId, MESSAGES_PER_PAGE);

        if (!isMountedRef.current) {
          return;
        }

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
        newestTimestampRef.current = result.data[0]?.createdAt ?? null;

        if (newestTimestampRef.current) {
          realtimeUnsubscribeRef.current = chatRepository.subscribeToNewMessages(
            roomId,
            newestTimestampRef.current,
            {
              onNewMessages: newMessages => {
                if (!isMountedRef.current) {
                  return;
                }

                setMessages(prevMessages => {
                  const existingIds = new Set(prevMessages.map(message => message.id));
                  const uniqueNewMessages = newMessages.filter(
                    message => !existingIds.has(message.id),
                  );

                  if (uniqueNewMessages.length === 0) {
                    return prevMessages;
                  }

                  newestTimestampRef.current =
                    uniqueNewMessages[uniqueNewMessages.length - 1]?.createdAt ?? null;

                  return [...uniqueNewMessages, ...prevMessages];
                });
              },
              onError: err => {
                console.error('실시간 메시지 구독 실패:', err);
              },
            },
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
    [chatRepository],
  );

  const loadMore = useCallback(async () => {
    if (!chatRoomId || loadingMore || !hasMore || !oldestCursorRef.current) {
      return;
    }

    try {
      setLoadingMore(true);

      const result = await chatRepository.getOlderMessages(
        chatRoomId,
        oldestCursorRef.current,
        MESSAGES_PER_PAGE,
      );

      if (!isMountedRef.current) {
        return;
      }

      if (result.data.length === 0) {
        setHasMore(false);
        return;
      }

      setMessages(prevMessages => {
        const existingIds = new Set(prevMessages.map(message => message.id));
        const uniqueMessages = result.data.filter(message => !existingIds.has(message.id));

        if (uniqueMessages.length === 0) {
          setHasMore(false);
          return prevMessages;
        }

        return [...prevMessages, ...uniqueMessages];
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
  }, [chatRepository, chatRoomId, hasMore, loadingMore]);

  useEffect(() => {
    isMountedRef.current = true;

    if (!chatRoomId || !enabled) {
      setMessages([]);
      setLoading(false);
      setHasMore(true);
      oldestCursorRef.current = null;
      newestTimestampRef.current = null;
      realtimeUnsubscribeRef.current?.();
      realtimeUnsubscribeRef.current = null;
      return;
    }

    loadInitialMessages(chatRoomId);

    return () => {
      isMountedRef.current = false;
      realtimeUnsubscribeRef.current?.();
      realtimeUnsubscribeRef.current = null;
    };
  }, [chatRoomId, enabled, loadInitialMessages]);

  return { messages, loading, loadingMore, hasMore, error, loadMore };
};
