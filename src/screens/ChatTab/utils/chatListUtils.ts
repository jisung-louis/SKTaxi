// SKTaxi: 채팅 목록 유틸리티
// SRP: 채팅 목록에서 사용되는 포맷팅 및 스타일 헬퍼 함수

import { COLORS } from '../../../constants/colors';
import { ChatRoom } from '../../../types/firestore';

/**
 * 타임스탬프를 '몇 분 전', '몇 시간 전' 등의 문자열로 변환
 */
export const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return '';

    try {
        const now = new Date();
        const createdAt = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const diffMs = now.getTime() - createdAt.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) return `${diffDays}일 전`;
        if (diffHours > 0) return `${diffHours}시간 전`;
        if (diffMinutes > 0) return `${diffMinutes}분 전`;
        return '방금 전';
    } catch {
        return '';
    }
};

/**
 * 채팅방 타입에 따른 아이콘 이름 반환
 */
export const getChatRoomIcon = (type: ChatRoom['type']) => {
    switch (type) {
        case 'university':
            return 'school-outline';
        case 'department':
            return 'people-outline';
        case 'game':
            return 'game-controller-outline';
        case 'custom':
            return 'chatbubbles-outline';
        default:
            return 'chatbubble-outline';
    }
};

/**
 * 채팅방 타입에 따른 색상 반환
 */
export const getChatRoomColor = (type: ChatRoom['type']) => {
    switch (type) {
        case 'university':
            return COLORS.accent.blue;
        case 'department':
            return COLORS.accent.green;
        case 'game':
            return COLORS.accent.orange;
        case 'custom':
        default:
            return COLORS.accent.red;
    }
};

/**
 * 타임스탬프를 밀리초로 변환 (안전한 처리)
 */
export const safeToMillis = (ts: any): number | null => {
    try {
        if (!ts) return null;
        if (ts.toMillis) return ts.toMillis();
        if (ts.toDate) return ts.toDate().getTime();
        return new Date(ts).getTime();
    } catch {
        return null;
    }
};
