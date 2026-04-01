import type {
  NavigationState,
  PartialState,
} from '@react-navigation/native';

import {
  getCurrentLeafRouteFromNavigationState,
} from './getCurrentLeafRouteFromNavigationState';

type NavigationStateLike = NavigationState | PartialState<NavigationState>;

export const getCurrentChatRoomIdFromNavigationState = (
  state: NavigationStateLike | undefined,
): string | undefined => {
  const activeRoute = getCurrentLeafRouteFromNavigationState(state);

  if (activeRoute?.name !== 'ChatDetail') {
    return undefined;
  }

  const chatRoomId = activeRoute.params?.chatRoomId;
  return typeof chatRoomId === 'string' ? chatRoomId : undefined;
};
