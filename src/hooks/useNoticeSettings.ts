import { useEffect, useMemo, useState, useCallback } from 'react';
import { getFirestore, doc, onSnapshot, setDoc, updateDoc } from '@react-native-firebase/firestore';
import { useAuth } from './useAuth';

export interface NoticeSettingsDetail {
  // 키: 공지 카테고리(문자열), 값: on/off
  [category: string]: boolean;
}

export interface NoticeSettingsState {
  noticeNotifications: boolean; // 마스터 스위치
  noticeNotificationsDetail: NoticeSettingsDetail; // 카테고리별
}

const DEFAULT_SETTINGS: NoticeSettingsState = {
  noticeNotifications: true,
  noticeNotificationsDetail: {},
};

export function useNoticeSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NoticeSettingsState>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setSettings(DEFAULT_SETTINGS);
      setLoading(false);
      return;
    }

    const db = getFirestore();
    const userRef = doc(db, 'users', user.uid);
    setLoading(true);
    setError(null);
    const unsubscribe = onSnapshot(
      userRef,
      (snap) => {
        const data = snap.data() || {} as any;
        const ns = (data.notificationSettings || {}) as any;
        const next: NoticeSettingsState = {
          noticeNotifications: ns.noticeNotifications !== false,
          noticeNotificationsDetail: (ns.noticeNotificationsDetail || {}) as NoticeSettingsDetail,
        };
        setSettings(next);
        setLoading(false);
      },
      (err) => {
        setError(err?.message || '알림 설정을 불러오지 못했습니다.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const updateMaster = useCallback(async (enabled: boolean) => {
    if (!user?.uid) return;
    const db = getFirestore();
    const userRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userRef, { notificationSettings: { noticeNotifications: enabled } }, { merge: true });
    } catch (e) {
      setError('설정 저장에 실패했습니다.');
      throw e;
    }
  }, [user?.uid]);

  const updateDetail = useCallback(async (categoryKey: string, enabled: boolean) => {
    if (!user?.uid) return;
    const db = getFirestore();
    const userRef = doc(db, 'users', user.uid);
    try {
      const path = `notificationSettings.noticeNotificationsDetail.${categoryKey}`;
      // updateDoc의 dot notation 사용
      await updateDoc(userRef, { [path]: enabled } as any);
    } catch (e) {
      // 문서가 없을 수 있으므로 setDoc merge 대체 수행
      try {
        await setDoc(userRef, { notificationSettings: { noticeNotificationsDetail: { [categoryKey]: enabled } } }, { merge: true });
      } catch (err) {
        setError('설정 저장에 실패했습니다.');
        throw err;
      }
    }
  }, [user?.uid]);

  const value = useMemo(() => ({ settings, loading, error, updateMaster, updateDetail }), [settings, loading, error, updateMaster, updateDetail]);
  return value;
}


