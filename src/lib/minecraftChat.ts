import database from '@react-native-firebase/database';
import { getApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';

const MC_MESSAGES_PATH = 'mc_chat/messages';

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
    const userDoc = await database(getApp())
      .ref(MC_MESSAGES_PATH)
      .push({
        username: user.displayName || '익명',
        message: trimmed,
        timestamp: Date.now(),
        direction: 'app_to_mc',
        appUserId: user.uid,
        appUserDisplayName: user.displayName || user.email || '익명',
        chatRoomId,
      });

    console.log('✅ 마인크래프트 메시지 전송 완료:', userDoc.key);
  } catch (error) {
    console.error('마인크래프트 메시지 전송 실패:', error);
    throw error;
  }
}

