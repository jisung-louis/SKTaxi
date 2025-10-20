import { useState, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import storage, { ref, uploadBytesResumable, getDownloadURL } from '@react-native-firebase/storage';

export interface SelectedImage {
  id: string;
  localUri: string;
  width: number;
  height: number;
  size: number;
  mime: string;
  status: 'pending' | 'uploading' | 'uploaded' | 'failed';
  progress: number;
  remoteUrl?: string;
  thumbUrl?: string;
}

interface UseImageUploadProps {
  maxImages?: number;
  maxFileSize?: number; // MB
}

export const useImageUpload = ({ 
  maxImages = 10, 
  maxFileSize = 10 
}: UseImageUploadProps = {}) => {
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [uploading, setUploading] = useState(false);

  const generateImageId = () => Math.random().toString(36).substr(2, 9);

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
          }
        },
        { 
          text: '카메라로 촬영', 
          onPress: () => {
            launchCamera(options, handleImagePickerResponse);
          }
        }
      ]
    );
  }, [selectedImages.length, maxImages]);

  const handleImagePickerResponse = useCallback((response: ImagePickerResponse) => {
    if (response.didCancel || response.errorMessage) {
      return;
    }

    const assets = response.assets || [];
    const newImages: SelectedImage[] = assets.map((asset: any) => {
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
        status: 'pending',
        progress: 0,
      };
    }).filter(Boolean) as SelectedImage[];

    setSelectedImages(prev => [...prev, ...newImages]);
  }, [maxFileSize]);

  const removeImage = useCallback((imageId: string) => {
    setSelectedImages(prev => prev.filter(img => img.id !== imageId));
  }, []);

  const reorderImages = useCallback((fromIndex: number, toIndex: number) => {
    setSelectedImages(prev => {
      const newImages = [...prev];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return newImages;
    });
  }, []);

  const uploadImages = useCallback(async (postId: string): Promise<SelectedImage[]> => {
    if (selectedImages.length === 0) return [];

    setUploading(true);
    const uploadPromises = selectedImages.map(async (image) => {
      if (image.status === 'uploaded' && image.remoteUrl) {
        return image;
      }

      try {
        // 이미지 상태를 uploading으로 변경
        setSelectedImages(prev => 
          prev.map(img => 
            img.id === image.id 
              ? { ...img, status: 'uploading', progress: 0 }
              : img
          )
        );

        // Firebase Storage에 업로드
        const imageRef = ref(storage(), `boardPosts/${postId}/images/${image.id}.jpg`);
        
        const response = await fetch(image.localUri);
        const blob = await response.blob();

        const uploadTask = uploadBytesResumable(imageRef, blob);
        
        return new Promise<SelectedImage>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setSelectedImages(prev => 
                prev.map(img => 
                  img.id === image.id 
                    ? { ...img, progress }
                    : img
                )
              );
            },
            (error) => {
              console.error('업로드 실패:', error);
              setSelectedImages(prev => 
                prev.map(img => 
                  img.id === image.id 
                    ? { ...img, status: 'failed' }
                    : img
                )
              );
              reject(error);
            },
            async () => {
              try {
                if (!uploadTask.snapshot) {
                  throw new Error('Upload task snapshot is null');
                }
                
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                
                // 썸네일 생성 (클라이언트에서 간단한 리사이즈)
                const thumbUrl = downloadURL; // 실제로는 썸네일 생성 로직 필요
                
                const uploadedImage: SelectedImage = {
                  ...image,
                  status: 'uploaded',
                  progress: 100,
                  remoteUrl: downloadURL,
                  thumbUrl,
                };

                setSelectedImages(prev => 
                  prev.map(img => 
                    img.id === image.id 
                      ? uploadedImage
                      : img
                  )
                );

                resolve(uploadedImage);
              } catch (error) {
                reject(error);
              }
            }
          );
        });
      } catch (error) {
        console.error('이미지 업로드 실패:', error);
        setSelectedImages(prev => 
          prev.map(img => 
            img.id === image.id 
              ? { ...img, status: 'failed' }
              : img
          )
        );
        throw error;
      }
    });

    try {
      const uploadedImages = await Promise.all(uploadPromises);
      setUploading(false);
      return uploadedImages.filter(img => img.status === 'uploaded');
    } catch (error) {
      setUploading(false);
      throw error;
    }
  }, [selectedImages]);

  const clearImages = useCallback(() => {
    setSelectedImages([]);
  }, []);

  const setImages = useCallback((images: SelectedImage[]) => {
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
