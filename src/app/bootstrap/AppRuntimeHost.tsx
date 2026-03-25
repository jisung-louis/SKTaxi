import React from 'react';
import { Alert } from 'react-native';

import { useAuthEntryGuard } from '@/app/guards';
import { JoinRequestModal, useJoinRequestModal, useMyParty } from '@/features/taxi';
import { ForegroundNotification } from '@/shared/ui/ForegroundNotification';

import { useRegisterPushHandlers } from './registerPushHandlers';
import { useForegroundNotificationRuntime } from './useForegroundNotificationRuntime';

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
  } = useForegroundNotificationRuntime();
  const {isLeader, myParty} = useMyParty();

  const {
    joinData,
    setJoinData,
    requesterName,
    handleAccept,
    handleDecline,
    handleRequestClose,
    handleJoinRequestAccepted,
    handleJoinRequestRejected,
  } = useJoinRequestModal({
    activeLeaderPartyId: isLeader ? myParty?.id ?? null : null,
    enabled: !needsProfile && permissionsComplete,
    userId: user?.uid,
  });

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
