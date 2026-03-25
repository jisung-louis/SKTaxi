import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/features/auth';

import type {
  BoardFormData,
  BoardImage,
  BoardPost,
  BoardSelectedImage,
} from '../model/types';
import { buildBoardPostUpdatePayload } from '../services/boardPostService';
import { useBoardImageUpload } from './useBoardImageUpload';
import { useBoardRepository } from './useBoardRepository';

export interface UseBoardEditResult {
  post: BoardPost | null;
  loading: boolean;
  error: string | null;
  updatePost: (formData: BoardFormData) => Promise<void>;
  submitting: boolean;
  selectedImages: BoardSelectedImage[];
  imageUploading: boolean;
  pickImages: () => void;
  removeImage: (imageId: string) => void;
  reorderImages: (fromIndex: number, toIndex: number) => void;
  setImages: (images: BoardSelectedImage[]) => void;
  clearImages: () => void;
}

const mapSelectedImageToBoardImage = (
  image: BoardSelectedImage,
): BoardImage => ({
  height: image.height,
  mime: image.mime,
  size: image.size,
  thumbUrl: image.thumbUrl,
  url: image.remoteUrl ?? image.localUri,
  width: image.width,
});

const getSelectedImageIdentity = (image: BoardSelectedImage) =>
  image.remoteUrl ?? image.localUri;

const getBoardImageIdentity = (image: BoardImage) => image.url;

const haveImagesChanged = (
  currentImages: BoardImage[] | undefined,
  selectedImages: BoardSelectedImage[],
) => {
  const normalizedCurrent = currentImages ?? [];

  if (normalizedCurrent.length !== selectedImages.length) {
    return true;
  }

  return selectedImages.some((selectedImage, index) => {
    const currentImage = normalizedCurrent[index];

    return (
      !currentImage ||
      getSelectedImageIdentity(selectedImage) !== getBoardImageIdentity(currentImage)
    );
  });
};

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
    clearImages,
    setImages,
    uploadImages,
  } = useBoardImageUpload({ maxImages: 10 });

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
        const canEdit = postData.isAuthor ?? postData.authorId === user.uid;
        if (!canEdit) {
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

    loadPost().catch(() => undefined);
  }, [boardRepository, postId, setImages, user]);

  const updatePost = useCallback(
    async (formData: BoardFormData): Promise<void> => {
      if (!postId || !user || !post) {
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

        const shouldUpdateAnonymous = formData.isAnonymous !== post.isAnonymous;
        const shouldUpdateImages = haveImagesChanged(post.images, selectedImages);
        const uploadedImages = shouldUpdateImages ? await uploadImages(postId) : [];

        await boardRepository.updatePost(postId, {
          ...buildBoardPostUpdatePayload(formData),
          ...(shouldUpdateAnonymous
            ? {isAnonymous: Boolean(formData.isAnonymous)}
            : {}),
          ...(shouldUpdateImages
            ? {
                images: uploadedImages.map(mapSelectedImageToBoardImage),
              }
            : {}),
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : '게시글 수정에 실패했습니다.';
        setError(message);
        throw new Error(message);
      } finally {
        setSubmitting(false);
      }
    },
    [boardRepository, post, postId, selectedImages, uploadImages, user],
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
