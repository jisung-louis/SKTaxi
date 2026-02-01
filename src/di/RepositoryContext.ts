// SKTaxi: Repository Context 정의 - DIP 의존성 주입 구현
// React Context를 사용하여 Repository 인스턴스를 앱 전체에 제공

import { createContext } from 'react';
import {
  IPartyRepository,
  IChatRepository,
  IUserRepository,
  IBoardRepository,
  INoticeRepository,
  ICourseRepository,
  INotificationRepository,
  IAppNoticeRepository,
  ICafeteriaRepository,
  IAcademicRepository,
  IInquiryRepository,
  IStorageRepository,
  ITimetableRepository,
  IAuthRepository,
} from '../repositories/interfaces';

/**
 * 모든 Repository 인스턴스를 포함하는 컨테이너 타입
 */
export interface RepositoryContainer {
  partyRepository: IPartyRepository;
  chatRepository: IChatRepository;
  userRepository: IUserRepository;
  boardRepository: IBoardRepository;
  noticeRepository: INoticeRepository;
  courseRepository: ICourseRepository;
  notificationRepository: INotificationRepository;
  appNoticeRepository: IAppNoticeRepository;
  cafeteriaRepository: ICafeteriaRepository;
  academicRepository: IAcademicRepository;
  inquiryRepository: IInquiryRepository;
  storageRepository: IStorageRepository;
  timetableRepository: ITimetableRepository;
  authRepository: IAuthRepository;
}

/**
 * Repository Context
 * Provider 없이 사용 시 undefined - useRepository 훅에서 에러 처리
 */
export const RepositoryContext = createContext<RepositoryContainer | undefined>(undefined);
