import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/features/auth';
import { useImageUpload } from '@/hooks/storage';

import type { BoardFormData, BoardPost } from '../model/types';
import { buildBoardPostUpdatePayload } from '../services/boardPostService';
import { useBoardRepository } from './useBoardRepository';

export interface UseBoardEditResult {
  post: BoardPost | null;
  loading: boolean;
  error: string | null;
  updatePost: (formData: BoardFormData) => Promise<void>;
  submitting: boolean;
  selectedImages: ReturnType<typeof useImageUpload>['selectedImages'];
  imageUploading: boolean;
  pickImages: ReturnType<typeof useImageUpload>['pickImages'];
  removeImage: ReturnType<typeof useImageUpload>['removeImage'];
  reorderImages: ReturnType<typeof useImageUpload>['reorderImages'];
  setImages: ReturnType<typeof useImageUpload>['setImages'];
  clearImages: ReturnType<typeof useImageUpload>['clearImages'];
}

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
        if (postData.authorId !== user.uid) {
          setError('수정 권한이 없습니다.');
          return;
        }

        setPost(postData);

        if (postData.images?.length) {
          setImages(
            postData.images.map((image, index) => ({
              id: `existing-${index}`,
              localUri: image.url,
              width: image.width,
              height: image.height,
              size: image.size || 0,
              mime: image.mime || 'image/jpeg',
              status: 'uploaded' as const,
              progress: 100,
              remoteUrl: image.url,
              thumbUrl: image.thumbUrl || image.url,
            })),
          );
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

    void loadPost();
  }, [boardRepository, postId, setImages, user]);

  const updatePost = useCallback(
    async (formData: BoardFormData): Promise<void> => {
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

        let uploadedImages = selectedImages;
        if (selectedImages.length > 0) {
          try {
            uploadedImages = await uploadImages(postId);
          } catch (imageError) {
            console.error('이미지 업로드 실패:', imageError);
          }
        }

        const finalImages = uploadedImages
          .filter((image) => image.status === 'uploaded' && (image.remoteUrl || image.localUri))
          .map((image) => ({
            url: image.remoteUrl || image.localUri,
            width: image.width,
            height: image.height,
            thumbUrl: image.thumbUrl,
            size: image.size,
            mime: image.mime,
          }));

        await boardRepository.updatePost(postId, {
          ...buildBoardPostUpdatePayload(formData),
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
    },
    [boardRepository, clearImages, postId, selectedImages, uploadImages, user],
  );

  return {
    post,
    loading,
    error,
    updatePost,
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
