import React from 'react';

import {inquiryFormRepository} from '../data/repositories/inquiryFormRepository';
import type {SubmitInquiryFormAttachmentPayload} from '../data/repositories/IInquiryFormRepository';
import type {InquiryFormTypeKey} from '../model/inquiryFormSource';
import type {
  InquiryFormAttachmentViewData,
  InquiryFormScreenViewData,
} from '../model/inquiryFormViewData';

interface InquiryTypeOptionConfig {
  id: InquiryFormTypeKey;
  label: string;
}

interface InquiryFormAttachmentItem extends SubmitInquiryFormAttachmentPayload {
  id: string;
}

const INQUIRY_FORM_ATTACHMENT_LIMIT = 3;
const INQUIRY_FORM_TITLE_MAX_LENGTH = 200;
const INQUIRY_FORM_CONTENT_MAX_LENGTH = 5000;
const INQUIRY_FORM_TYPE_OPTIONS: InquiryTypeOptionConfig[] = [
  {id: 'feature', label: '기능 제안'},
  {id: 'bug', label: '버그 신고'},
  {id: 'account', label: '계정 문의'},
  {id: 'service', label: '서비스 문의'},
  {id: 'other', label: '기타'},
];
const INQUIRY_FORM_PLACEHOLDERS = {
  content: '문의 내용을 자세히 작성해주세요. (최대 5000자)',
  title: '문의 제목을 입력해주세요',
} as const;
const INQUIRY_FORM_ATTACHMENT = {
  helperLines: ['이미지를 첨부하려면 탭하세요', 'JPEG, PNG, WebP 최대 3장'] as [
    string,
    string,
  ],
  title: '이미지 첨부',
} as const;
const INQUIRY_FORM_GUIDE_LINES = [
  '접수된 문의는 검토 후 순차적으로 처리됩니다.',
  '빠른 처리를 위해 내용을 최대한 자세히 작성해주세요.',
] as [string, string];
const INQUIRY_FORM_SUBMIT_LABEL = '문의 접수하기';

const resolveInitialType = (type?: string): InquiryFormTypeKey | null => {
  if (
    type === 'feature' ||
    type === 'bug' ||
    type === 'account' ||
    type === 'service' ||
    type === 'other'
  ) {
    return type;
  }

  return null;
};

const mapViewData = ({
  attachments,
  content,
  selectedType,
  title,
}: {
  attachments: InquiryFormAttachmentItem[];
  content: string;
  selectedType: InquiryFormTypeKey | null;
  title: string;
}): InquiryFormScreenViewData => {
  const attachmentViewData: InquiryFormAttachmentViewData[] = attachments.map(
    (attachment, index) => ({
      id: attachment.id,
      label: attachment.fileName?.trim() || `첨부 이미지 ${index + 1}`,
      uri: attachment.uri,
    }),
  );

  return {
    attachmentCountLabel: `${attachmentViewData.length}/${INQUIRY_FORM_ATTACHMENT_LIMIT}`,
    attachmentHelperLines: INQUIRY_FORM_ATTACHMENT.helperLines,
    attachmentTitle: INQUIRY_FORM_ATTACHMENT.title,
    attachments: attachmentViewData,
    contentCountLabel: `${content.length}/${INQUIRY_FORM_CONTENT_MAX_LENGTH}`,
    contentMaxLength: INQUIRY_FORM_CONTENT_MAX_LENGTH,
    contentPlaceholder: INQUIRY_FORM_PLACEHOLDERS.content,
    guideLines: INQUIRY_FORM_GUIDE_LINES,
    selectedTypeId: selectedType,
    submitLabel: INQUIRY_FORM_SUBMIT_LABEL,
    titleCountLabel: `${title.length}/${INQUIRY_FORM_TITLE_MAX_LENGTH}`,
    titleMaxLength: INQUIRY_FORM_TITLE_MAX_LENGTH,
    titlePlaceholder: INQUIRY_FORM_PLACEHOLDERS.title,
    typeOptions: INQUIRY_FORM_TYPE_OPTIONS.map(option => ({
      id: option.id,
      isSelected: option.id === selectedType,
      label: option.label,
    })),
  };
};

export const useInquiryFormData = (initialType?: string) => {
  const [attachments, setAttachments] = React.useState<InquiryFormAttachmentItem[]>(
    [],
  );
  const [content, setContent] = React.useState('');
  const [selectedType, setSelectedType] = React.useState<InquiryFormTypeKey | null>(
    resolveInitialType(initialType),
  );
  const [submitting, setSubmitting] = React.useState(false);
  const [title, setTitle] = React.useState('');

  const addAttachment = React.useCallback(
    (attachment: SubmitInquiryFormAttachmentPayload) => {
      if (attachments.length >= INQUIRY_FORM_ATTACHMENT_LIMIT) {
        throw new Error('이미지는 최대 3장까지 첨부할 수 있습니다.');
      }

      setAttachments(current => [
        ...current,
        {
          ...attachment,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        },
      ]);
    },
    [attachments.length],
  );

  const removeAttachment = React.useCallback((attachmentId: string) => {
    setAttachments(current =>
      current.filter(attachment => attachment.id !== attachmentId),
    );
  }, []);

  React.useEffect(() => {
    setSelectedType(resolveInitialType(initialType));
  }, [initialType]);

  const submit = React.useCallback(async () => {
    if (!selectedType) {
      throw new Error('문의 유형을 선택해주세요.');
    }

    if (!title.trim()) {
      throw new Error('제목을 입력해주세요.');
    }

    if (!content.trim()) {
      throw new Error('문의 내용을 입력해주세요.');
    }

    setSubmitting(true);

    try {
      await inquiryFormRepository.submitInquiryForm({
        attachments: attachments.map(attachment => ({
          fileName: attachment.fileName,
          mimeType: attachment.mimeType,
          uri: attachment.uri,
        })),
        content: content.trim(),
        title: title.trim(),
        type: selectedType,
      });
    } catch (caughtError) {
      console.error('문의 제출에 실패했습니다.', caughtError);
      if (caughtError instanceof Error && caughtError.message.trim()) {
        throw caughtError;
      }
      throw new Error('문의 접수에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }, [attachments, content, selectedType, title]);

  const reset = React.useCallback(() => {
    setAttachments([]);
    setContent('');
    setSelectedType(resolveInitialType(initialType));
    setTitle('');
  }, [initialType]);

  return {
    addAttachment,
    content,
    data: mapViewData({attachments, content, selectedType, title}),
    removeAttachment,
    reset,
    selectType: setSelectedType,
    setContent,
    setTitle,
    submit,
    submitting,
    title,
  };
};
