import {uploadImage} from '@/shared/api/imageUploadClient';

import {
  InquiryApiClient,
  inquiryApiClient,
} from '../api/inquiryApiClient';
import {
  mapInquiryFormTypeKeyToDto,
  mapInquiryImageUploadResponseDto,
} from '../mappers/inquiryMapper';
import type {
  IInquiryFormRepository,
  SubmitInquiryFormPayload,
} from './IInquiryFormRepository';

export class SpringInquiryFormRepository implements IInquiryFormRepository {
  constructor(
    private readonly apiClient: InquiryApiClient = inquiryApiClient,
  ) {}

  async submitInquiryForm(
    payload: SubmitInquiryFormPayload,
  ): Promise<{id: string}> {
    const attachments = await Promise.all(
      (payload.attachments ?? []).map(async attachment => {
        const uploadedAttachment = await uploadImage({
          context: 'INQUIRY_IMAGE',
          fileName: attachment.fileName,
          mimeType: attachment.mimeType,
          uri: attachment.uri,
        });

        return mapInquiryImageUploadResponseDto(uploadedAttachment);
      }),
    );

    const response = await this.apiClient.createInquiry({
      attachments,
      content: payload.content.trim(),
      subject: payload.title.trim(),
      type: mapInquiryFormTypeKeyToDto(payload.type),
    });

    return {
      id: response.data.id,
    };
  }
}
