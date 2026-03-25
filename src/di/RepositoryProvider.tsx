// SKTaxi: Repository Provider 컴포넌트 - DIP 의존성 주입 구현
// Repository 인스턴스를 앱 전체에 제공하는 Provider

import React, {useMemo, type ReactNode} from 'react';

import {SpringBoardRepository} from '@/features/board/data/repositories/SpringBoardRepository';
import {SpringMemberRepository} from '@/features/member';
import {RepositoryContext, RepositoryContainer} from './RepositoryContext';
import {FirebaseAuthRepository} from '@/features/auth';
import {SpringAcademicRepository} from '@/features/campus/data/repositories/SpringAcademicRepository';
import {SpringCampusBannerRepository} from '@/features/campus/data/repositories/SpringCampusBannerRepository';
import {SpringCafeteriaRepository} from '@/features/campus/data/repositories/SpringCafeteriaRepository';
import {SpringChatRepository} from '@/features/chat/data/repositories/SpringChatRepository';
import {SpringNoticeRepository} from '@/features/notice/data/repositories/SpringNoticeRepository';
import {SpringAppNoticeRepository} from '@/features/settings/data/repositories/SpringAppNoticeRepository';
import {MockInquiryRepository} from '@/features/settings/data/repositories/MockInquiryRepository';
import {SpringPartyRepository} from '@/features/taxi/data/repositories/SpringPartyRepository';
import {SpringNotificationActionRepository} from '@/features/taxi/data/repositories/SpringNotificationActionRepository';
import {SpringTaxiChatRepository} from '@/features/taxi/data/repositories/SpringTaxiChatRepository';
import {MockCourseRepository} from '@/features/timetable/data/repositories/MockCourseRepository';
import {MockTimetableRepository} from '@/features/timetable/data/repositories/MockTimetableRepository';
import {SpringNotificationRepository} from '@/features/user/data/repositories/SpringNotificationRepository';
import {MockStorageRepository} from '@/shared/lib/mock/MockStorageRepository';

interface RepositoryProviderProps {
  children: ReactNode;
  /**
   * 커스텀 Repository 컨테이너 주입 (테스트용)
   * 제공되지 않으면 기본 mock 구현체 사용
   */
  customRepositories?: Partial<RepositoryContainer>;
}

/**
 * Repository Provider 컴포넌트
 * App.tsx 최상위에서 사용하여 모든 하위 컴포넌트에 Repository 제공
 */
export function RepositoryProvider({
  children,
  customRepositories,
}: RepositoryProviderProps) {
  // Repository 인스턴스를 메모이제이션하여 불필요한 재생성 방지
  // 이는 Context re-render 문제를 방지
  const repositories = useMemo<RepositoryContainer>(() => {
    // Spring으로 이전된 경계는 실서비스 구현을 우선 사용하고
    // 나머지 미이전 영역만 mock 구현체를 유지한다.
    const defaultRepositories: RepositoryContainer = {
      partyRepository: new SpringPartyRepository(),
      chatRepository: new SpringChatRepository(),
      boardRepository: new SpringBoardRepository(),
      noticeRepository: new SpringNoticeRepository(),
      courseRepository: new MockCourseRepository(),
      notificationRepository: new SpringNotificationRepository(),
      appNoticeRepository: new SpringAppNoticeRepository(),
      cafeteriaRepository: new SpringCafeteriaRepository(),
      academicRepository: new SpringAcademicRepository(),
      campusBannerRepository: new SpringCampusBannerRepository(),
      inquiryRepository: new MockInquiryRepository(),
      storageRepository: new MockStorageRepository(),
      timetableRepository: new MockTimetableRepository(),
      authRepository: new FirebaseAuthRepository(),
      memberRepository: new SpringMemberRepository(),
      notificationActionRepository: new SpringNotificationActionRepository(),
      taxiChatRepository: new SpringTaxiChatRepository(),
    };

    // 커스텀 Repository가 제공되면 병합 (테스트용)
    if (customRepositories) {
      return {
        ...defaultRepositories,
        ...customRepositories,
      };
    }

    return defaultRepositories;
  }, [customRepositories]);

  return (
    <RepositoryContext.Provider value={repositories}>
      {children}
    </RepositoryContext.Provider>
  );
}
