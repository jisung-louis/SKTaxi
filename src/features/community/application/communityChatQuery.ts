import type {CommunityChatRoomSourceItem} from '../model/communityHomeData';
import type {ChatRoom} from '@/features/chat';

const toMillis = (value: unknown) => {
  if (!value) {
    return 0;
  }

  const millis = new Date(String(value)).getTime();
  return Number.isFinite(millis) ? millis : 0;
};

const sortRooms = (left: ChatRoom, right: ChatRoom) => {
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
    .filter(room => room.type !== 'party' && room.isJoined !== false)
    .sort(sortRooms)
    .map(room => ({
      id: room.id ?? room.name,
      lastMessageText:
        room.lastMessage?.text?.trim() || '아직 메시지가 없어요',
      memberCount: room.memberCount,
      title: room.name,
      tone: room.type === 'party' ? 'custom' : room.type,
      unreadCount: room.unreadCount ?? 0,
      updatedAt: String(
        room.lastMessage?.createdAt ??
          room.updatedAt ??
          '',
      ),
    }));
