// SKTaxi: 게시글 작성 훅 (Repository 패턴 적용)

import { useState, useCallback } from 'react';
import { useBoardRepository } from '../../di/useRepository';
import { useAuth } from '../auth';
import { useImageUpload } from '../storage';
import { BoardFormData } from '../../types/board';
import { logEvent } from '../../lib/analytics';

export interface UseBoardWriteResult {
  /** 게시글 작성 */
  createPost: (formData: BoardFormData) => Promise<string>;
  /** 제출 중 상태 */
  submitting: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 이미지 관련 */
  selectedImages: ReturnType<typeof useImageUpload>['selectedImages'];
  imageUploading: boolean;
  pickImages: ReturnType<typeof useImageUpload>['pickImages'];
  removeImage: ReturnType<typeof useImageUpload>['removeImage'];
  reorderImages: ReturnType<typeof useImageUpload>['reorderImages'];
  clearImages: ReturnType<typeof useImageUpload>['clearImages'];
}

/**
 * 게시글 작성을 위한 훅 (Repository 패턴)
 */
export function useBoardWrite(): UseBoardWriteResult {
  const { user } = useAuth();
  const boardRepository = useBoardRepository();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    selectedImages,
    uploading: imageUploading,
    pickImages,
    removeImage,
    reorderImages,
    uploadImages,
    clearImages,
  } = useImageUpload({ maxImages: 10 });

  const createPost = useCallback(async (formData: BoardFormData): Promise<string> => {
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    if (!formData.title.trim()) {
      throw new Error('제목을 입력해주세요.');
    }

    if (!formData.content.trim()) {
      throw new Error('내용을 입력해주세요.');
    }

    try {
      setSubmitting(true);
      setError(null);

      // 게시글 생성
      const postId = await boardRepository.createPost({
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category as 'general' | 'question' | 'review' | 'announcement',
        authorId: user.uid,
        authorName: user.displayName || '익명',
        authorProfileImage: user.photoURL ?? null,
        isAnonymous: !!formData.isAnonymous,
        isPinned: false,
        isDeleted: false,
        images: [],
      });

      // Analytics: 게시글 작성 이벤트 로깅
      await logEvent('board_post_created', {
        post_id: postId,
        category: formData.category,
        is_anonymous: formData.isAnonymous ?? false,
        has_images: selectedImages.length > 0,
        image_count: selectedImages.length,
      });

      // 익명 설정이면 anonId 업데이트
      if (formData.isAnonymous) {
        await boardRepository.updatePost(postId, {
          anonId: `${postId}:${user.uid}`,
          isAnonymous: true,
        });
      }

      // 이미지가 있으면 업로드
      if (selectedImages.length > 0) {
        try {
          const uploadedImages = await uploadImages(postId);

          // 업로드된 이미지 정보로 게시글 업데이트
          const imageData = uploadedImages.map(img => ({
            url: img.remoteUrl!,
            width: img.width,
            height: img.height,
            thumbUrl: img.thumbUrl,
            size: img.size,
            mime: img.mime,
          }));

          await boardRepository.updatePost(postId, { images: imageData });
        } catch (imageError) {
          console.error('이미지 업로드 실패:', imageError);
          // 이미지 업로드 실패해도 게시글은 생성됨
        }
      }

      clearImages();
      return postId;
    } catch (err) {
      const message = err instanceof Error ? err.message : '게시글 작성에 실패했습니다.';
      setError(message);
      throw new Error(message);
    } finally {
      setSubmitting(false);
    }
  }, [user, boardRepository, selectedImages, uploadImages, clearImages]);

  return {
    createPost,
    submitting,
    error,
    selectedImages,
    imageUploading,
    pickImages,
    removeImage,
    reorderImages,
    clearImages,
  };
}
