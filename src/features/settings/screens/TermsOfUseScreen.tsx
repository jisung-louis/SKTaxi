import React from 'react';

import {useScreenView} from '@/shared/hooks/useScreenView';

import {LegalDocumentScreen} from './LegalDocumentScreen';

export const TermsOfUseScreen = () => {
  useScreenView();

  return <LegalDocumentScreen documentKey="termsOfUse" fallbackTitle="이용약관" />;
};
