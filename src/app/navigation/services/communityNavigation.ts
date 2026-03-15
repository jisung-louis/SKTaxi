import { getCurrentChatRoomIdFromNavigationState } from '../selectors/getCurrentChatRoomIdFromNavigationState';

type NavigationLike = {
  navigate: (...args: any[]) => void;
};

const tryNavigate = (navigate: () => void) => {
  try {
    navigate();
    return true;
  } catch {
    return false;
  }
};

export const navigateToChatRoom = (
  navigation: NavigationLike,
  chatRoomId: string,
) => {
  if (
    tryNavigate(() =>
      navigation.navigate('Main', {
        screen: 'CommunityTab',
        params: {
          screen: 'ChatDetail',
          params: { chatRoomId },
        },
      }),
    )
  ) {
    return;
  }

  tryNavigate(() =>
    navigation.navigate('CommunityTab', {
      screen: 'ChatDetail',
      params: { chatRoomId },
    }),
  );
};

export { getCurrentChatRoomIdFromNavigationState };
