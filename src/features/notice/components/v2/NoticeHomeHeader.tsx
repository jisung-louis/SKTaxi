import React from 'react';
import {V2PageHeader} from '@/shared/design-system/components';

interface NoticeHomeHeaderProps {
  onPressAction: () => void;
  subtitle: string;
  title: string;
}

export const NoticeHomeHeader = ({
  onPressAction,
  subtitle,
  title,
}: NoticeHomeHeaderProps) => {
  return (
    <V2PageHeader
      actionAccessibilityLabel="공지 알림 설정 열기"
      onPressAction={onPressAction}
      subtitle={subtitle}
      title={title}
    />
  );
};
