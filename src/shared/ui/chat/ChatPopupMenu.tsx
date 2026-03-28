import React from 'react';

import {ChatContextMenu} from './ChatContextMenu';

interface ChatPopupMenuProps {
  canReport?: boolean
  canToggleNotification?: boolean
  leaveLabel: string
  notificationDisabled?: boolean
  notificationEnabled: boolean
  onClose: () => void
  onLeave?: () => void
  onReport?: () => void
  onToggleNotification: () => void
  right?: number
  top?: number
  visible: boolean
}

export const ChatPopupMenu = ({
  canReport = false,
  canToggleNotification = true,
  leaveLabel,
  notificationDisabled = false,
  notificationEnabled,
  onClose,
  onLeave,
  onReport,
  onToggleNotification,
  right = 12,
  top = 64,
  visible,
}: ChatPopupMenuProps) => {
  const items = [
    ...(canToggleNotification
      ? [
          {
            iconName: 'notifications-outline',
            id: 'notification',
            label: '알림',
            disabled: notificationDisabled,
            onPress: onToggleNotification,
            type: 'toggle' as const,
            value: notificationEnabled,
          },
        ]
      : []),
    ...(canReport && onReport
      ? [
          {
            iconName: 'flag-outline',
            id: 'report',
            label: '신고하기',
            onPress: onReport,
            type: 'action' as const,
          },
        ]
      : []),
    ...(onLeave
      ? [
          {
            iconName: 'log-out-outline',
            id: 'leave',
            label: leaveLabel,
            onPress: onLeave,
            tone: 'danger' as const,
            type: 'action' as const,
          },
        ]
      : []),
  ];

  return (
    <ChatContextMenu
      items={items}
      onClose={onClose}
      right={right}
      top={top}
      visible={visible}
    />
  );
};
