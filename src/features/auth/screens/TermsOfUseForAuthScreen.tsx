import React from 'react';

import {LegalDocumentScreen} from '@/features/settings';
import {useScreenView} from '@/shared/hooks/useScreenView';

export const TermsOfUseForAuthScreen = () => {
  useScreenView();

  return <LegalDocumentScreen documentKey="termsOfUse" fallbackTitle="이용약관" />;
};
