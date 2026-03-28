import type {CommunityChatRoomSourceItem} from '../model/communityHomeData';
import type {ChatRoom} from '@/features/chat';

const toMillis = (value: unknown) => {
  if (!value) {
    return 0;
  }

  const millis = new Date(String(value)).getTime();
  return Number.isFinite(millis) ? millis : 0;
};

const getRoomGroup = (room: ChatRoom) => {
  switch (room.type) {
    case 'university':
      return 0;
    case 'department':
      return 1;
    case 'game':
      return 2;
    case 'custom':
      return room.isJoined === true ? 3 : 4;
    default:
      return 5;
  }
};

const formatLastMessagePreview = (room: ChatRoom) => {
  if (room.lastMessage?.type === 'image') {
    return '사진을 보냈어요.';
  }

  return room.lastMessage?.text?.trim() || '';
};

const sortRooms = (left: ChatRoom, right: ChatRoom) => {
  const groupDiff = getRoomGroup(left) - getRoomGroup(right);

  if (groupDiff !== 0) {
    return groupDiff;
  }

  const rightMillis = toMillis(right.lastMessage?.createdAt ?? right.updatedAt);
  const leftMillis = toMillis(left.lastMessage?.createdAt ?? left.updatedAt);

  if (rightMillis !== leftMillis) {
    return rightMillis - leftMillis;
  }

  return left.name.localeCompare(right.name, 'ko-KR');
};

export const buildCommunityChatRoomSourceItems = (
  rooms: ChatRoom[],
): CommunityChatRoomSourceItem[] =>
  [...rooms]
    .filter(room => room.type !== 'party')
    .sort(sortRooms)
    .map(room => ({
      description: room.description?.trim() || '채팅방 소개가 아직 없어요.',
      id: room.id ?? room.name,
      isJoined: room.isJoined === true,
      lastMessageText: formatLastMessagePreview(room),
      memberCount: room.memberCount,
      title: room.name,
      tone: room.type === 'party' ? 'custom' : room.type,
      unreadCount: room.isJoined === true ? room.unreadCount ?? 0 : 0,
      updatedAt: String(
        room.lastMessage?.createdAt ??
          room.updatedAt ??
          '',
      ),
    }));
