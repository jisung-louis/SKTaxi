/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import 'react-native-gesture-handler';
import React, { useEffect, useMemo, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import { CourseSearchProvider } from './src/contexts/CourseSearchContext';
import { RootNavigator } from './src/navigations/RootNavigator';
import './src/config/firebase';
import auth from '@react-native-firebase/auth';
import { configureGoogleSignin } from './src/config/google';
import { checkVersionUpdate, VersionModalConfig } from './src/lib/versionCheck';
import { ForceUpdateModal } from './src/components/common/ForceUpdateModal';
import ImmersiveMode from 'react-native-immersive-mode';
import { Platform } from 'react-native';

const App = () => {
  const [forceUpdateRequired, setForceUpdateRequired] = useState(false);
  const [modalConfig, setModalConfig] = useState<VersionModalConfig | undefined>();

  useEffect(() => {
    configureGoogleSignin();
    // SKTaxi: 간소화 정책 - 앱 시작 즉시 저장 로직은 제거하고 로그인 성공 시점에서만 저장
    // SKTaxi: 포그라운드 메시지 처리 핸들러는 RootNavigator에서 등록
    // SKTaxi: 토큰 리프레시 구독은 생략(간소화). 필요 시 아래 주석 해제
    // const unsub = subscribeFcmTokenRefresh();
    const unsubAuth = auth().onAuthStateChanged(() => {});
    if (Platform.OS === 'android') {
      ImmersiveMode.setBarMode('BottomSticky');
    }
    
    // SKTaxi: 버전 체크 및 강제 업데이트 확인
    checkVersionUpdate().then((result) => {
      if (result.forceUpdate) {
        setForceUpdateRequired(true);
        setModalConfig(result.modalConfig);
        console.log('강제 업데이트 필요:', result);
      }
    }).catch((error) => {
      console.error('버전 체크 실패:', error);
    });
    
    return () => { unsubAuth(); };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <CourseSearchProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </CourseSearchProvider>
        </AuthProvider>
        {/* SKTaxi: 강제 업데이트 모달 */}
        <ForceUpdateModal 
          visible={forceUpdateRequired} 
          config={modalConfig}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
