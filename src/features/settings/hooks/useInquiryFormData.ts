import React from 'react';

import {
  INQUIRY_FORM_ATTACHMENT,
  INQUIRY_FORM_CONTENT_MAX_LENGTH,
  INQUIRY_FORM_GUIDE_LINES,
  INQUIRY_FORM_PLACEHOLDERS,
  INQUIRY_FORM_SUBMIT_LABEL,
  INQUIRY_FORM_TITLE_MAX_LENGTH,
  INQUIRY_FORM_TYPE_OPTIONS,
} from '../constants/inquiryForm';
import {inquiryFormRepository} from '../data/repositories/inquiryFormRepository';
import type {InquiryFormTypeKey} from '../model/inquiryFormSource';
import type {InquiryFormScreenViewData} from '../model/inquiryFormViewData';

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
  content,
  selectedType,
  title,
}: {
  content: string;
  selectedType: InquiryFormTypeKey | null;
  title: string;
}): InquiryFormScreenViewData => {
  return {
    attachmentHelperLines: INQUIRY_FORM_ATTACHMENT.helperLines,
    attachmentTitle: INQUIRY_FORM_ATTACHMENT.title,
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
  const [content, setContent] = React.useState('');
  const [selectedType, setSelectedType] = React.useState<InquiryFormTypeKey | null>(
    resolveInitialType(initialType),
  );
  const [submitting, setSubmitting] = React.useState(false);
  const [title, setTitle] = React.useState('');

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
        content: content.trim(),
        title: title.trim(),
        type: selectedType,
      });
    } catch (caughtError) {
      console.error('문의 제출에 실패했습니다.', caughtError);
      throw new Error('문의 접수에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }, [content, selectedType, title]);

  const reset = React.useCallback(() => {
    setContent('');
    setSelectedType(resolveInitialType(initialType));
    setTitle('');
  }, [initialType]);

  return {
    content,
    data: mapViewData({content, selectedType, title}),
    reset,
    selectType: setSelectedType,
    setContent,
    setTitle,
    submit,
    submitting,
    title,
  };
};
