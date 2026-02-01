// SKTaxi: 공지사항 읽음 상태 계산 유틸리티
// SRP: 읽음 상태 결정 로직 분리

import { Notice, ReadStatusMap } from '../../../repositories/interfaces/INoticeRepository';

/**
 * 공지사항의 읽음 상태를 결정
 * 
 * @param notice - 공지사항
 * @param readStatus - 읽음 상태 맵
 * @param userJoinedAt - 사용자 가입일
 * @returns 읽음 여부
 */
export function isNoticeRead(
    notice: Notice,
    readStatus: ReadStatusMap,
    userJoinedAt: unknown
): boolean {
    // 명시적으로 읽음 표시된 경우
    if (readStatus[notice.id]) {
        return true;
    }

    // 가입일 이전 공지는 자동으로 읽음 처리
    const joinedTs = userJoinedAt && (userJoinedAt as any).toMillis
        ? (userJoinedAt as any).toMillis()
        : 0;
    const postedTs = notice.postedAt && (notice.postedAt as any).toMillis
        ? (notice.postedAt as any).toMillis()
        : 0;

    if (joinedTs && postedTs && postedTs <= joinedTs) {
        return true;
    }

    return false;
}

/**
 * 읽지 않은 공지사항 개수 계산
 */
export function countUnreadNotices(
    notices: Notice[],
    readStatus: ReadStatusMap,
    userJoinedAt: unknown
): number {
    return notices.filter(notice => !isNoticeRead(notice, readStatus, userJoinedAt)).length;
}
