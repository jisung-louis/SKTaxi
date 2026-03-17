import React from 'react';

import {profileEditRepository} from '../data/repositories/profileEditRepository';
import type {ProfileEditDraft} from '../model/profileEditSource';
import type {ProfileEditSource} from '../model/profileEditSource';
import type {ProfileEditScreenViewData} from '../model/profileEditViewData';

const toViewData = (source: ProfileEditSource): ProfileEditScreenViewData => ({
  avatarLabel: source.avatarLabel,
  department: source.department,
  departmentOptions: source.departmentOptions,
  displayName: source.displayName,
  gradeLabel: source.gradeLabel,
  saveLabel: '저장하기',
  studentId: source.studentId,
  title: '프로필 수정',
});

export const useProfileEditScreenData = () => {
  const [data, setData] = React.useState<ProfileEditScreenViewData>();
  const [error, setError] = React.useState<string>();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const reload = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);

      const source = await profileEditRepository.getProfileEdit();
      setData(toViewData(source));
    } catch (caughtError) {
      console.error('Failed to fetch profile edit data', caughtError);
      setError('프로필 수정 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveChanges = React.useCallback(async (draft: ProfileEditDraft) => {
    try {
      setSaving(true);

      await profileEditRepository.saveProfileEdit(draft);
      const nextSource = await profileEditRepository.getProfileEdit();
      setData(toViewData(nextSource));
    } finally {
      setSaving(false);
    }
  }, []);

  React.useEffect(() => {
    reload().catch(() => undefined);
  }, [reload]);

  return {
    data,
    error,
    loading,
    reload,
    saveChanges,
    saving,
  };
};
