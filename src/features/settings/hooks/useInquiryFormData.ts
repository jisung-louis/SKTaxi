import React from 'react';

import {inquiryFormRepository} from '../data/repositories/inquiryFormRepository';
import type {InquiryFormTypeKey, InquiryFormSource} from '../model/inquiryFormSource';
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
  source,
  title,
}: {
  content: string;
  selectedType: InquiryFormTypeKey | null;
  source: InquiryFormSource;
  title: string;
}): InquiryFormScreenViewData => {
  return {
    attachmentHelperLines: source.attachmentHelperLines,
    attachmentTitle: source.attachmentTitle,
    contentCountLabel: `${content.length}/${source.contentMaxLength}`,
    contentPlaceholder: source.contentPlaceholder,
    guideLines: source.guideLines,
    selectedTypeId: selectedType,
    submitLabel: source.submitLabel,
    titleCountLabel: `${title.length}/${source.titleMaxLength}`,
    titlePlaceholder: source.titlePlaceholder,
    typeOptions: source.typeOptions.map(option => ({
      id: option.id,
      isSelected: option.id === selectedType,
      label: option.label,
    })),
  };
};

export const useInquiryFormData = (initialType?: string) => {
  const [content, setContent] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedType, setSelectedType] = React.useState<InquiryFormTypeKey | null>(
    resolveInitialType(initialType),
  );
  const [source, setSource] = React.useState<InquiryFormSource | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [title, setTitle] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextSource = await inquiryFormRepository.getInquiryForm();
      setSource(nextSource);
    } catch (caughtError) {
      console.error('문의 폼 데이터를 불러오지 못했습니다.', caughtError);
      setError('문의하기 화면을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    setSelectedType(resolveInitialType(initialType));
  }, [initialType]);

  React.useEffect(() => {
    load().catch(() => undefined);
  }, [load]);

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
    setError(null);

    try {
      await inquiryFormRepository.submitInquiryForm({
        content: content.trim(),
        title: title.trim(),
        type: selectedType,
      });
    } catch (caughtError) {
      console.error('문의 제출에 실패했습니다.', caughtError);
      setError('문의 접수에 실패했습니다.');
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
    data: source
      ? mapViewData({content, selectedType, source, title})
      : null,
    error,
    loading,
    reload: load,
    reset,
    selectType: setSelectedType,
    setContent,
    setTitle,
    submit,
    submitting,
    title,
  };
};
