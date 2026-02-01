// SKTaxi: 게시글 수정 훅 (Repository 패턴 적용)

import { useState, useEffect, useCallback } from 'react';
import { useBoardRepository } from '../../di/useRepository';
import { useAuth } from '../auth';
import { useImageUpload } from '../storage';
import { BoardFormData, BoardPost } from '../../types/board';

export interface UseBoardEditResult {
  /** 원본 게시글 */
  post: BoardPost | null;
  /** 로딩 상태 */
  loading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 게시글 수정 */
  updatePost: (formData: BoardFormData) => Promise<void>;
  /** 제출 중 상태 */
  submitting: boolean;
  /** 이미지 관련 */
  selectedImages: ReturnType<typeof useImageUpload>['selectedImages'];
  imageUploading: boolean;
  pickImages: ReturnType<typeof useImageUpload>['pickImages'];
  removeImage: ReturnType<typeof useImageUpload>['removeImage'];
  reorderImages: ReturnType<typeof useImageUpload>['reorderImages'];
  setImages: ReturnType<typeof useImageUpload>['setImages'];
  clearImages: ReturnType<typeof useImageUpload>['clearImages'];
}

/**
 * 게시글 수정을 위한 훅 (Repository 패턴)
 */
export function useBoardEdit(postId: string): UseBoardEditResult {
  const { user } = useAuth();
  const boardRepository = useBoardRepository();
  const [post, setPost] = useState<BoardPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    selectedImages,
    uploading: imageUploading,
    pickImages,
    removeImage,
    reorderImages,
    uploadImages,
    clearImages,
    setImages,
  } = useImageUpload({ maxImages: 10 });

  // 게시글 로드
  useEffect(() => {
    const loadPost = async () => {
      if (!postId || !user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const postData = await boardRepository.getPost(postId);

        if (!postData) {
          setError('게시글을 찾을 수 없습니다.');
          return;
        }

        // 작성자 확인
        if (postData.authorId !== user.uid) {
          setError('수정 권한이 없습니다.');
          return;
        }

        setPost(postData);

        // 기존 이미지가 있으면 편집용 상태에 주입
        if (postData.images && postData.images.length > 0) {
          const existing = postData.images.map((img, idx) => ({
            id: `existing-${idx}`,
            localUri: img.url,
            width: img.width,
            height: img.height,
            size: img.size || 0,
            mime: img.mime || 'image/jpeg',
            status: 'uploaded' as const,
            progress: 100,
            remoteUrl: img.url,
            thumbUrl: img.thumbUrl || img.url,
          }));
          setImages(existing);
        } else {
          setImages([]);
        }
      } catch (err) {
        console.error('게시글 로드 실패:', err);
        setError('게시글을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [postId, user, boardRepository, setImages]);

  const updatePostAction = useCallback(async (formData: BoardFormData): Promise<void> => {
    if (!postId || !user) {
      throw new Error('수정할 수 없습니다.');
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

      // 이미지 업로드 처리
      let uploadedImagesAll = [] as typeof selectedImages;
      if (selectedImages.length > 0) {
        try {
          uploadedImagesAll = await uploadImages(postId);
        } catch (imageError) {
          console.error('이미지 업로드 실패:', imageError);
          // 이미지 실패해도 텍스트 수정은 진행
        }
      }

      const sourceList = uploadedImagesAll.length > 0 ? uploadedImagesAll : selectedImages;
      const finalImages = sourceList
        .filter(img => (img.status === 'uploaded' && (img.remoteUrl || img.localUri)))
        .map(img => ({
          url: img.remoteUrl || img.localUri,
          width: img.width,
          height: img.height,
          thumbUrl: img.thumbUrl,
          size: img.size,
          mime: img.mime,
        }));

      await boardRepository.updatePost(postId, {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category as 'general' | 'question' | 'review' | 'announcement',
        images: finalImages,
      });

      clearImages();
    } catch (err) {
      const message = err instanceof Error ? err.message : '게시글 수정에 실패했습니다.';
      setError(message);
      throw new Error(message);
    } finally {
      setSubmitting(false);
    }
  }, [postId, user, boardRepository, selectedImages, uploadImages, clearImages]);

  return {
    post,
    loading,
    error,
    updatePost: updatePostAction,
    submitting,
    selectedImages,
    imageUploading,
    pickImages,
    removeImage,
    reorderImages,
    setImages,
    clearImages,
  };
}
