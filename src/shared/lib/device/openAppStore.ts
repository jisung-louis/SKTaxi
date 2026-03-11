import { Linking, Platform } from 'react-native';

export function openAppStore(customUrl?: string): void {
  if (customUrl) {
    Linking.openURL(customUrl).catch(error => {
      console.error('URL 열기 실패:', error);
    });
    return;
  }

  if (Platform.OS === 'ios') {
    const appStoreUrl = 'https://apps.apple.com/app/id6754636203';
    Linking.openURL(appStoreUrl).catch(error => {
      console.error('앱스토어 열기 실패:', error);
      Linking.openURL('https://apps.apple.com/kr/app/skuri/id6754636203').catch(() => {});
    });
    return;
  }

  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.jisung.sktaxi';
  Linking.openURL(playStoreUrl).catch(error => {
    console.error('플레이스토어 열기 실패:', error);
    Linking.openURL('https://play.google.com/store/search?q=skuri%20taxi').catch(() => {});
  });
}
