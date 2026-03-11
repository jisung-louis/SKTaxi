import { IUserRepository } from '@/repositories/interfaces/IUserRepository';
import { setUserProperties } from '@/shared/lib/analytics';
import { User } from '@/types/auth';

import { CompleteProfileFormValues } from '../model/types';

const TERMS_VERSION = '2025-10-29';

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
  if (!user) {
    throw new Error('로그인이 필요합니다. 다시 로그인해 주세요.');
  }

  const authUid = user.uid || (user as any)?.uid;
  if (!authUid) {
    throw new Error(
      '사용자 정보를 불러오지 못했습니다. 다시 로그인해 주세요.',
    );
  }

  const displayName = values.displayName.trim();
  const studentId = values.studentId.trim();
  const department = values.department.trim();
  const agreements = {
    termsAccepted: true,
    ageConfirmed: true,
    termsVersion: TERMS_VERSION,
    acceptedAt: new Date().toISOString(),
  };

  await userRepository.checkDisplayNameAvailable(displayName, authUid);

  const existing = await userRepository.getUserProfile(authUid);
  if (!existing) {
    await userRepository.createUserProfile(authUid, {
      uid: authUid,
      email: user.email ?? null,
      displayName,
      studentId,
      department,
      photoURL: user.photoURL ?? null,
      onboarding: { permissionsComplete: false },
      agreements,
    } as any);
  }

  await userRepository.updateUserProfile(authUid, {
    displayName,
    studentId,
    department,
  } as any);
  await userRepository.updateUserProfile(authUid, {
    agreements,
  } as any);

  await setUserProperties({
    display_name: displayName,
    department,
  });
};
