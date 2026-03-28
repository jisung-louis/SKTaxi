import {
  memberApiClient,
  MemberApiClient,
} from '@/features/member/data/api/memberApiClient';
import {
  noticeApiClient,
  NoticeApiClient,
} from '@/features/notice/data/api/noticeApiClient';
import {
  taxiHomeApiClient,
  TaxiHomeApiClient,
} from '@/features/taxi/data/api/taxiHomeApiClient';

import {
  memberBoardApiClient,
  MemberBoardApiClient,
} from '../api/memberBoardApiClient';
import type {MyPageSource} from '../../model/myPageSource';
import type {IMyPageRepository} from './IMyPageRepository';

const DEFAULT_DISPLAY_NAME = '스쿠리 유저';
const EMPTY_SUBTITLE = '학과와 학번을 입력해주세요.';

const buildProfileSubtitle = ({
  department,
  studentId,
}: {
  department?: string | null;
  studentId?: string | null;
}) => {
  const parts = [department?.trim(), studentId?.trim()].filter(Boolean);

  return parts.length > 0 ? parts.join(' ') : EMPTY_SUBTITLE;
};

export class SpringMyPageRepository implements IMyPageRepository {
  constructor(
    private readonly boardApiClient: MemberBoardApiClient = memberBoardApiClient,
    private readonly memberClient: MemberApiClient = memberApiClient,
    private readonly noticeClient: NoticeApiClient = noticeApiClient,
    private readonly taxiClient: TaxiHomeApiClient = taxiHomeApiClient,
  ) {}

  async getMyPage(): Promise<MyPageSource> {
    const [
      memberResponse,
      myPostsResponse,
      communityBookmarksResponse,
      noticeBookmarksResponse,
      taxiHistorySummaryResponse,
    ] = await Promise.all([
      this.memberClient.getMyMemberProfile(),
      this.boardApiClient.getMyPosts({
        page: 0,
        size: 1,
      }),
      this.boardApiClient.getMyBookmarks({
        page: 0,
        size: 1,
      }),
      this.noticeClient.getMyNoticeBookmarks({
        page: 0,
        size: 1,
      }),
      this.taxiClient.getMyTaxiHistorySummary(),
    ]);

    const member = memberResponse.data;

    return {
      profile: {
        displayName: member.nickname || DEFAULT_DISPLAY_NAME,
        email: member.email,
        photoUrl: member.photoUrl ?? null,
        subtitle: buildProfileSubtitle({
          department: member.department,
          studentId: member.studentId,
        }),
      },
      stats: {
        bookmarks:
          communityBookmarksResponse.data.totalElements +
          noticeBookmarksResponse.data.totalElements,
        myPosts: myPostsResponse.data.totalElements,
        taxiHistory: taxiHistorySummaryResponse.data.totalRideCount,
      },
    };
  }
}
