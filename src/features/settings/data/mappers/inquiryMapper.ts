import type {ImageUploadResponseDto} from '@/shared/api/imageUploadClient';

import type {InquiryAttachmentDto, InquiryTypeDto} from '../dto/inquiryDto';
import type {InquiryFormTypeKey} from '../../model/inquiryFormSource';

const INQUIRY_ATTACHMENT_ERROR_MESSAGE =
  '첨부 이미지를 처리하지 못했습니다. 다시 시도해주세요.';

export const mapInquiryFormTypeKeyToDto = (
  type: InquiryFormTypeKey,
): InquiryTypeDto => {
  switch (type) {
    case 'feature':
      return 'FEATURE';
    case 'bug':
      return 'BUG';
    case 'account':
      return 'ACCOUNT';
    case 'service':
      return 'SERVICE';
    case 'other':
    default:
      return 'OTHER';
  }
};

export const mapInquiryImageUploadResponseDto = (
  dto: ImageUploadResponseDto,
): InquiryAttachmentDto => {
  if (
    !dto.url ||
    !dto.thumbUrl ||
    typeof dto.width !== 'number' ||
    typeof dto.height !== 'number' ||
    typeof dto.size !== 'number' ||
    !dto.mime
  ) {
    throw new Error(INQUIRY_ATTACHMENT_ERROR_MESSAGE);
  }

  return {
    height: dto.height,
    mime: dto.mime,
    size: dto.size,
    thumbUrl: dto.thumbUrl,
    url: dto.url,
    width: dto.width,
  };
};
