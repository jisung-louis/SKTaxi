// SKTaxi: 마인크래프트 채팅 유틸리티
// IMinecraftRepository를 사용하여 Firebase 직접 의존 제거

import auth from '@react-native-firebase/auth';
import { getApp } from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import { FirestoreMinecraftRepository } from '../repositories/firestore/FirestoreMinecraftRepository';

// 싱글톤 Repository 인스턴스 (DI Provider 외부에서 사용하기 위함)
const minecraftRepository = new FirestoreMinecraftRepository();

export async function sendMinecraftMessage(chatRoomId: string, text: string): Promise<void> {
  const user = auth(getApp()).currentUser;
  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }

  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('메시지를 입력해주세요.');
  }

  try {
    const fallbackDisplayName = '스쿠리 유저';
    const profileSnap = await firestore(getApp()).collection('users').doc(user.uid).get();
    const profileData = profileSnap.data();
    const resolvedDisplayName =
      typeof profileData?.displayName === 'string' && profileData.displayName.trim().length > 0
        ? profileData.displayName.trim()
        : fallbackDisplayName;

    await minecraftRepository.sendMessage({
      chatRoomId,
      userId: user.uid,
      displayName: resolvedDisplayName,
      text: trimmed,
    });

    console.log('✅ 마인크래프트 메시지 전송 완료');
  } catch (error) {
    console.error('마인크래프트 메시지 전송 실패:', error);
    throw error;
  }
}
