import {useCallback, useState} from 'react';

import {useMemberRepository} from '@/di';

import {CompleteProfileFormValues} from '../model/types';
import {
  saveCompleteProfile,
  validateCompleteProfileForm,
} from '../services/profileCompletionService';
import {useAuth} from './useAuth';

export const useCompleteProfile = () => {
  const {refreshCurrentUser, user} = useAuth();
  const memberRepository = useMemberRepository();
  const [loading, setLoading] = useState(false);

  const submitProfile = useCallback(
    async (values: CompleteProfileFormValues) => {
      const validationMessage = validateCompleteProfileForm(values);
      if (validationMessage) {
        throw new Error(validationMessage);
      }

      try {
        setLoading(true);
        const memberProfile = await saveCompleteProfile({
          memberRepository,
          user,
          values,
        });
        await refreshCurrentUser(memberProfile);
      } finally {
        setLoading(false);
      }
    },
    [memberRepository, refreshCurrentUser, user],
  );

  return {
    loading,
    submitProfile,
  };
};
