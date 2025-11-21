import { useState, useEffect, useRef, useCallback } from 'react';
import database from '@react-native-firebase/database';
import { getApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore, { doc, serverTimestamp, updateDoc } from '@react-native-firebase/firestore';

type Direction = 'mc_to_app' | 'app_to_mc' | 'system';

export type MinecraftRealtimeMessage = {
  id: string;
  username: string;
  message: string;
  timestamp: number;
  direction: Direction;
  appUserId?: string;
  appUserDisplayName?: string;
  uuid?: string;
};

type UseMinecraftMessagesReturn = {
  messages: MinecraftRealtimeMessage[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: Error | null;
  loadMore: () => Promise<void>;
};

const DEFAULT_LIMIT = 200;
const MC_MESSAGES_PATH = 'mc_chat/messages';

const snapshotToMessage = (snapshot: any): MinecraftRealtimeMessage => {
  const value = snapshot.val() as Record<string, any> | null;
  if (!value) {
    throw new Error('잘못된 메시지 스냅샷입니다.');
  }

  const directionValue = value.direction;
  const direction: Direction =
    directionValue === 'system'
      ? 'system'
      : directionValue === 'app_to_mc'
        ? 'app_to_mc'
        : 'mc_to_app';

  return {
    id: snapshot.key || '',
    username: value.username || '플레이어',
    message: value.message || '',
    timestamp: typeof value.timestamp === 'number' ? value.timestamp : Date.now(),
    direction,
    appUserId: value.appUserId,
    appUserDisplayName: value.appUserDisplayName,
    uuid: value.uuid,
  };
};

export function useMinecraftMessages(enabled: boolean, limit: number = DEFAULT_LIMIT): UseMinecraftMessagesReturn {
  const [messages, setMessages] = useState<MinecraftRealtimeMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const oldestTimestampRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setMessages([]);
      setLoading(false);
      setLoadingMore(false);
      setHasMore(true);
      setError(null);
      return;
    }

    setLoading(true);
    setLoadingMore(false);
    setHasMore(true);
    setError(null);

    const dbRef = database(getApp())
      .ref(MC_MESSAGES_PATH)
      .orderByChild('timestamp')
      .limitToLast(limit);

    const upsertMessage = (incoming: MinecraftRealtimeMessage) => {
      setMessages((prev) => {
        const existingIndex = prev.findIndex((msg) => msg.id === incoming.id);
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = incoming;
          const sorted = updated.sort((a, b) => a.timestamp - b.timestamp);
          oldestTimestampRef.current = sorted[0]?.timestamp ?? null;
          return sorted;
        }

        const next = [...prev, incoming].sort((a, b) => a.timestamp - b.timestamp);
        if (next.length > limit) {
          const sliced = next.slice(next.length - limit);
          oldestTimestampRef.current = sliced[0]?.timestamp ?? null;
          return sliced;
        }
        oldestTimestampRef.current = next[0]?.timestamp ?? null;
        return next;
      });
    };

    const removeMessage = (id: string) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    };

    const handleChildAdded = (snapshot: any) => {
      try {
        const message = snapshotToMessage(snapshot);
        upsertMessage(message);
      } catch (err) {
        console.error('마인크래프트 child_added 파싱 실패:', err);
        setError(err as Error);
      }
    };

    const handleChildChanged = (snapshot: any) => {
      try {
        const message = snapshotToMessage(snapshot);
        upsertMessage(message);
      } catch (err) {
        console.error('마인크래프트 child_changed 파싱 실패:', err);
        setError(err as Error);
      }
    };

    const handleChildRemoved = (snapshot: any) => {
      const key = snapshot.key;
      if (!key) return;
      removeMessage(key);
    };

    const handleError = (err: Error) => {
      console.error('마인크래프트 메시지 구독 실패:', err);
      setError(err);
      setLoading(false);
    };

    dbRef.on('child_added', handleChildAdded, handleError);
    dbRef.on('child_changed', handleChildChanged, handleError);
    dbRef.on('child_removed', handleChildRemoved, handleError);

    dbRef
      .once('value')
      .then((snapshot) => {
        const childCount = typeof snapshot.numChildren === 'function' ? snapshot.numChildren() : 0;
        if (childCount < limit) {
          setHasMore(false);
        }
        let earliestTimestamp: number | null = null;
        if (typeof snapshot.forEach === 'function') {
          snapshot.forEach((child: any): true | undefined => {
            try {
              const msg = snapshotToMessage(child);
              if (earliestTimestamp === null || msg.timestamp < earliestTimestamp) {
                earliestTimestamp = msg.timestamp;
              }
            } catch {
              // ignore parse errors during initialization
            }
            return undefined;
          });
        }
        oldestTimestampRef.current = earliestTimestamp;
      })
      .finally(() => {
        setLoading(false);
      })
      .catch((err) => {
        console.error('마인크래프트 메시지 초기 로드 실패:', err);
        setError(err as Error);
      });

    return () => {
      dbRef.off('child_added', handleChildAdded);
      dbRef.off('child_changed', handleChildChanged);
      dbRef.off('child_removed', handleChildRemoved);
    };
  }, [enabled, limit]);

  const loadMore = useCallback(async () => {
    if (!enabled || loadingMore || !hasMore || loading) {
      return;
    }
    const oldestTimestamp = oldestTimestampRef.current;
    if (!oldestTimestamp || oldestTimestamp <= 0) {
      setHasMore(false);
      return;
    }

    setLoadingMore(true);
    try {
      const snapshot = await database(getApp())
        .ref(MC_MESSAGES_PATH)
        .orderByChild('timestamp')
        .endAt(oldestTimestamp - 1)
        .limitToLast(limit)
        .once('value');

      if (!snapshot.exists()) {
        setHasMore(false);
        setLoadingMore(false);
        return;
      }

      const fetched: MinecraftRealtimeMessage[] = [];
      snapshot.forEach((child: any): true | undefined => {
        try {
          const message = snapshotToMessage(child);
          fetched.push(message);
        } catch (err) {
          console.error('이전 마인크래프트 메시지 파싱 실패:', err);
        }
        return undefined;
      });

      fetched.sort((a, b) => a.timestamp - b.timestamp);

      setMessages((prev) => {
        const existingIds = new Set(prev.map((msg) => msg.id));
        const prepend = fetched.filter((msg) => !existingIds.has(msg.id));
        if (prepend.length === 0) {
          return prev;
        }
        const combined = [...prepend, ...prev];
        oldestTimestampRef.current = combined[0]?.timestamp ?? null;
        return combined;
      });

      if (fetched.length < limit) {
        setHasMore(false);
      }
    } catch (err) {
      console.error('이전 마인크래프트 메시지 로드 실패:', err);
      setError(err as Error);
    } finally {
      setLoadingMore(false);
    }
  }, [enabled, hasMore, limit, loading, loadingMore]);

  return { messages, loading, loadingMore, hasMore, error, loadMore } as const;
}

export async function sendMinecraftMessage(chatRoomId: string, text: string): Promise<void> {
  const user = auth(getApp()).currentUser;
  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }

  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('메시지를 입력해주세요.');
  }

  try {
    const userDoc = await firestore(getApp()).collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    const displayName = userData?.displayName || userData?.nickname || user.email || '익명';

    await database(getApp()).ref(MC_MESSAGES_PATH).push({
      username: displayName,
      message: trimmed,
      timestamp: Date.now(),
      direction: 'app_to_mc',
      appUserId: user.uid,
      appUserDisplayName: displayName,
    });

    // Firestore 채팅방 메타데이터 업데이트 (목록 최신화)
    const chatRoomRef = doc(firestore(getApp()), 'chatRooms', chatRoomId);
    await updateDoc(chatRoomRef, {
      lastMessage: {
        text: trimmed,
        senderId: user.uid,
        senderName: displayName,
        timestamp: serverTimestamp(),
      },
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('마인크래프트 메시지 전송 실패:', error);
    throw error;
  }
}

