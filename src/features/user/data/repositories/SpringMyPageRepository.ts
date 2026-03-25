import {
  memberApiClient,
  MemberApiClient,
} from '@/features/member/data/api/memberApiClient';

import {
  memberBoardApiClient,
  MemberBoardApiClient,
} from '../api/memberBoardApiClient';
import type {MyPageSource} from '../../model/myPageSource';
import type {IUserActivityRepository} from './IUserActivityRepository';
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
    private readonly activityRepository: IUserActivityRepository,
    private readonly boardApiClient: MemberBoardApiClient = memberBoardApiClient,
    private readonly memberClient: MemberApiClient = memberApiClient,
  ) {}

  async getMyPage(): Promise<MyPageSource> {
    const [memberResponse, myPostsResponse, bookmarks, taxiHistory] =
      await Promise.all([
        this.memberClient.getMyMemberProfile(),
        this.boardApiClient.getMyPosts({
          page: 0,
          size: 1,
        }),
        this.activityRepository.getBookmarks(),
        this.activityRepository.getTaxiHistory(),
      ]);

    const member = memberResponse.data;

    return {
      profile: {
        displayName: member.nickname || DEFAULT_DISPLAY_NAME,
        subtitle: buildProfileSubtitle({
          department: member.department,
          studentId: member.studentId,
        }),
      },
      stats: {
        bookmarks:
          bookmarks.communityItems.length + bookmarks.noticeItems.length,
        myPosts: myPostsResponse.data.totalElements,
        taxiHistory: taxiHistory.entries.length,
      },
    };
  }
}
