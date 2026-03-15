import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import ImmersiveMode from 'react-native-immersive-mode';

import { logCrashlyticsMessage, subscribeAuthStateChange } from '@/shared/lib/firebase';
import type { VersionModalConfig } from '@/shared/types/version';

import { configureGoogleSignin } from './configureGoogleSignin';
import { checkVersionUpdate } from './versionCheck';

export interface AppBootstrapState {
  forceUpdateRequired: boolean;
  modalConfig?: VersionModalConfig;
}

export const useAppBootstrap = (): AppBootstrapState => {
  const [forceUpdateRequired, setForceUpdateRequired] = useState(false);
  const [modalConfig, setModalConfig] = useState<VersionModalConfig | undefined>();

  useEffect(() => {
    let isMounted = true;

    configureGoogleSignin();
    logCrashlyticsMessage('App mounted');

    const unsubscribeAuth = subscribeAuthStateChange(() => {});

    if (Platform.OS === 'android') {
      ImmersiveMode.setBarMode('BottomSticky');
    }

    checkVersionUpdate()
      .then(result => {
        if (!isMounted || !result.forceUpdate) {
          return;
        }

        setForceUpdateRequired(true);
        setModalConfig(result.modalConfig);
        console.log('강제 업데이트 필요:', result);
      })
      .catch(error => {
        console.error('버전 체크 실패:', error);
      });

    return () => {
      isMounted = false;
      unsubscribeAuth();
    };
  }, []);

  return {
    forceUpdateRequired,
    modalConfig,
  };
};
