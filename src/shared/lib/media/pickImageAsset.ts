import {Alert} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  type Asset,
  type CameraOptions,
  type ImageLibraryOptions,
  type MediaType,
} from 'react-native-image-picker';

export interface PickedImageAsset {
  fileName?: string;
  fileSize?: number;
  height?: number;
  mimeType?: string;
  uri: string;
  width?: number;
}

const DEFAULT_MAX_FILE_SIZE_MB = 10;

const IMAGE_PICKER_OPTIONS: CameraOptions & ImageLibraryOptions = {
  maxHeight: 2000,
  maxWidth: 2000,
  mediaType: 'photo' as MediaType,
  quality: 0.8 as const,
  selectionLimit: 1,
};

const toPickedImageAsset = (asset?: Asset): PickedImageAsset | null => {
  if (!asset?.uri) {
    return null;
  }

  return {
    fileName: asset.fileName ?? undefined,
    fileSize: asset.fileSize ?? undefined,
    height: asset.height ?? undefined,
    mimeType: asset.type ?? undefined,
    uri: asset.uri,
    width: asset.width ?? undefined,
  };
};

const validatePickedImageAsset = (
  asset: PickedImageAsset | null,
  allowedMimeTypes: readonly string[] | undefined,
  maxFileSizeMb: number,
) => {
  if (!asset) {
    return null;
  }

  const fileSize = asset.fileSize ?? 0;
  const fileSizeMb = fileSize / (1024 * 1024);

  if (fileSizeMb > maxFileSizeMb) {
    Alert.alert(
      '파일 크기 초과',
      `이미지 파일은 ${maxFileSizeMb}MB를 초과할 수 없습니다.`,
    );
    return null;
  }

  if (
    allowedMimeTypes &&
    asset.mimeType &&
    !allowedMimeTypes.includes(asset.mimeType)
  ) {
    Alert.alert(
      '지원하지 않는 파일 형식',
      'JPEG, PNG, WebP 이미지 파일만 첨부할 수 있습니다.',
    );
    return null;
  }

  return asset;
};

const openImageLibrary = ({
  allowedMimeTypes,
  maxFileSizeMb,
}: {
  allowedMimeTypes?: readonly string[];
  maxFileSizeMb: number;
}) =>
  new Promise<PickedImageAsset | null>(resolve => {
    launchImageLibrary(IMAGE_PICKER_OPTIONS, response => {
      resolve(
        validatePickedImageAsset(
          toPickedImageAsset(response.assets?.[0]),
          allowedMimeTypes,
          maxFileSizeMb,
        ),
      );
    });
  });

const openCamera = ({
  allowedMimeTypes,
  maxFileSizeMb,
}: {
  allowedMimeTypes?: readonly string[];
  maxFileSizeMb: number;
}) =>
  new Promise<PickedImageAsset | null>(resolve => {
    launchCamera(IMAGE_PICKER_OPTIONS, response => {
      resolve(
        validatePickedImageAsset(
          toPickedImageAsset(response.assets?.[0]),
          allowedMimeTypes,
          maxFileSizeMb,
        ),
      );
    });
  });

export const pickImageAsset = ({
  allowedMimeTypes,
  maxFileSizeMb = DEFAULT_MAX_FILE_SIZE_MB,
}: {
  allowedMimeTypes?: readonly string[];
  maxFileSizeMb?: number;
} = {}) =>
  new Promise<PickedImageAsset | null>(resolve => {
    Alert.alert(
      '사진 선택',
      '사진을 어떻게 추가하시겠습니까?',
      [
        {
          style: 'cancel',
          text: '취소',
          onPress: () => resolve(null),
        },
        {
          text: '앨범에서 선택',
          onPress: async () => {
            resolve(await openImageLibrary({allowedMimeTypes, maxFileSizeMb}));
          },
        },
        {
          text: '카메라로 촬영',
          onPress: async () => {
            resolve(await openCamera({allowedMimeTypes, maxFileSizeMb}));
          },
        },
      ],
      {
        cancelable: true,
        onDismiss: () => resolve(null),
      },
    );
  });
