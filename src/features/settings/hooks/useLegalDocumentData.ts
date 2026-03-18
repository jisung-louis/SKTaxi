import React from 'react';

import {COLORS} from '@/shared/design-system/tokens';

import {legalDocumentRepository} from '../data/repositories/legalDocumentRepository';
import type {
  LegalDocumentBannerIconKey,
  LegalDocumentBannerLineSource,
  LegalDocumentBannerTone,
  LegalDocumentKey,
  LegalDocumentSource,
} from '../model/legalDocumentSource';
import type {LegalDocumentScreenViewData} from '../model/legalDocumentViewData';

const resolveBannerIcon = (iconKey: LegalDocumentBannerIconKey) => {
  switch (iconKey) {
    case 'shield':
      return 'shield-checkmark-outline';
    case 'document':
    default:
      return 'document-text-outline';
  }
};

const resolveBannerBackground = (tone: LegalDocumentBannerTone) => {
  return tone === 'blue'
    ? COLORS.accent.blueSoft
    : COLORS.brand.primaryTint;
};

const resolveBannerTitleColor = (tone: LegalDocumentBannerTone) => {
  return tone === 'blue'
    ? '#1E40AF'
    : COLORS.brand.primaryStrong;
};

const resolveBannerIconColor = (tone: LegalDocumentBannerTone) => {
  return tone === 'blue'
    ? COLORS.accent.blue
    : COLORS.brand.primaryStrong;
};

const resolveBannerLineColor = (
  tone: LegalDocumentBannerTone,
  line: LegalDocumentBannerLineSource,
) => {
  if (tone === 'blue') {
    return line.tone === 'secondary' ? '#60A5FA' : '#3B82F6';
  }

  return COLORS.status.success;
};

const mapScreen = (source: LegalDocumentSource): LegalDocumentScreenViewData => {
  return {
    id: source.id,
    title: source.title,
    banner: {
      backgroundColor: resolveBannerBackground(source.banner.tone),
      iconColor: resolveBannerIconColor(source.banner.tone),
      iconName: resolveBannerIcon(source.banner.iconKey),
      lines: source.banner.lines.map(line => ({
        color: resolveBannerLineColor(source.banner.tone, line),
        text: line.text,
      })),
      title: source.banner.title,
      titleColor: resolveBannerTitleColor(source.banner.tone),
    },
    footerLines: source.footerLines,
    sections: source.sections.map(section => ({
      id: section.id,
      paragraphs: section.paragraphs,
      title: section.title,
    })),
  };
};

export const useLegalDocumentData = (documentKey: LegalDocumentKey) => {
  const [data, setData] = React.useState<LegalDocumentScreenViewData | null>(
    null,
  );
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const source = await legalDocumentRepository.getDocument(documentKey);
      setData(mapScreen(source));
    } catch (caughtError) {
      console.error('법적 문서 데이터를 불러오지 못했습니다.', caughtError);
      setError('문서 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [documentKey]);

  React.useEffect(() => {
    load().catch(() => undefined);
  }, [load]);

  return {
    data,
    error,
    loading,
    reload: load,
  };
};
