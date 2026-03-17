import React from 'react';

import {useScreenView} from '@/shared/hooks/useScreenView';

import {LegalDocumentScreen} from './LegalDocumentScreen';

export const PrivacyPolicyScreen = () => {
  useScreenView();

  return (
    <LegalDocumentScreen
      documentKey="privacyPolicy"
      fallbackTitle="개인정보 처리방침"
    />
  );
};
