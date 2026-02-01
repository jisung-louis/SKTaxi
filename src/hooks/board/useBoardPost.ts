// SKTaxi: 단일 게시글 조회 훅 (Repository 패턴 적용)

import { useState, useEffect, useCallback } from 'react';
import { BoardPost } from '../../types/board';
import { useBoardRepository } from '../../di/useRepository';

export interface UseBoardPostResult {
  post: BoardPost | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useBoardPost(postId: string): UseBoardPostResult {
  const boardRepository = useBoardRepository();
  const [post, setPost] = useState<BoardPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPost = useCallback(async () => {
    if (!postId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const loadedPost = await boardRepository.getPost(postId);
      if (loadedPost) {
        setPost(loadedPost);
      } else {
        setError('게시글을 찾을 수 없습니다.');
      }
    } catch (err) {
      console.error('게시글 로드 실패:', err);
      setError('게시글을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [postId, boardRepository]);

  // 실시간 구독
  useEffect(() => {
    if (!postId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = boardRepository.subscribeToPost(postId, {
      onData: (updatedPost) => {
        setPost(updatedPost);
        setLoading(false);
        if (!updatedPost) {
          setError('게시글을 찾을 수 없습니다.');
        } else {
          setError(null);
        }
      },
      onError: (err) => {
        console.error('게시글 실시간 구독 실패:', err);
        setError('게시글을 불러오는데 실패했습니다.');
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, [postId, boardRepository]);

  return {
    post,
    loading,
    error,
    refresh: loadPost,
  };
}
