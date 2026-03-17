import React from 'react';

import {useScreenView} from '@/shared/hooks/useScreenView';
import {LegalDocumentScreen} from '@/features/settings/screens/LegalDocumentScreen';

export const TermsOfUseForAuthScreen = () => {
  useScreenView();

  return <LegalDocumentScreen documentKey="termsOfUse" fallbackTitle="이용약관" />;
};
