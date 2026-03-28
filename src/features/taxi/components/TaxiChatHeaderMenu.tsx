import React from 'react';

import {ChatContextMenu} from '@/shared/ui/chat';

interface TaxiChatHeaderMenuProps {
  canCancelParty: boolean;
  canEditParty: boolean;
  canLeave: boolean;
  destructiveActionLabel: string;
  notificationDisabled?: boolean;
  notificationEnabled: boolean;
  onPressDestructiveAction: () => void;
  onClose: () => void;
  onEditParty: () => void;
  onLeaveParty: () => void;
  onToggleNotification: () => void;
  visible: boolean;
}

export const TaxiChatHeaderMenu = ({
  canCancelParty,
  canEditParty,
  canLeave,
  destructiveActionLabel,
  notificationDisabled = false,
  notificationEnabled,
  onPressDestructiveAction,
  onClose,
  onEditParty,
  onLeaveParty,
  onToggleNotification,
  visible,
}: TaxiChatHeaderMenuProps) => {
  const items = [
    {
      disabled: notificationDisabled,
      iconName: 'notifications-outline',
      id: 'notification',
      label: '알림',
      onPress: onToggleNotification,
      type: 'toggle' as const,
      value: notificationEnabled,
    },
    ...(canEditParty
      ? [
          {
            iconName: 'create-outline',
            id: 'edit',
            label: '수정하기',
            onPress: onEditParty,
            type: 'action' as const,
          },
        ]
      : []),
    ...(canCancelParty
      ? [
          {
            iconName: 'close-circle-outline',
            id: 'destructive',
            label: destructiveActionLabel,
            onPress: onPressDestructiveAction,
            tone: 'danger' as const,
            type: 'action' as const,
          },
        ]
      : []),
    ...(canLeave
      ? [
          {
            iconName: 'log-out-outline',
            id: 'leave',
            label: '파티 나가기',
            onPress: onLeaveParty,
            tone: 'danger' as const,
            type: 'action' as const,
          },
        ]
      : []),
  ];

  return <ChatContextMenu items={items} onClose={onClose} visible={visible} />;
};
