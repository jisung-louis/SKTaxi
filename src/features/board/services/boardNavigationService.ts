export function navigateToBoardDetail(navigation: any, postId: string) {
  try {
    navigation.navigate('Main', {
      screen: 'CommunityTab',
      params: { screen: 'BoardDetail', params: { postId } },
    });
    return;
  } catch {}

  try {
    navigation.navigate('CommunityTab', {
      screen: 'BoardDetail',
      params: { postId },
    });
  } catch {}
}
