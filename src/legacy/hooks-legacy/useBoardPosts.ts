/**
 * @deprecated 이 훅은 Firebase 직접 접근으로 DIP 원칙 위반.
 * 새로운 코드에서는 hooks/board/useBoardPosts 사용 권장.
 * import { useBoardPosts } from '../hooks/board';
 */

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  startAfter
} from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { BoardPost, BoardSearchFilters } from '../../types/board';
import { db } from '../../config/firebase';

const POSTS_PER_PAGE = 20;

/** @deprecated hooks/board/useBoardPosts 사용 권장 */
export const useBoardPosts = (filters: BoardSearchFilters = { sortBy: 'latest' }) => {
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState<FirebaseFirestoreTypes.QueryDocumentSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  const buildQuery = useCallback(() => {
    let q = query(collection(db, 'boardPosts'));

    // 삭제되지 않은 게시글만 조회
    q = query(q, where('isDeleted', '==', false));

    // 카테고리 필터
    if (filters.category) {
      q = query(q, where('category', '==', filters.category));
    }

    // 작성자 필터
    if (filters.authorId) {
      q = query(q, where('authorId', '==', filters.authorId));
    }

    // 정렬
    switch (filters.sortBy) {
      case 'latest':
        q = query(q, orderBy('createdAt', 'desc'));
        break;
      case 'popular':
        q = query(q, orderBy('likeCount', 'desc'), orderBy('createdAt', 'desc'));
        break;
      case 'mostCommented':
        q = query(q, orderBy('commentCount', 'desc'), orderBy('createdAt', 'desc'));
        break;
      case 'mostViewed':
        q = query(q, orderBy('viewCount', 'desc'), orderBy('createdAt', 'desc'));
        break;
    }

    return query(q, limit(POSTS_PER_PAGE));
  }, [filters]);

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const q = buildQuery();
      const snapshot = await getDocs(q);
      
      const postsData: BoardPost[] = [];
      snapshot.forEach((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
        const data: any = docSnap.data();
        postsData.push({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastCommentAt: data.lastCommentAt?.toDate(),
        } as BoardPost);
      });

      // 클라이언트 사이드 검색어 필터링
      let filteredPosts = postsData;
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        filteredPosts = postsData.filter(post => {
          // 일반 텍스트 검색
          const textMatch = post.title.toLowerCase().includes(searchLower) ||
                           post.content.toLowerCase().includes(searchLower) ||
                           post.authorName.toLowerCase().includes(searchLower);
          
          // 해시태그 검색 (검색어가 #으로 시작하는 경우)
          const hashtagMatch = searchLower.startsWith('#') 
            ? post.content.includes(searchLower)
            : post.content.includes(`#${searchLower}`);
          
          return textMatch || hashtagMatch;
        });
      }

      setPosts(filteredPosts);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === POSTS_PER_PAGE);
    } catch (err) {
      console.error('게시글 로드 실패:', err);
      setError('게시글을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !lastVisible) return;

    try {
      setLoadingMore(true);
      
      let q = buildQuery();
      q = query(q, startAfter(lastVisible));
      
      const snapshot = await getDocs(q);
      const newPosts: BoardPost[] = [];
      
      snapshot.forEach((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
        const data: any = docSnap.data();
        newPosts.push({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastCommentAt: data.lastCommentAt?.toDate(),
        } as BoardPost);
      });

      // 클라이언트 사이드 검색어 필터링
      let filteredNewPosts = newPosts;
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        filteredNewPosts = newPosts.filter(post => {
          // 일반 텍스트 검색
          const textMatch = post.title.toLowerCase().includes(searchLower) ||
                           post.content.toLowerCase().includes(searchLower) ||
                           post.authorName.toLowerCase().includes(searchLower);
          
          // 해시태그 검색 (검색어가 #으로 시작하는 경우)
          const hashtagMatch = searchLower.startsWith('#') 
            ? post.content.includes(searchLower)
            : post.content.includes(`#${searchLower}`);
          
          return textMatch || hashtagMatch;
        });
      }

      setPosts(prev => [...prev, ...filteredNewPosts]);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === POSTS_PER_PAGE);
    } catch (err) {
      console.error('게시글 더 로드 실패:', err);
      setError('게시글을 더 불러오는데 실패했습니다.');
    } finally {
      setLoadingMore(false);
    }
  }, [buildQuery, loadingMore, hasMore, lastVisible]);

  const refresh = useCallback(() => {
    setPosts([]);
    setLastVisible(null);
    setHasMore(true);
    loadPosts();
  }, [loadPosts]);

  // 게시글 액션은 usePostActions 훅으로 분리
  // 여기서는 목록 관리만 담당

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // 실시간 구독 추가
  useEffect(() => {
    if (!filters) return;

    const q = buildQuery();
    const unsubscribe = onSnapshot(q, (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
      const postsData: BoardPost[] = [];
      snapshot.forEach((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
        const data: any = docSnap.data();
        postsData.push({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastCommentAt: data.lastCommentAt?.toDate(),
        } as BoardPost);
      });

      // 클라이언트 사이드 검색어 필터링
      let filteredPosts = postsData;
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        filteredPosts = postsData.filter(post => {
          // 일반 텍스트 검색
          const textMatch = post.title.toLowerCase().includes(searchLower) ||
                           post.content.toLowerCase().includes(searchLower) ||
                           post.authorName.toLowerCase().includes(searchLower);
          
          // 해시태그 검색 (검색어가 #으로 시작하는 경우)
          const hashtagMatch = searchLower.startsWith('#') 
            ? post.content.includes(searchLower)
            : post.content.includes(`#${searchLower}`);
          
          return textMatch || hashtagMatch;
        });
      }

      setPosts(filteredPosts);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error('게시글 실시간 구독 실패:', err);
      setError('게시글을 불러오는데 실패했습니다.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [buildQuery]);

  return {
    posts,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
  };
};
