import type {ApiSuccessResponse} from './apiResponse';
import {httpClient} from './httpClient';

export interface ImageUploadResponseDto {
  height?: number | null;
  mime?: string | null;
  size?: number | null;
  thumbUrl?: string | null;
  url: string;
  width?: number | null;
}

export const uploadImage = async ({
  context,
  fileName,
  mimeType,
  uri,
}: {
  context: 'CHAT_IMAGE';
  fileName?: string;
  mimeType?: string;
  uri: string;
}) => {
  const formData = new FormData();
  formData.append('file', {
    uri,
    name: fileName ?? uri.split('/').pop() ?? `chat-image-${Date.now()}.jpg`,
    type: mimeType ?? 'image/jpeg',
  } as any);

  const response = await httpClient.request<
    ApiSuccessResponse<ImageUploadResponseDto>,
    FormData
  >({
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    method: 'POST',
    params: {
      context,
    },
    url: '/v1/images',
  });

  return response.data;
};
