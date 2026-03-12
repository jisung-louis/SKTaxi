import { saveCompletedUserProfile } from '@/features/user';
import type { IUserRepository } from '@/features/user';
import { User } from '@/types/auth';

import { CompleteProfileFormValues } from '../model/types';

export const validateCompleteProfileForm = (
  values: CompleteProfileFormValues,
) => {
  if (!values.ageConfirmed || !values.termsAccepted) {
    return '계정 사용 전에 18세 이상 확인과 이용약관(EULA 포함) 동의가 필요합니다.';
  }

  if (
    !values.displayName.trim() ||
    !values.studentId.trim() ||
    !values.department.trim()
  ) {
    return '닉네임과 학번, 학과를 모두 입력해주세요.';
  }

  if (values.displayName.trim().length > 7) {
    return '닉네임은 7자 이하로 입력해주세요.';
  }

  return null;
};

export const saveCompleteProfile = async ({
  user,
  userRepository,
  values,
}: {
  user: User | null;
  userRepository: IUserRepository;
  values: CompleteProfileFormValues;
}) => {
  await saveCompletedUserProfile({
    user,
    userRepository,
    values,
  });
};
