import React from 'react';

import {PopupMenu} from '@/shared/ui/PopupMenu';

interface ChatMessagePopupMenuProps {
  canCopy?: boolean;
  canReport?: boolean;
  onClose: () => void;
  onCopy: () => void;
  onReport: () => void;
  right: number;
  top: number;
  visible: boolean;
}

export const ChatMessagePopupMenu = ({
  canCopy = true,
  canReport = true,
  onClose,
  onCopy,
  onReport,
  right,
  top,
  visible,
}: ChatMessagePopupMenuProps) => {
  return (
    <PopupMenu
      items={[
        ...(canCopy
          ? [
              {
                iconName: 'copy-outline',
                id: 'copy',
                label: '복사',
                onPress: onCopy,
                type: 'action' as const,
              },
            ]
          : []),
        ...(canReport
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
      ]}
      onClose={onClose}
      right={right}
      top={top}
      visible={visible}
      width={156}
    />
  );
};
