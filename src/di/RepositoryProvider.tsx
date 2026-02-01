// SKTaxi: Repository Provider 컴포넌트 - DIP 의존성 주입 구현
// Repository 인스턴스를 앱 전체에 제공하는 Provider

import React, { useMemo, ReactNode } from 'react';
import { RepositoryContext, RepositoryContainer } from './RepositoryContext';

import { FirestorePartyRepository } from '../repositories/firestore/FirestorePartyRepository';
import { FirestoreChatRepository } from '../repositories/firestore/FirestoreChatRepository';
import { FirestoreUserRepository } from '../repositories/firestore/FirestoreUserRepository';
import { FirestoreBoardRepository } from '../repositories/firestore/FirestoreBoardRepository';
import { FirestoreNoticeRepository } from '../repositories/firestore/FirestoreNoticeRepository';
import { FirestoreCourseRepository } from '../repositories/firestore/FirestoreCourseRepository';
import { FirestoreNotificationRepository } from '../repositories/firestore/FirestoreNotificationRepository';
import { FirestoreAppNoticeRepository } from '../repositories/firestore/FirestoreAppNoticeRepository';
import { FirestoreCafeteriaRepository } from '../repositories/firestore/FirestoreCafeteriaRepository';
import { FirestoreAcademicRepository } from '../repositories/firestore/FirestoreAcademicRepository';
import { FirestoreInquiryRepository } from '../repositories/firestore/FirestoreInquiryRepository';
import { FirestoreStorageRepository } from '../repositories/firestore/FirestoreStorageRepository';
import { FirestoreTimetableRepository } from '../repositories/firestore/FirestoreTimetableRepository';
import { FirestoreAuthRepository } from '../repositories/firestore/FirestoreAuthRepository';

interface RepositoryProviderProps {
  children: ReactNode;
  /**
   * 커스텀 Repository 컨테이너 주입 (테스트용)
   * 제공되지 않으면 기본 Firestore 구현체 사용
   */
  customRepositories?: Partial<RepositoryContainer>;
}

/**
 * Repository Provider 컴포넌트
 * App.tsx 최상위에서 사용하여 모든 하위 컴포넌트에 Repository 제공
 */
export function RepositoryProvider({ children, customRepositories }: RepositoryProviderProps) {
  // Repository 인스턴스를 메모이제이션하여 불필요한 재생성 방지
  // 이는 Context re-render 문제를 방지
  const repositories = useMemo<RepositoryContainer>(() => {
    // 기본 Firestore 구현체
    const defaultRepositories: RepositoryContainer = {
      partyRepository: new FirestorePartyRepository(),
      chatRepository: new FirestoreChatRepository(),
      userRepository: new FirestoreUserRepository(),
      boardRepository: new FirestoreBoardRepository(),
      noticeRepository: new FirestoreNoticeRepository(),
      courseRepository: new FirestoreCourseRepository(),
      notificationRepository: new FirestoreNotificationRepository(),
      appNoticeRepository: new FirestoreAppNoticeRepository(),
      cafeteriaRepository: new FirestoreCafeteriaRepository(),
      academicRepository: new FirestoreAcademicRepository(),
      inquiryRepository: new FirestoreInquiryRepository(),
      storageRepository: new FirestoreStorageRepository(),
      timetableRepository: new FirestoreTimetableRepository(),
      authRepository: new FirestoreAuthRepository(),
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
