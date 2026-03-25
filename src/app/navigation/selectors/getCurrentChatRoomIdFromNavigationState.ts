export const getCurrentChatRoomIdFromNavigationState = (
  state: any,
): string | undefined => {
  if (!state) {
    return undefined;
  }

  const mainTabRoute = state.routes?.find((route: any) => route.name === 'Main');
  if (!mainTabRoute) {
    return undefined;
  }

  const mainTabState = mainTabRoute.state;
  const tabRoute = mainTabState?.routes?.[mainTabState.index];

  if (!tabRoute || tabRoute.name !== 'CommunityTab') {
    return undefined;
  }

  const stackState = tabRoute.state;
  const stackRoute = stackState?.routes?.[stackState.index];

  if (stackRoute?.name !== 'ChatDetail') {
    return undefined;
  }

  return stackRoute.params?.chatRoomId;
};
