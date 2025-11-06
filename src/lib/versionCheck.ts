import { Platform, Linking, NativeModules } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';

/**
 * 현재 앱 버전 가져오기
 * 
 * iOS: Info.plist의 CFBundleShortVersionString (MARKETING_VERSION) 참조
 * Android: build.gradle의 versionName 참조
 * 
 * 중요: package.json의 버전은 실제 앱 버전과 다를 수 있습니다.
 * 실제 앱 버전을 가져오려면 react-native-device-info를 설치하세요:
 * 
 * npm install react-native-device-info
 * cd ios && pod install
 * 
 * 그리고 이 함수를 다음과 같이 수정:
 * import DeviceInfo from 'react-native-device-info';
 * return DeviceInfo.getVersion();
 */
export function getCurrentAppVersion(): string {
  try {
    // react-native-device-info가 설치되어 있으면 사용
    try {
      const DeviceInfo = require('react-native-device-info');
      if (DeviceInfo && DeviceInfo.getVersion) {
        return DeviceInfo.getVersion();
      }
    } catch (e) {
      // react-native-device-info가 설치되지 않았으면 fallback
    }
    
    // Fallback: package.json의 버전 사용
    // 주의: 이는 실제 앱 버전(IOS: MARKETING_VERSION, Android: versionName)과 다를 수 있습니다
    const packageJson = require('../../package.json');
    const fallbackVersion = packageJson.version || '0.0.1';
    
    console.warn(
      '⚠️ react-native-device-info가 설치되지 않아 package.json 버전을 사용합니다.\n' +
      `현재 버전: ${fallbackVersion}\n` +
      '실제 앱 버전을 가져오려면: npm install react-native-device-info'
    );
    
    return fallbackVersion;
  } catch (error) {
    console.warn('버전 정보를 가져올 수 없습니다:', error);
    return '0.0.1';
  }
}

/**
 * 버전 문자열을 숫자 배열로 변환 (예: "1.2.3" -> [1, 2, 3])
 */
function parseVersion(version: string): number[] {
  return version.split('.').map(Number).filter(n => !isNaN(n));
}

/**
 * 버전 비교 (v1 < v2면 true 반환)
 */
function isVersionLessThan(v1: string, v2: string): boolean {
  const v1Parts = parseVersion(v1);
  const v2Parts = parseVersion(v2);
  
  const maxLength = Math.max(v1Parts.length, v2Parts.length);
  
  for (let i = 0; i < maxLength; i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;
    
    if (v1Part < v2Part) return true;
    if (v1Part > v2Part) return false;
  }
  
  return false; // 같으면 false
}

/**
 * Firestore에서 최소 필수 버전 정보 가져오기
 */
export async function getMinimumRequiredVersion(): Promise<{
  version: string;
  forceUpdate: boolean;
  message?: string;
} | null> {
  try {
    const app = getApp();
    const versionDoc = await firestore(app)
      .collection('appVersion')
      .doc(Platform.OS) // 'ios' 또는 'android'
      .get();
    
    if (!versionDoc.exists) {
      return null;
    }
    
    const data = versionDoc.data();
    return {
      version: data?.minimumVersion || '0.0.1',
      forceUpdate: data?.forceUpdate || false,
      message: data?.message || undefined,
    };
  } catch (error) {
    console.error('최소 필수 버전 정보를 가져오는 중 오류:', error);
    return null;
  }
}

/**
 * 버전 체크 수행
 * @returns 강제 업데이트가 필요한지 여부와 최소 필수 버전 정보
 */
export async function checkVersionUpdate(): Promise<{
  needsUpdate: boolean;
  forceUpdate: boolean;
  minimumVersion: string;
  message?: string;
}> {
  try {
    const currentVersion = getCurrentAppVersion();
    const versionInfo = await getMinimumRequiredVersion();
    
    if (!versionInfo) {
      return {
        needsUpdate: false,
        forceUpdate: false,
        minimumVersion: currentVersion,
      };
    }
    
    const needsUpdate = isVersionLessThan(currentVersion, versionInfo.version);
    
    return {
      needsUpdate,
      forceUpdate: versionInfo.forceUpdate && needsUpdate,
      minimumVersion: versionInfo.version,
      message: versionInfo.message,
    };
  } catch (error) {
    console.error('버전 체크 중 오류:', error);
    return {
      needsUpdate: false,
      forceUpdate: false,
      minimumVersion: '0.0.1',
    };
  }
}

/**
 * 앱스토어로 이동
 * 
 * 주의: 실제 앱스토어 URL로 변경해야 합니다.
 * iOS: App Store Connect에서 앱 ID 확인 후 변경
 * Android: Play Store에서 패키지명 확인 후 변경
 */
export function openAppStore(): void {
  if (Platform.OS === 'ios') {
    // iOS App Store URL (실제 앱 ID로 변경 필요)
    // App Store Connect에서 앱 ID 확인: https://appstoreconnect.apple.com
    const appStoreUrl = 'https://apps.apple.com/app/id6754636203';
    Linking.openURL(appStoreUrl).catch(err => {
      console.error('앱스토어 열기 실패:', err);
      // Fallback: 일반 앱스토어 검색 페이지
      Linking.openURL('https://apps.apple.com/kr/app/skuri/id6754636203').catch(() => {});
    });
  } else {
    // Android Play Store URL (실제 패키지명으로 변경 필요)
    // build.gradle의 applicationId 확인: com.sktaxi
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.sktaxi';
    Linking.openURL(playStoreUrl).catch(err => {
      console.error('플레이스토어 열기 실패:', err);
      // Fallback: 일반 플레이스토어 검색 페이지
      Linking.openURL('https://play.google.com/store/search?q=skuri%20taxi').catch(() => {});
    });
  }
}

