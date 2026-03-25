const hasStringValue = (source: Record<string, unknown>, key: string) =>
  typeof source[key] === 'string' && source[key] !== '';

export const normalizePushNotificationType = (
  rawType: unknown,
  data: Record<string, unknown> = {},
) => {
  if (typeof rawType !== 'string' || rawType.length === 0) {
    return null;
  }

  switch (rawType) {
    case 'join_request':
    case 'PARTY_JOIN_REQUEST':
      return 'join_request';
    case 'party_join_accepted':
    case 'PARTY_JOIN_ACCEPTED':
      return 'party_join_accepted';
    case 'party_join_rejected':
    case 'PARTY_JOIN_DECLINED':
      return 'party_join_rejected';
    case 'party_deleted':
      return 'party_deleted';
    case 'PARTY_CREATED':
    case 'party_created':
      return 'party_created';
    case 'PARTY_CLOSED':
    case 'party_closed':
      return 'party_closed';
    case 'PARTY_ARRIVED':
    case 'party_arrived':
      return 'party_arrived';
    case 'PARTY_ENDED':
    case 'party_ended':
      return 'party_ended';
    case 'PARTY_REOPENED':
    case 'party_reopened':
      return 'party_reopened';
    case 'MEMBER_KICKED':
    case 'member_kicked':
      return 'member_kicked';
    case 'SETTLEMENT_COMPLETED':
    case 'settlement_completed':
      return 'settlement_completed';
    case 'CHAT_MESSAGE':
    case 'chat_message':
      return 'chat_message';
    case 'CHAT_ROOM_MESSAGE':
    case 'chat_room_message':
      return 'chat_room_message';
    case 'NOTICE':
    case 'notice':
      return 'notice';
    case 'APP_NOTICE':
    case 'app_notice':
      return 'app_notice';
    case 'ACADEMIC_SCHEDULE':
    case 'academic_schedule':
      return 'academic_schedule';
    case 'POST_LIKED':
      return hasStringValue(data, 'noticeId')
        ? 'notice_post_like'
        : 'board_post_like';
    case 'COMMENT_CREATED':
      return hasStringValue(data, 'noticeId')
        ? 'notice_post_comment'
        : 'board_post_comment';
    case 'board_post_comment':
    case 'board_comment_reply':
    case 'board_post_like':
    case 'notice_post_comment':
    case 'notice_comment_reply':
    case 'notice_post_like':
      return rawType;
    default:
      return rawType.toLowerCase();
  }
};
