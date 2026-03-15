import React from 'react';
import { AppState, Linking } from 'react-native';

import {
  checkPushPermissionGranted,
  requestPushPermission,
} from '@/shared/lib/firebase/notificationPermission';

export interface NotificationPermissionBubbleState {
  bubbleVisible: boolean;
  checking: boolean;
  dismissBubble: () => void;
  allowNotification: () => Promise<void>;
}

export const useNotificationPermissionBubble =
  (): NotificationPermissionBubbleState => {
    const [bubbleVisible, setBubbleVisible] = React.useState(false);
    const [checking, setChecking] = React.useState(true);

    React.useEffect(() => {
      let mounted = true;

      const refreshPermissionState = async () => {
        try {
          const granted = await checkPushPermissionGranted();
          if (mounted) {
            setBubbleVisible(!granted);
          }
        } catch (error) {
          console.warn('알림 권한 확인 실패:', error);
          if (mounted) {
            setBubbleVisible(true);
          }
        } finally {
          if (mounted) {
            setChecking(false);
          }
        }
      };

      const syncPermissionState = () => {
        refreshPermissionState().catch(error => {
          console.warn('알림 권한 상태 동기화 실패:', error);
        });
      };

      syncPermissionState();

      const subscription = AppState.addEventListener('change', state => {
        if (state === 'active') {
          syncPermissionState();
        }
      });

      return () => {
        mounted = false;
        subscription.remove();
      };
    }, []);

    const allowNotification = React.useCallback(async () => {
      try {
        const granted = await requestPushPermission();
        if (granted) {
          setBubbleVisible(false);
          return;
        }

        await Linking.openSettings();
      } catch (error) {
        console.warn('알림 권한 요청 실패:', error);
        try {
          await Linking.openSettings();
        } catch (openSettingsError) {
          console.warn('알림 설정 열기 실패:', openSettingsError);
        }
      }
    }, []);

    const dismissBubble = React.useCallback(() => {
      setBubbleVisible(false);
    }, []);

    return {
      bubbleVisible,
      checking,
      dismissBubble,
      allowNotification,
    };
  };
