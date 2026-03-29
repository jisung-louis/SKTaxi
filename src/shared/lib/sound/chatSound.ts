import Sound from 'react-native-sound';

// SKTaxi: 채팅 인앱 사운드 유틸
// iOS 무음 모드에서도 재생되도록 카테고리 설정 (필요 시 조정)
Sound.setCategory('Ambient', true);

let chatSound: any | null = null;
let isChatSoundLoaded = false;
let isChatSoundLoading = false;
let shouldPlayWhenLoaded = false;

const playLoadedChatSound = () => {
  if (!chatSound || !isChatSoundLoaded) {
    return;
  }

  // 이전 재생이 남아있다면 정지 후 다시 재생
  chatSound.stop(() => {
    chatSound?.play((success: any) => {
      if (!success) {
        console.log('❌ 채팅 사운드 재생 실패');
      }
    });
  });
};

export const loadChatSound = () => {
  if (chatSound || isChatSoundLoading) {
    return;
  }

  isChatSoundLoading = true;

  chatSound = new Sound(
    // SKTaxi: 인앱 채팅 사운드 파일 이름 (iOS: 메인 번들, Android: res/raw)
    'new_chat_inapp.wav',
    // iOS: Xcode에 추가된 리소스, Android: android/app/src/main/res/raw
    Sound.MAIN_BUNDLE,
    (error: any) => {
      isChatSoundLoading = false;

      if (error) {
        console.log('❌ 채팅 사운드 로드 실패:', error);
        chatSound?.release?.();
        chatSound = null;
        isChatSoundLoaded = false;
        shouldPlayWhenLoaded = false;
        return;
      }

      isChatSoundLoaded = true;

      if (shouldPlayWhenLoaded) {
        shouldPlayWhenLoaded = false;
        playLoadedChatSound();
      }
    },
  );
};

export const playChatSound = () => {
  if (!chatSound) {
    loadChatSound();
  }

  if (!chatSound) {
    return;
  }

  if (!isChatSoundLoaded) {
    shouldPlayWhenLoaded = true;
    return;
  }

  playLoadedChatSound();
};
