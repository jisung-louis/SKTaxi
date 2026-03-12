import React from 'react';
import { Alert } from 'react-native';

import { useAuthEntryGuard } from '@/app/guards';
import { ForegroundNotification } from '@/components/common/ForegroundNotification';
import { JoinRequestModal } from '@/components/common/JoinRequestModal';
import {
  useForegroundNotification,
  useJoinRequestModal,
} from '@/navigations/hooks';

import { useRegisterPushHandlers } from './registerPushHandlers';

export const AppRuntimeHost = () => {
  const {
    authState: { user, loading },
    guardResult: { needsProfile, permissionsComplete },
  } = useAuthEntryGuard();

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

  const handlePartyDeleted = React.useCallback(() => {
    handlePartyDeletedBase();
    Alert.alert('파티가 해체되었어요', '리더가 파티를 해체했습니다.', [
      { text: '확인' },
    ]);
  }, [handlePartyDeletedBase]);

  useRegisterPushHandlers({
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
    return null;
  }

  return (
    <>
      <JoinRequestModal
        visible={Boolean(joinData)}
        requesterName={requesterName}
        onDecline={handleDecline}
        onAccept={handleAccept}
        onRequestClose={handleRequestClose}
      />
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
