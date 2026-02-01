// SKTaxi: Root Navigator (SRP 개선)
// 인증 상태에 따른 라우팅만 담당, 알림/모달 로직은 훅으로 분리

import React from 'react';
import { Alert } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { MainNavigator } from './MainNavigator';
import { AuthNavigator } from './AuthNavigator';
import { useAuthContext } from '../contexts/AuthContext';
import { AuthState } from '../types/auth';
import { useProfileCompletion } from '../hooks/useProfileCompletion';
import { CompleteProfileScreen } from '../screens/auth/CompleteProfileScreen';
import { TermsOfUseForAuthScreen } from '../screens/auth/TermsOfUseForAuthScreen';
import { PermissionOnboardingScreen } from '../screens/PermissionOnboardingScreen';
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
  const { user, loading }: AuthState = useAuthContext();
  const { needsProfile } = useProfileCompletion();
  const permissionsComplete = !!(user as any)?.onboarding?.permissionsComplete;

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

  if (loading) {
    return null; // TODO: 로딩 화면 추가
  }

  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : needsProfile ? (
          <>
            <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
            <Stack.Screen name="TermsOfUseForAuth" component={TermsOfUseForAuthScreen} />
          </>
        ) : !permissionsComplete ? (
          <Stack.Screen name="PermissionOnboarding" component={PermissionOnboardingScreen} />
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
