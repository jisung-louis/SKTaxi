export interface ChatThreadHeaderViewData {
  iconBackgroundColor: string
  iconColor: string
  iconName: string
  subtitle: string
  title: string
}

export interface ChatThreadMenuViewData {
  canReport?: boolean
  canLeave?: boolean
  canToggleNotification?: boolean
  leaveLabel: string
  notificationEnabled: boolean
}

export type ChatAvatarViewData =
  | {
      backgroundColor: string
      kind: 'image'
      uri: string
    }
  | {
      backgroundColor: string
      kind: 'icon'
      iconColor: string
      iconName: string
    }
  | {
      backgroundColor: string
      kind: 'label'
      label: string
      textColor: string
    }

export interface ChatThreadDateDividerViewData {
  id: string
  label: string
  type: 'date-divider'
}

export interface ChatThreadMessageViewData {
  avatar?: ChatAvatarViewData
  direction: 'incoming' | 'outgoing' | 'system'
  id: string
  imageUrl?: string
  minuteKey: string
  senderId: string
  senderName: string
  text: string
  timeLabel: string
  type: 'message'
}

export type ChatThreadItemViewData =
  | ChatThreadDateDividerViewData
  | ChatThreadMessageViewData

export interface ChatThreadListViewData {
  currentUserId: string
  header: ChatThreadHeaderViewData
  items: ChatThreadItemViewData[]
  menu: ChatThreadMenuViewData
  roomId: string
}
