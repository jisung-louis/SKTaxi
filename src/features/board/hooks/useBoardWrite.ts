import { useCallback, useState } from 'react';

import { useAuth } from '@/features/auth';
import { logEvent } from '@/lib/analytics';

import type { BoardFormData, BoardSelectedImage } from '../model/types';
import { buildBoardPostCreatePayload } from '../services/boardPostService';
import { useBoardImageUpload } from './useBoardImageUpload';
import { useBoardRepository } from './useBoardRepository';

export interface UseBoardWriteResult {
  createPost: (formData: BoardFormData) => Promise<string>;
  submitting: boolean;
  error: string | null;
  selectedImages: BoardSelectedImage[];
  imageUploading: boolean;
  pickImages: () => void;
  removeImage: (imageId: string) => void;
  reorderImages: (fromIndex: number, toIndex: number) => void;
  clearImages: () => void;
}

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
  } = useBoardImageUpload({ maxImages: 10 });

  const createPost = useCallback(
    async (formData: BoardFormData): Promise<string> => {
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

        const postId = await boardRepository.createPost(
          buildBoardPostCreatePayload(
            {
              uid: user.uid,
              displayName: user.displayName,
              photoURL: user.photoURL,
            },
            formData,
          ),
        );

        await logEvent('board_post_created', {
          post_id: postId,
          category: formData.category,
          is_anonymous: formData.isAnonymous ?? false,
          has_images: selectedImages.length > 0,
          image_count: selectedImages.length,
        });

        if (formData.isAnonymous) {
          await boardRepository.updatePost(postId, {
            anonId: `${postId}:${user.uid}`,
            isAnonymous: true,
          });
        }

        if (selectedImages.length > 0) {
          try {
            const uploadedImages = await uploadImages(postId);
            await boardRepository.updatePost(postId, {
              images: uploadedImages.map((image) => ({
                url: image.remoteUrl!,
                width: image.width,
                height: image.height,
                thumbUrl: image.thumbUrl,
                size: image.size,
                mime: image.mime,
              })),
            });
          } catch (imageError) {
            console.error('이미지 업로드 실패:', imageError);
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
    },
    [boardRepository, clearImages, selectedImages.length, uploadImages, user],
  );

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
