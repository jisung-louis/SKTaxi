import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import type {
  ImagePickerResponse,
  MediaType,
} from 'react-native-image-picker';

import type { BoardSelectedImage } from '../model/types';
import { useBoardStorageRepository } from './useBoardStorageRepository';

interface UseBoardImageUploadProps {
  maxImages?: number;
  maxFileSize?: number;
}

export const useBoardImageUpload = ({
  maxImages = 10,
  maxFileSize = 10,
}: UseBoardImageUploadProps = {}) => {
  const storageRepository = useBoardStorageRepository();
  const [selectedImages, setSelectedImages] = useState<BoardSelectedImage[]>([]);
  const [uploading, setUploading] = useState(false);

  const generateImageId = () => Math.random().toString(36).slice(2, 11);

  const handleImagePickerResponse = useCallback(
    (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      const nextImages = (response.assets || [])
        .map((asset) => {
          const fileSize = asset.fileSize || 0;
          const fileSizeMB = fileSize / (1024 * 1024);

          if (fileSizeMB > maxFileSize) {
            Alert.alert('파일 크기 초과', `파일 크기는 ${maxFileSize}MB를 초과할 수 없습니다.`);
            return null;
          }

          return {
            id: generateImageId(),
            localUri: asset.uri || '',
            width: asset.width || 0,
            height: asset.height || 0,
            size: fileSize,
            mime: asset.type || 'image/jpeg',
            status: 'pending' as const,
            progress: 0,
          };
        })
        .filter((image): image is BoardSelectedImage => Boolean(image));

      setSelectedImages((prev) => [...prev, ...nextImages]);
    },
    [maxFileSize],
  );

  const pickImages = useCallback(() => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8 as const,
      maxWidth: 1600,
      maxHeight: 1600,
      selectionLimit: maxImages - selectedImages.length,
    };

    Alert.alert(
      '사진 선택',
      '사진을 어떻게 추가하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '앨범에서 선택',
          onPress: () => {
            launchImageLibrary(options, handleImagePickerResponse);
          },
        },
        {
          text: '카메라로 촬영',
          onPress: () => {
            launchCamera(options, handleImagePickerResponse);
          },
        },
      ],
    );
  }, [handleImagePickerResponse, maxImages, selectedImages.length]);

  const removeImage = useCallback((imageId: string) => {
    setSelectedImages((prev) => prev.filter((image) => image.id !== imageId));
  }, []);

  const reorderImages = useCallback((fromIndex: number, toIndex: number) => {
    setSelectedImages((prev) => {
      const nextImages = [...prev];
      const [movedImage] = nextImages.splice(fromIndex, 1);
      nextImages.splice(toIndex, 0, movedImage);
      return nextImages;
    });
  }, []);

  const uploadImages = useCallback(
    async (postId: string): Promise<BoardSelectedImage[]> => {
      if (selectedImages.length === 0) {
        return [];
      }

      setUploading(true);

      const uploadPromises = selectedImages.map(async (image) => {
        if (image.status === 'uploaded' && image.remoteUrl) {
          return image;
        }

        try {
          setSelectedImages((prev) =>
            prev.map((currentImage) =>
              currentImage.id === image.id
                ? { ...currentImage, status: 'uploading' as const, progress: 0 }
                : currentImage,
            ),
          );

          const result = await storageRepository.uploadImage(image.localUri, {
            path: `boardPosts/${postId}/images/`,
            filename: `${image.id}.jpg`,
            onProgress: (progress) => {
              setSelectedImages((prev) =>
                prev.map((currentImage) =>
                  currentImage.id === image.id
                    ? { ...currentImage, progress }
                    : currentImage,
                ),
              );
            },
            maxSize: maxFileSize * 1024 * 1024,
          });

          const uploadedImage: BoardSelectedImage = {
            ...image,
            status: 'uploaded',
            progress: 100,
            remoteUrl: result.url,
            thumbUrl: result.url,
          };

          setSelectedImages((prev) =>
            prev.map((currentImage) =>
              currentImage.id === image.id ? uploadedImage : currentImage,
            ),
          );

          return uploadedImage;
        } catch (error) {
          console.error('이미지 업로드 실패:', error);
          setSelectedImages((prev) =>
            prev.map((currentImage) =>
              currentImage.id === image.id
                ? { ...currentImage, status: 'failed' as const }
                : currentImage,
            ),
          );
          throw error;
        }
      });

      try {
        const uploadedImages = await Promise.all(uploadPromises);
        return uploadedImages.filter((image) => image.status === 'uploaded');
      } finally {
        setUploading(false);
      }
    },
    [maxFileSize, selectedImages, storageRepository],
  );

  const clearImages = useCallback(() => {
    setSelectedImages([]);
  }, []);

  const setImages = useCallback((images: BoardSelectedImage[]) => {
    setSelectedImages(images);
  }, []);

  return {
    selectedImages,
    uploading,
    pickImages,
    removeImage,
    reorderImages,
    uploadImages,
    clearImages,
    setImages,
  };
};
