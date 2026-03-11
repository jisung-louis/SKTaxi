// SKTaxi: Root Navigator (SRP 개선)
// 인증 상태에 따른 라우팅만 담당, 알림/모달 로직은 훅으로 분리

import React from 'react';
import { Alert } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthEntryGuard } from '@/app/guards';
import {
  CompleteProfileScreen,
  PermissionOnboardingScreen,
  TermsOfUseForAuthScreen,
} from '@/features/auth';

import { RootStackParamList } from './types';
import { MainNavigator } from './MainNavigator';
import { AuthNavigator } from './AuthNavigator';
import { JoinRequestModal } from '../components/common/JoinRequestModal';
import { ForegroundNotification } from '../components/common/ForegroundNotification';

// 분리된 훅들
import {
  useForegroundNotification,
  useJoinRequestModal,
  useFcmSetup,
} from './hooks';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const {
    authState: { user, loading },
    guardResult: { needsProfile, permissionsComplete, route },
  } = useAuthEntryGuard();

  // 포그라운드 알림 관리
  const {
    foregroundNotification,
    handleForegroundNotificationPress,
    handleForegroundNotificationDismiss,
    handlePartyDeleted: handlePartyDeletedBase,
    handleNoticeReceived,
    handleAppNoticeNotificationReceived,
    handleChatMessageReceived,
    handleSettlementCompleted,
    handleMemberKicked,
    handlePartyCreated,
    handleBoardNotificationReceived,
    handleNoticeNotificationReceived,
    handleChatRoomMessageReceived,
    getCurrentScreen,
    getCurrentChatRoomId,
  } = useForegroundNotification();

  // 동승 요청 모달 관리
  const {
    joinData,
    setJoinData,
    requesterName,
    handleAccept,
    handleDecline,
    handleRequestClose,
    handleJoinRequestAccepted,
    handleJoinRequestRejected,
  } = useJoinRequestModal(user?.uid);

  // 파티 삭제 알림 핸들러 (Alert 포함)
  const handlePartyDeleted = () => {
    handlePartyDeletedBase();
    Alert.alert(
      '파티가 해체되었어요',
      '리더가 파티를 해체했습니다.',
      [{ text: '확인' }]
    );
  };

  // FCM 설정 및 토큰 관리
  useFcmSetup({
    userId: user?.uid,
    needsProfile,
    permissionsComplete,
    setJoinData,
    handlePartyDeleted,
    handleNoticeReceived,
    handleAppNoticeNotificationReceived,
    handleJoinRequestAccepted,
    handleJoinRequestRejected,
    handleChatMessageReceived,
    getCurrentScreen,
    handleSettlementCompleted,
    handleMemberKicked,
    handlePartyCreated,
    handleBoardNotificationReceived,
    handleNoticeNotificationReceived,
    handleChatRoomMessageReceived,
    getCurrentChatRoomId,
  });

  if (loading || route === 'loading') {
    return null; // TODO: 로딩 화면 추가
  }

  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {route === 'auth' ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : route === 'completeProfile' ? (
          <>
            <Stack.Screen
              name="CompleteProfile"
              component={CompleteProfileScreen}
            />
            <Stack.Screen
              name="TermsOfUseForAuth"
              component={TermsOfUseForAuthScreen}
            />
          </>
        ) : route === 'permissionOnboarding' ? (
          <Stack.Screen
            name="PermissionOnboarding"
            component={PermissionOnboardingScreen}
          />
        ) : (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>

      {/* 동승요청 모달 */}
      <JoinRequestModal
        visible={!!joinData}
        requesterName={requesterName}
        onDecline={handleDecline}
        onAccept={handleAccept}
        onRequestClose={handleRequestClose}
      />

      {/* 포그라운드 알림 */}
      <ForegroundNotification
        visible={foregroundNotification.visible}
        title={foregroundNotification.title}
        body={foregroundNotification.body}
        onPress={handleForegroundNotificationPress}
        onDismiss={handleForegroundNotificationDismiss}
      />
    </>
  );
};
