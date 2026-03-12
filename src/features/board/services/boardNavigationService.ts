export function navigateToBoardDetail(navigation: any, postId: string) {
  navigation.navigate('Main', {
    screen: '게시판',
    params: { screen: 'BoardDetail', params: { postId } },
  });
}

export function navigateToBoardSearch(navigation: any, searchText: string) {
  navigation.navigate('BoardMain', {
    searchText,
    fromHashtag: true,
  });
}
