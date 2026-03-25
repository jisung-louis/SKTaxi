import type {NoticeDetailSourceItem} from '../model/noticeDetailData';
import {NOTICE_HOME_ITEMS_MOCK} from './noticeHome.mock';

type NoticeDetailOverride = Partial<
  Omit<NoticeDetailSourceItem, 'category' | 'id' | 'postedAt' | 'title'>
>;

const NOTICE_DETAIL_OVERRIDES: Record<string, NoticeDetailOverride> = {
  'notice-home-1': {
    attachments: [
      {
        fileName: '2024_1학기_중간고사_일정표.pdf',
        id: 'notice-home-1-attachment-1',
        sizeLabel: '245KB',
      },
      {
        fileName: '시험_유의사항.pdf',
        id: 'notice-home-1-attachment-2',
        sizeLabel: '128KB',
      },
    ],
    bodyBlocks: [
      {
        id: 'notice-home-1-body-1',
        text:
          '2024학년도 1학기 중간고사 일정을 아래와 같이 안내드립니다.\n\n■ 시험 기간\n- 2024년 4월 15일(월) ~ 4월 19일(금)\n\n■ 시험 방식\n- 각 교과목 담당 교수님의 지침에 따라 진행\n- 대면 시험 원칙 (일부 교과목 온라인 병행 가능)\n\n■ 유의사항\n1. 시험 시작 10분 전까지 입실 완료\n2. 학생증 또는 신분증 지참 필수\n3. 부정행위 적발 시 해당 과목 0점 처리 및 징계 조치\n4. 시험 중 전자기기 사용 금지 (허용된 경우 제외)\n\n■ 성적 처리 일정\n- 성적 입력 기간: 4월 22일 ~ 4월 26일\n- 성적 확인: 4월 29일부터 학생 포털에서 확인 가능\n\n문의사항은 교학처(031-467-8000)로 연락 바랍니다.',
        type: 'paragraph',
      },
    ],
    isNew: true,
  },
  'notice-home-2': {
    bodyBlocks: [
      {
        id: 'notice-home-2-body-1',
        text:
          '2024년 1학기 국가장학금 신청 일정을 안내드립니다.\n\n신청 기간 내 한국장학재단 홈페이지에서 온라인으로 접수해주시기 바랍니다.\n\n■ 제출 서류\n- 가족관계증명서\n- 소득분위 증빙자료\n- 재학증명서\n\n자세한 내용은 학생지원팀으로 문의해주세요.',
        type: 'paragraph',
      },
    ],
  },
  'notice-home-5': {
    bodyBlocks: [
      {
        id: 'notice-home-5-body-1',
        text:
          '2024 봄 축제 운영 계획을 안내드립니다.\n\n행사 일정과 공연 시간표는 추후 별도 공지될 예정이며, 안전한 행사 운영을 위해 지정 구역 외 취식과 음주를 제한합니다.\n\n많은 참여 부탁드립니다.',
        type: 'paragraph',
      },
      {
        alt: '축제 안내 포스터',
        aspectRatio: 343 / 210,
        id: 'notice-home-5-image-1',
        imageUrl:
          'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
        type: 'image',
      },
    ],
  },
};

export const NOTICE_DETAIL_MOCK: NoticeDetailSourceItem[] = NOTICE_HOME_ITEMS_MOCK.map(
  notice => {
    const override = NOTICE_DETAIL_OVERRIDES[notice.id];

    return {
      attachments: override?.attachments ?? [],
      bodyBlocks: override?.bodyBlocks ?? [
        {
          id: `${notice.id}-body-1`,
          text: `${notice.title}\n\n세부 안내 사항은 추후 공지될 예정입니다. 관련 문의는 해당 부서로 연락해주세요.`,
          type: 'paragraph',
        },
      ],
      bookmarkCount: override?.bookmarkCount ?? 0,
      category: notice.category,
      comments: override?.comments ?? [],
      id: notice.id,
      isNew: override?.isNew ?? false,
      likeCount: override?.likeCount ?? 0,
      postedAt: notice.postedAt,
      title: notice.title,
    };
  },
);
