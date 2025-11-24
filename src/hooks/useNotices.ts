import { useState, useEffect } from 'react';
import { getFirestore, collection, query, orderBy, limit, onSnapshot, doc, getDoc, setDoc, writeBatch, serverTimestamp, startAfter, getDocs, where, collectionGroup } from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';
import { getUserProfile } from '../libs/firebase';

export interface Notice {
  id: string;
  title: string;
  content: string;
  link: string;
  postedAt: any;
  category: string;
  createdAt: string;
  author: string;
  department: string;
  source: string;
  contentDetail: string;
  contentAttachments: { name: string; downloadUrl: string; previewUrl: string }[];
  likeCount?: number;
  commentCount?: number;
  viewCount?: number;
}

export const useNotices = (selectedCategory: string = '전체') => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [readStatus, setReadStatus] = useState<{[noticeId: string]: boolean}>({});
  const [userJoinedAt, setUserJoinedAt] = useState<any>(null);
  const [readStatusLoading, setReadStatusLoading] = useState<boolean>(true);
  const [userJoinedAtLoaded, setUserJoinedAtLoaded] = useState<boolean>(false);

  // 카테고리별 캐시
  const [categoryCache, setCategoryCache] = useState<Record<string, {
    items: Notice[];
    lastVisible: any;
    hasMore: boolean;
    initialized: boolean;
  }>>({});

  // SKTaxi: 초기 로드 (20개)
  useEffect(() => {
    const db = getFirestore();
    const catKey = selectedCategory || '전체';

    // 캐시에 있으면 즉시 반영
    const cached = categoryCache[catKey];
    if (cached && cached.initialized) {
      setNotices(cached.items);
      setLastVisible(cached.lastVisible);
      setHasMore(cached.hasMore);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    const noticesRef = collection(db, 'notices');
    const baseQuery = catKey === '전체'
      ? query(noticesRef, orderBy('postedAt', 'desc'), limit(20))
      : query(noticesRef, where('category', '==', catKey), orderBy('postedAt', 'desc'), limit(20));

    const unsubscribe = onSnapshot(
      baseQuery,
      (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
        const noticesData = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          likeCount: doc.data().likeCount || 0,
          commentCount: doc.data().commentCount || 0,
          viewCount: doc.data().viewCount || 0,
        })) as Notice[];

        setCategoryCache(prev => ({
          ...prev,
          [catKey]: {
            items: noticesData,
            lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
            hasMore: snapshot.docs.length === 20,
            initialized: true,
          },
        }));

        setNotices(noticesData);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMore(snapshot.docs.length === 20);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('공지사항 로드 실패:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [selectedCategory]);

  // SKTaxi: 현재 사용자의 읽음 상태 로드 (최적화됨)
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.log('❌ 사용자가 로그인되지 않음');
      setReadStatusLoading(false);
      return;
    }

    // SKTaxi: 현재 로드된 공지사항의 읽음 상태만 로드 (비용 최적화)
    const loadReadStatus = async () => {
      setReadStatusLoading(true);
      if (notices.length === 0) {
        setReadStatusLoading(false);
        return;
      }

      const db = getFirestore();
      // 기존에 알고 있는 읽음 캐시를 보존하여 재조회 방지
      const readStatusMap: { [noticeId: string]: boolean } = { ...readStatus };

      // 1) 가입일 이전 공지는 먼저 읽음으로 처리 (서버 조회 불필요)
      const joinedTs = typeof userJoinedAt?.toMillis === 'function'
        ? userJoinedAt.toMillis()
        : Number(userJoinedAt || 0);

      if (joinedTs) {
        notices.forEach((n) => {
          const postedTs = typeof n.postedAt?.toMillis === 'function'
            ? n.postedAt.toMillis()
            : Number(n.postedAt || 0);
          if (postedTs && postedTs <= joinedTs) {
            readStatusMap[n.id] = true;
          }
        });
      }

      // 2) 이미 읽음으로 캐시된 항목 제외 + 가입 이후 공지만 서버 조회
      const idsToFetch = notices
        .filter(n => !readStatusMap[n.id])
        .filter(n => {
          const postedTs = typeof n.postedAt?.toMillis === 'function'
            ? n.postedAt.toMillis()
            : Number(n.postedAt || 0);
          return !joinedTs || !postedTs || postedTs > joinedTs;
        })
        .map(n => n.id);

       if (idsToFetch.length > 0) {
         // 3) 10개씩 청크로 collectionGroup 쿼리 (왕복/비용 절감)
         const chunks: string[][] = [];
         for (let i = 0; i < idsToFetch.length; i += 10) {
           chunks.push(idsToFetch.slice(i, i + 10));
         }

         for (const ids of chunks) {
           try {
             const q = query(
               collectionGroup(db, 'readBy'),
               where('userId', '==', user.uid),
               where('noticeId', 'in', ids)
             );
             const snap = await getDocs(q);
            snap.forEach((d: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
               const data = d.data();
               const noticeId = data?.noticeId;
               if (typeof noticeId === 'string' && noticeId) {
                 readStatusMap[noticeId] = true;
               }
             });
           } catch (error) {
             console.error('읽음 상태 조회 실패 (청크):', error);
             // SKTaxi: 실패한 청크는 개별 조회로 폴백
             for (const noticeId of ids) {
               try {
                 const readStatusDocRef = doc(db, 'notices', noticeId, 'readBy', user.uid);
                 const readStatusDoc = await getDoc(readStatusDocRef);
                 if (readStatusDoc.exists()) {
                   readStatusMap[noticeId] = true;
                 }
               } catch (fallbackError) {
                 console.error(`읽음 상태 개별 조회 실패 (${noticeId}):`, fallbackError);
               }
             }
           }
         }
       }

      setReadStatus(readStatusMap);
    };
    
    loadReadStatus().finally(() => setReadStatusLoading(false));
  }, [notices, userJoinedAt]); // SKTaxi: notices나 userJoinedAt이 변경될 때 실행

  // SKTaxi: 사용자 가입 시각 로드
  useEffect(() => {
    const loadUserJoinedAt = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        setUserJoinedAt(null);
        setUserJoinedAtLoaded(true);
        return;
      }

      try {
        const userProfile = await getUserProfile(user.uid);
        setUserJoinedAt(userProfile?.joinedAt || null);
      } catch (error) {
        console.error('사용자 가입 시각 로드 실패:', error);
        setUserJoinedAt(null);
      } finally {
        setUserJoinedAtLoaded(true);
      }
    };

    loadUserJoinedAt();
  }, []); // SKTaxi: 컴포넌트 마운트 시 한 번만 실행

  // SKTaxi: 읽음 상태 새로고침
  const refreshReadStatus = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user || notices.length === 0) return;

    try {
      const db = getFirestore();
      const readStatusMap: { [noticeId: string]: boolean } = {};

      // 현재 로드된 공지사항들의 읽음 상태만 조회
      const readPromises = notices.map(async (notice) => {
        try {
          const readRef = doc(db, 'notices', notice.id, 'readBy', user.uid);
          const readDoc = await getDoc(readRef);
          return { noticeId: notice.id, isRead: readDoc.exists() };
        } catch (error) {
          console.error(`공지사항 ${notice.id} 읽음 상태 조회 실패:`, error);
          return { noticeId: notice.id, isRead: false };
        }
      });

      const readResults = await Promise.all(readPromises);
      readResults.forEach(({ noticeId, isRead }) => {
        readStatusMap[noticeId] = isRead;
      });

      setReadStatus(readStatusMap);
    } catch (error) {
      console.error('읽음 상태 새로고침 실패:', error);
    }
  };

  // SKTaxi: 더 많은 공지사항 로드 (페이지네이션)
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const db = getFirestore();
      const noticesRef = collection(db, 'notices');
      const catKey = selectedCategory || '전체';
      const q = catKey === '전체'
        ? query(noticesRef, orderBy('postedAt', 'desc'), startAfter(lastVisible), limit(20))
        : query(noticesRef, where('category', '==', catKey), orderBy('postedAt', 'desc'), startAfter(lastVisible), limit(20));
      const nextSnapshot = await getDocs(q);

      if (nextSnapshot.empty) {
        setHasMore(false);
        // 캐시 갱신
        setCategoryCache(prev => ({
          ...prev,
          [catKey]: { ...(prev[catKey] || { items: [], lastVisible: null, hasMore: false, initialized: true }), hasMore: false }
        }));
        return;
      }

      const newNotices = nextSnapshot.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
        const data: any = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          likeCount: data?.likeCount || 0,
          commentCount: data?.commentCount || 0,
        } as Notice;
      });

      setNotices(prev => {
        const merged = [...prev, ...newNotices];
        // 캐시 갱신
        setCategoryCache(prevCache => ({
          ...prevCache,
          [catKey]: {
            items: merged,
            lastVisible: nextSnapshot.docs[nextSnapshot.docs.length - 1] || null,
            hasMore: nextSnapshot.docs.length === 20,
            initialized: true,
          },
        }));
        return merged;
      });
      setLastVisible(nextSnapshot.docs[nextSnapshot.docs.length - 1] || null);
      setHasMore(nextSnapshot.docs.length === 20);
      
      // SKTaxi: 새로 로드된 공지들의 읽음 상태는 useEffect에서 자동으로 로드됨
    } catch (error) {
      console.error('더 많은 공지사항 로드 실패:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const markAsRead = async (noticeId: string) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        console.log('❌ 사용자가 로그인되지 않음');
        return;
      }

      // SKTaxi: 이미 읽음 상태라면 스킵 (중복 처리 방지)
      if (readStatus[noticeId]) {
        return;
      }

      // SKTaxi: 가입일 이전 공지인지 확인
      const notice = notices.find(n => n.id === noticeId);
      if (notice && userJoinedAt && notice.postedAt && notice.postedAt.toMillis) {
        if (notice.postedAt.toMillis() <= userJoinedAt.toMillis()) {
          // SKTaxi: 가입일 이전 공지는 로컬에서만 읽음 처리 (Firestore 저장 안 함)
          setReadStatus(prev => ({
            ...prev,
            [noticeId]: true
          }));
          return;
        }
      }

      // SKTaxi: 로컬 상태 먼저 업데이트 (즉시 UI 반영)
      setReadStatus(prev => ({
        ...prev,
        [noticeId]: true
      }));
      
      // SKTaxi: 백그라운드에서 Firestore 저장
      const db = getFirestore();
      const readStatusDocRef = doc(db, 'notices', noticeId, 'readBy', user.uid);
      
      const dataToSave = {
        userId: user.uid,
        noticeId: noticeId,
        isRead: true,
        readAt: serverTimestamp()
      };
      
      await setDoc(readStatusDocRef, dataToSave);
      
    } catch (error: any) {
      console.error('❌ 읽음 처리 실패:', error);
      // SKTaxi: 실패 시 로컬 상태 롤백
      setReadStatus(prev => ({
        ...prev,
        [noticeId]: false
      }));
    }
  };

  const markAllAsRead = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const joinedTs = typeof userJoinedAt?.toMillis === 'function'
        ? userJoinedAt.toMillis()
        : Number(userJoinedAt || 0);

      const db = getFirestore();
      const batch = writeBatch(db);
      let ops = 0;

      notices.forEach((notice) => {
        const postedTs = typeof notice.postedAt?.toMillis === 'function'
          ? notice.postedAt.toMillis()
          : Number(notice.postedAt || 0);

        // 가입 이후(postedTs > joinedTs)이면서 아직 읽음 처리 안 된 것만 저장
        const shouldPersist = (!readStatus[notice.id]) && (!postedTs || postedTs > joinedTs);
        if (shouldPersist) {
          const docRef = doc(db, 'notices', notice.id, 'readBy', user.uid);
          batch.set(docRef, {
            userId: user.uid,
            noticeId: notice.id,
            isRead: true,
            readAt: serverTimestamp(),
          });
          ops++;
        }
      });

      if (ops > 0) {
        await batch.commit();
      }

      // 로컬 상태는 전부 읽음으로 반영 (가입 전 공지는 이미 위 보정으로 true)
      setReadStatus((prev) => {
        const next = { ...prev } as { [id: string]: boolean };
        notices.forEach((n) => {
          const postedTs = typeof n.postedAt?.toMillis === 'function'
            ? n.postedAt.toMillis()
            : Number(n.postedAt || 0);
          if (!postedTs || postedTs > joinedTs) {
            next[n.id] = true;
          }
        });
        return next;
      });
    } catch (error) {
      console.error('모두 읽음 처리 실패:', error);
    }
  };

  // SKTaxi: 사용자 가입 시각 이후의 공지만 읽지 않은 공지로 계산
  const unreadCount = notices.filter(notice => {
    // 읽음 상태가 true면 읽지 않은 공지가 아님
    if (readStatus[notice.id]) return false;
    
    // SKTaxi: 사용자 가입 시각이 없으면 모든 공지를 읽지 않은 것으로 처리
    if (!userJoinedAt) return true;
    
    // SKTaxi: 공지 작성 시각이 사용자 가입 시각보다 이전이면 읽지 않은 공지가 아님
    if (notice.postedAt && notice.postedAt.toMillis) {
      return notice.postedAt.toMillis() > userJoinedAt.toMillis();
    }
    
    // SKTaxi: postedAt이 없으면 읽지 않은 공지로 처리 (안전장치)
    return true;
  }).length;

  return {
    notices,
    loading,
    loadingMore,
    error,
    hasMore,
    unreadCount,
    readStatus,
    markAsRead,
    markAllAsRead,
    loadMore,
    refreshReadStatus,
    userJoinedAt,
    readStatusLoading,
    userJoinedAtLoaded
  };
};
