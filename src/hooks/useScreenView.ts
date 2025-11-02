import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useRoute } from '@react-navigation/native';
import { logScreenView } from '../lib/analytics';

/**
 * 화면 포커스 시 자동으로 Analytics screen_view 이벤트를 로깅하는 hook
 * 
 * 사용법:
 * ```tsx
 * export const MyScreen = () => {
 *   useScreenView(); // 자동으로 화면 이름이 로깅됨
 *   return <View>...</View>;
 * }
 * ```
 */
export const useScreenView = () => {
  const route = useRoute();
  
  useFocusEffect(
    useCallback(() => {
      const screenName = route.name;
      // 네이티브 컴포넌트 이름 필터링
      const nativeComponentNames = [
        'RNSScreen',
        'UIViewController',
        'RCTFabricModalHostViewController',
        'RCTAlertController',
        'SFAuthenticationViewController',
        'UIAlertController',
      ];
      
      if (screenName && 
          !nativeComponentNames.includes(screenName) && 
          screenName.trim() !== '') {
        logScreenView(screenName);
      }
    }, [route.name])
  );
};

