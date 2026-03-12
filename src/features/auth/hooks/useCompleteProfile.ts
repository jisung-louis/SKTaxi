import { useCallback, useState } from 'react';

import { useUserRepository } from '@/features/user/hooks/useUserRepository';

import { CompleteProfileFormValues } from '../model/types';
import {
  saveCompleteProfile,
  validateCompleteProfileForm,
} from '../services/profileCompletionService';
import { useAuth } from './useAuth';

export const useCompleteProfile = () => {
  const { user } = useAuth();
  const userRepository = useUserRepository();
  const [loading, setLoading] = useState(false);

  const submitProfile = useCallback(
    async (values: CompleteProfileFormValues) => {
      const validationMessage = validateCompleteProfileForm(values);
      if (validationMessage) {
        throw new Error(validationMessage);
      }

      try {
        setLoading(true);
        await saveCompleteProfile({
          user,
          userRepository,
          values,
        });
      } finally {
        setLoading(false);
      }
    },
    [user, userRepository],
  );

  return {
    loading,
    submitProfile,
  };
};
