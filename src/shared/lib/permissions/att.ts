import { Platform } from 'react-native';

let TrackingTransparency: any = null;

// 네이티브 모듈을 동적으로 import (모듈이 없을 때 에러 방지)
try {
  TrackingTransparency = require('react-native-tracking-transparency');
} catch (error) {
  console.warn('ATT: react-native-tracking-transparency 모듈을 찾을 수 없습니다. Pod install이 필요할 수 있습니다.');
}

type TrackingStatus = 'authorized' | 'denied' | 'restricted' | 'not-determined' | 'unavailable';

/**
 * ATT(App Tracking Transparency) 권한 요청
 * @returns 'authorized' | 'denied' | 'restricted' | 'not-determined' | 'unavailable'
 */
export async function requestATTPermission(): Promise<TrackingStatus> {
  if (Platform.OS !== 'ios') {
    console.log('ATT: Android에서는 ATT가 필요 없습니다.');
    return 'unavailable';
  }

  // 모듈이 없으면 unavailable 반환
  if (!TrackingTransparency) {
    console.warn('ATT: 네이티브 모듈이 연결되지 않았습니다. pod install을 실행해주세요.');
    return 'unavailable';
  }

  try {
    const { getTrackingStatus, requestTrackingPermission } = TrackingTransparency;
    
    // 함수가 없으면 unavailable 반환
    if (!getTrackingStatus || !requestTrackingPermission) {
      console.warn('ATT: 네이티브 함수를 찾을 수 없습니다.');
      return 'unavailable';
    }

    // 먼저 현재 상태 확인
    const currentStatus = await getTrackingStatus();
    console.log('ATT 현재 상태:', currentStatus);
    
    // 이미 결정된 경우 (authorized, denied, restricted)는 팝업이 안 뜸
    if (currentStatus !== 'not-determined') {
      console.log('ATT: 이미 결정된 상태입니다. 팝업이 표시되지 않습니다.');
      return currentStatus;
    }
    
    // not-determined 상태일 때만 팝업 표시
    console.log('ATT: 권한 요청 팝업 표시 시도...');
    const status = await requestTrackingPermission();
    console.log('ATT: 권한 요청 결과:', status);
    return status;
  } catch (error: any) {
    console.error('ATT 권한 요청 실패:', error);
    // 네이티브 모듈이 null인 경우
    if (error?.message?.includes('null') || error?.message?.includes('Cannot read property')) {
      console.error('ATT: 네이티브 모듈이 제대로 링크되지 않았습니다. 다음을 확인하세요:');
      console.error('1. cd ios && pod install');
      console.error('2. Xcode에서 프로젝트를 Clean Build');
      console.error('3. 앱을 완전히 재시작');
    }
    return 'unavailable';
  }
}

/**
 * 현재 ATT 권한 상태 확인
 */
export async function getATTPermissionStatus(): Promise<TrackingStatus> {
  if (Platform.OS !== 'ios') {
    return 'unavailable';
  }

  // 모듈이 없으면 unavailable 반환
  if (!TrackingTransparency) {
    return 'unavailable';
  }

  try {
    const { getTrackingStatus } = TrackingTransparency;
    
    if (!getTrackingStatus) {
      console.warn('ATT: getTrackingStatus 함수를 찾을 수 없습니다.');
      return 'unavailable';
    }

    const status = await getTrackingStatus();
    return status;
  } catch (error: any) {
    console.warn('ATT 권한 상태 확인 실패:', error);
    return 'unavailable';
  }
}

