import {
  type IMemberRepository,
  type MemberProfile,
  SpringMemberRepository,
} from '@/features/member';
import {DEPARTMENT_OPTIONS} from '@/shared/constants/departments';

import type {
  ProfileEditDraft,
  ProfileEditSource,
} from '../../model/profileEditSource';
import type {IProfileEditRepository} from './IProfileEditRepository';

const DEFAULT_AVATAR_LABEL = '?';

const toProfileEditSource = (
  memberProfile: MemberProfile,
): ProfileEditSource => ({
  avatarLabel:
    memberProfile.nickname.trim().slice(0, 1) || DEFAULT_AVATAR_LABEL,
  department: memberProfile.department ?? '',
  departmentOptions: DEPARTMENT_OPTIONS,
  displayName: memberProfile.nickname,
  gradeLabel: '',
  studentId: memberProfile.studentId ?? '',
});

export class SpringProfileEditRepository implements IProfileEditRepository {
  constructor(
    private readonly memberRepository: IMemberRepository = new SpringMemberRepository(),
  ) {}

  async getProfileEdit(): Promise<ProfileEditSource> {
    const memberProfile = await this.memberRepository.getMyMemberProfile();
    return toProfileEditSource(memberProfile);
  }

  async saveProfileEdit(draft: ProfileEditDraft): Promise<ProfileEditSource> {
    const memberProfile = await this.memberRepository.updateMyProfile({
      department: draft.department.trim(),
      nickname: draft.displayName.trim(),
      studentId: draft.studentId.trim(),
    });

    return toProfileEditSource(memberProfile);
  }
}
