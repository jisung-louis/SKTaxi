import { useCallback, useEffect, useState } from 'react';

import type { BoardPost } from '../model/types';
import { useBoardRepository } from './useBoardRepository';

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
      const nextPost = await boardRepository.getPost(postId);
      if (nextPost) {
        setPost(nextPost);
      } else {
        setError('게시글을 찾을 수 없습니다.');
      }
    } catch (err) {
      console.error('게시글 로드 실패:', err);
      setError('게시글을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [boardRepository, postId]);

  useEffect(() => {
    if (!postId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = boardRepository.subscribeToPost(postId, {
      onData: (nextPost) => {
        setPost(nextPost);
        setLoading(false);
        setError(nextPost ? null : '게시글을 찾을 수 없습니다.');
      },
      onError: (err) => {
        console.error('게시글 실시간 구독 실패:', err);
        setError('게시글을 불러오는데 실패했습니다.');
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, [boardRepository, postId]);

  return {
    post,
    loading,
    error,
    refresh: () => {
      void loadPost();
    },
  };
}
