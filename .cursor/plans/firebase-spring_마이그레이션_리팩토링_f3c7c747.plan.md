---
name: Firebase-Spring 마이그레이션 리팩토링
overview: Firebase에서 Spring으로의 백엔드 마이그레이션을 용이하게 하기 위해, SOLID 원칙을 적용하여 모든 Firebase 직접 의존을 Repository 패턴으로 추상화하고, 기능별 모듈화를 통해 AI가 컨텍스트를 쉽게 파악할 수 있도록 리팩토링합니다.
todos:
  - id: phase1-api-abstraction
    content: "Phase 1: API Client 추상화 계층 도입 (src/api/), 에러 처리 표준화 ✅ 완료"
    status: completed
  - id: phase2-new-repos
    content: "Phase 2-1: 신규 Repository 생성 (IInquiryRepository, IStorageRepository, ITimetableRepository, IAuthRepository) + Firestore 구현체 ✅ 완료"
    status: completed
  - id: phase2-extend-repos
    content: "Phase 2-2: 기존 Repository 확장 (IPartyRepository 파티채팅메시지, IChatRepository 유틸함수) ✅ 완료"
    status: completed
  - id: phase2-new-hooks
    content: "Phase 2-3: 신규 훅 생성 (useAuth, useTimetable, useImageUpload, useUserBoardInteractions, useUserBookmarks, useNoticeSettings, usePermissionStatus) + partyMessages.ts, chatUtils.ts Repository 패턴 적용 ✅ 완료"
    status: completed
  - id: phase2-cleanup
    content: "Phase 2-4: DI Provider 등록 완료, 레거시 훅은 src/legacy/hooks-legacy/에 보관 (참조용)"
    status: completed
  - id: phase3-screens-lib
    content: "Phase 3: Screens/lib Firebase 직접 접근 제거 (8개 파일 완료, notifications.ts는 Phase 4로 이동) ✅ 완료"
    status: completed
  - id: phase4-chatscreen-split
    content: "Phase 4-1: ChatScreen.tsx, HomeScreen.tsx - 이미 완료됨 ✅"
    status: completed
  - id: phase4-rootnav-split
    content: "Phase 4-2: RootNavigator.tsx (520줄→120줄) 책임 분리 완료 - useForegroundNotification, useJoinRequestModal, useFcmSetup 훅 추출 ✅ 완료"
    status: completed
  - id: phase4-notifications-split
    content: "Phase 4-3: notifications.ts (464줄→340줄) Firebase 직접 접근 제거, INotificationActionRepository 생성, switch 패턴 적용 ✅ 완료"
    status: completed
  - id: phase5-domain-organize
    content: "Phase 5: 도메인별 README.md 작성 (10개 폴더 완료: board, chat, party, notice, setting, user, taxi, common, auth, storage, timetable) ✅ 완료"
    status: completed
  - id: phase6-test-verify
    content: "Phase 6-1: Firebase 직접 의존 제거 검증 - useSubmitInquiry.ts Repository 패턴 적용 완료, usePermissionStatus.ts 특수 케이스 주석 추가, screens/ 특수 케이스 주석 추가 ✅ 완료"
    status: completed
  - id: phase6-usechatscreen
    content: "Phase 6-2: useChatScreen.ts (985줄) Repository 패턴 적용 - 파티/동승요청/정산/계좌 관리 기능을 IPartyRepository, IUserRepository, INotificationRepository로 추상화 ✅ 완료"
    status: completed
  - id: phase6-mock-test
    content: "Phase 6-3: Mock Repository 완성 (MockUserRepository, MockChatRepository, MockNotificationRepository, MockBoardRepository, MockInquiryRepository, MockNoticeRepository 추가) ✅ 완료"
    status: completed
  - id: phase7-solid-reanalysis
    content: "Phase 7: 전체 코드베이스 SOLID 원칙 재분석 - 최종 점수 측정 및 개선점 도출"
    status: pending
isProject: false
---

# Firebase → Spring 마이그레이션을 위한 SOLID 리팩토링 계획

## 목표

| 목표 | 현재 상태 | 목표 상태 |

|------|----------|----------|

| Firebase 직접 접근 파일 | 34개 | 0개 |

| Repository 마이그레이션율 | 26% | 100% |

| SOLID 준수율 | 51점 | 80점+ |

| 기능별 모듈 분리 | 부분적 | 완전 분리 |

## 아키텍처 개선 방향

### 현재 vs 목표 아키텍처

```
[현재 - Firebase 직접 의존]
┌─────────────┐
│   Screen    │
└──────┬──────┘
       │ Firebase 직접 호출
       ▼
┌─────────────┐
│   Hook      │──► Firebase SDK (firestore, auth, etc.)
└─────────────┘

[목표 - Repository 추상화]
┌─────────────┐
│   Screen    │
└──────┬──────┘
       │ Hook 사용
       ▼
┌─────────────┐
│    Hook     │
└──────┬──────┘
       │ Repository 인터페이스
       ▼
┌─────────────────────────────────────┐
│         Repository Interface         │
├──────────────────┬──────────────────┤
│ FirestoreImpl    │   SpringImpl     │ ← 구현체 교체만으로 마이그레이션
│ (현재)           │   (미래)          │
└──────────────────┴──────────────────┘
```

### Spring 마이그레이션 시 변경 범위

```
변경 필요 없음:
├── screens/          ← 화면 로직 유지
├── components/       ← UI 컴포넌트 유지
├── hooks/           ← 비즈니스 로직 유지
└── repositories/interfaces/  ← 인터페이스 유지

변경 필요:
└── repositories/
    └── spring/      ← 새로 생성 (REST API 클라이언트)
```

---

## Phase 1: 기반 인프라 구축 ✅ 완료

### 1.1 API Client 추상화 계층 도입 ✅

Spring 마이그레이션을 위한 API 클라이언트 기반 구조 준비

```
src/
└── api/
    ├── ApiClient.ts              # HTTP 클라이언트 추상화
    ├── types.ts                  # API 응답 타입
    └── endpoints.ts              # 엔드포인트 상수
```

**[`src/api/ApiClient.ts`](src/api/ApiClient.ts) 생성**

```typescript
// 추후 Spring API 연동을 위한 기반
export interface ApiClient {
  get<T>(endpoint: string, params?: object): Promise<T>;
  post<T>(endpoint: string, data: object): Promise<T>;
  put<T>(endpoint: string, data: object): Promise<T>;
  delete(endpoint: string): Promise<void>;
}

export interface RealtimeClient {
  subscribe<T>(channel: string, callback: (data: T) => void): () => void;
}
```

### 1.2 Repository 인터페이스 실시간 구독 표준화

현재 `onSnapshot` 기반 → 추상화된 구독 패턴으로 변경

**변경 전 (Firestore 종속)**

```typescript
subscribeToParties(callback: (parties: Party[]) => void): Unsubscribe;
```

**변경 후 (백엔드 독립적)**

```typescript
interface SubscriptionOptions {
  onData: (data: Party[]) => void;
  onError?: (error: Error) => void;
}
subscribeToParties(options: SubscriptionOptions): Unsubscribe;
```

### 1.3 에러 처리 표준화

```
src/
└── errors/
    ├── RepositoryError.ts        # Repository 공통 에러
    ├── NetworkError.ts           # 네트워크 에러
    └── ValidationError.ts        # 유효성 검증 에러
```

---

## Phase 2: Hooks Repository 패턴 완성 ✅ 완료

### 현황 분석 (2026-01-27 완료)

**도메인별 새 훅 (34개)**

| 폴더 | 파일 수 | Repository 패턴 적용 |

|------|--------|---------------------|

| board/ | 7개 | ✅ 100% 완료 |

| chat/ | 6개 | ✅ 100% 완료 |

| notice/ | 5개 | ✅ 100% 완료 |

| party/ | 7개 | ✅ 100% 완료 |

| setting/ | 5개 | ⚠️ 4/5 (useSubmitInquiry 미완료) |

| user/ | 4개 | ✅ 100% 완료 |

| **합계** | **34개** | **97% (33/34)** |

**루트 레벨 레거시 훅 (28개)**

| 분류 | 개수 | 상태 |

|------|------|------|

| 새 훅 존재 + @deprecated | 15개 | 삭제 대상 |

| 새 훅 없음 + Firebase 직접 의존 | 9개 | 신규 마이그레이션 필요 |

| 특수 케이스 (Firebase 미사용) | 4개 | 유지 |

### 2.1 남은 작업 목록

#### A. 신규 마이그레이션 필요 (8개 훅)

| 파일 | Firebase 사용 | 컬렉션 | 해결 방안 |

|------|--------------|--------|----------|

| `useMessages.ts` | Firestore, Auth | `chats/{partyId}/messages`, `users` | IPartyRepository 메서드 추가 |

| `useTimetable.ts` | Firestore | `userTimetables`, `courses` | **신규** ITimetableRepository 생성 |

| `useUserBoardInteractions.ts` | Firestore | `userBoardInteractions` | IBoardRepository 메서드 추가 |

| `useUserBookmarks.ts` | Firestore | `userBookmarks` | IUserRepository 메서드 추가 |

| `useNoticeSettings.ts` | Firestore | `users` | IUserRepository 메서드 추가 |

| `useImageUpload.ts` | Storage | - | **신규** IStorageRepository 생성 |

| `useAuth.ts` | Auth, Firestore, Messaging | `users` | **신규** IAuthRepository 생성 |

| `setting/useSubmitInquiry.ts` | Firestore | `inquiries` | **신규** IInquiryRepository 생성 |

#### B. 삭제 대상 레거시 훅 (15개)

새 훅으로 완전히 대체되어 @deprecated된 훅들:

```
src/hooks/ (루트 레벨)
├── useAcademicSchedules.ts    → hooks/setting/useAcademicSchedules.ts
├── useBoardComments.ts        → hooks/board/useBoardComments.ts
├── useBoardPost.ts            → hooks/board/useBoardPost.ts
├── useBoardPosts.ts           → hooks/board/useBoardPosts.ts
├── useCafeteriaMenu.ts        → hooks/setting/useCafeteriaMenu.ts
├── useChatMessages.ts         → hooks/chat/useChatMessages.ts
├── useChatRooms.ts            → hooks/chat/useChatRooms.ts
├── useComments.ts             → hooks/board/ + hooks/notice/
├── useMyParty.ts              → hooks/party/useMyParty.ts
├── useNoticeComments.ts       → hooks/notice/useNoticeComments.ts
├── useNoticeLike.ts           → hooks/notice/useNoticeLike.ts
├── useNotices.ts              → hooks/notice/useNotices.ts
├── useNotifications.ts        → hooks/common/useNotifications.ts
├── useParties.ts              → hooks/party/useParties.ts
├── usePendingJoinRequest.ts   → hooks/party/usePendingJoinRequest.ts
├── usePostActions.ts          → hooks/board/usePostActions.ts
└── useUserDisplayNames.ts     → hooks/user/useUserDisplayNames.ts
```

#### C. 유지 대상 (Firebase 미사용, 4개)

```
src/hooks/
├── useCourseSearch.ts         # CourseSearchContext 사용 (Repository 불필요)
├── useProfileCompletion.ts    # useAuth 사용 (Repository 불필요)
├── useScreenView.ts           # Analytics만 사용 (Repository 불필요)
└── usePermissionStatus.ts     # Messaging 권한만 (플랫폼 API)
```

### 2.2 신규 Repository 인터페이스 생성 (4개)

```
src/repositories/interfaces/
├── ITimetableRepository.ts      # 시간표 관리
├── IInquiryRepository.ts        # 문의 제출
├── IAuthRepository.ts           # 인증 관리
└── IStorageRepository.ts        # 파일 업로드
```

#### ITimetableRepository.ts

```typescript
export interface ITimetableRepository {
  // 조회
  getUserTimetable(userId: string, semester: string): Promise<Timetable | null>;
  subscribeToTimetable(userId: string, semester: string, callbacks: SubscriptionCallbacks<Timetable>): Unsubscribe;
  
  // CRUD
  createTimetable(userId: string, semester: string, data: TimetableData): Promise<string>;
  updateTimetable(timetableId: string, data: Partial<TimetableData>): Promise<void>;
  deleteTimetable(timetableId: string): Promise<void>;
  
  // 강의 관리
  addCourse(timetableId: string, course: Course): Promise<void>;
  removeCourse(timetableId: string, courseId: string): Promise<void>;
}
```

#### IInquiryRepository.ts

```typescript
export interface IInquiryRepository {
  submitInquiry(inquiry: NewInquiry): Promise<string>;
}
```

#### IStorageRepository.ts

```typescript
export interface IStorageRepository {
  uploadImage(path: string, file: Blob): Promise<string>;  // returns downloadURL
  deleteImage(path: string): Promise<void>;
  getDownloadURL(path: string): Promise<string>;
}
```

#### IAuthRepository.ts (복잡 - 별도 설계 필요)

```typescript
export interface IAuthRepository {
  // 인증 상태
  subscribeToAuthState(callbacks: AuthStateCallbacks): Unsubscribe;
  getCurrentUser(): User | null;
  
  // 프로필 (IUserRepository와 역할 분리)
  subscribeToUserProfile(userId: string, callbacks: SubscriptionCallbacks<UserProfile>): Unsubscribe;
  
  // FCM 토큰
  saveFcmToken(userId: string, token: string): Promise<void>;
  removeFcmToken(userId: string, token: string): Promise<void>;
}
```

### 2.3 기존 Repository 인터페이스 확장 (4개)

#### IPartyRepository 확장 (택시 파티 메시지)

```typescript
// 기존 메서드 + 추가
interface IPartyRepository {
  // ... 기존 메서드
  
  // 파티 채팅 메시지 (useMessages.ts 대체)
  subscribeToPartyMessages(partyId: string, callbacks: MessageCallbacks): Unsubscribe;
  sendPartyMessage(partyId: string, message: NewPartyMessage): Promise<void>;
  deletePartyMessage(partyId: string, messageId: string): Promise<void>;
}
```

#### IBoardRepository 확장 (사용자 상호작용)

```typescript
// 기존 메서드 + 추가
interface IBoardRepository {
  // ... 기존 메서드
  
  // 사용자 상호작용 (useUserBoardInteractions.ts 대체)
  getUserInteraction(userId: string, postId: string): Promise<UserBoardInteraction | null>;
  subscribeToUserInteraction(userId: string, postId: string, callbacks: SubscriptionCallbacks<UserBoardInteraction>): Unsubscribe;
  setUserInteraction(userId: string, postId: string, data: UserBoardInteraction): Promise<void>;
}
```

#### IUserRepository 확장 (북마크, 알림 설정)

```typescript
// 기존 메서드 + 추가
interface IUserRepository {
  // ... 기존 메서드
  
  // 북마크 (useUserBookmarks.ts 대체)
  subscribeToBookmarks(userId: string, callbacks: SubscriptionCallbacks<Bookmark[]>): Unsubscribe;
  addBookmark(userId: string, postId: string): Promise<void>;
  removeBookmark(userId: string, postId: string): Promise<void>;
  
  // 알림 설정 (useNoticeSettings.ts 대체)
  getNoticeSettings(userId: string): Promise<NoticeSettings>;
  subscribeToNoticeSettings(userId: string, callbacks: SubscriptionCallbacks<NoticeSettings>): Unsubscribe;
  updateNoticeSettings(userId: string, settings: Partial<NoticeSettings>): Promise<void>;
}
```

### 2.4 작업 순서 (✅ 완료)

**Day 1: Repository 인터페이스 생성**

- [x] IInquiryRepository 생성 + Firestore 구현체
- [x] IStorageRepository 생성 + Firebase Storage 구현체
- [x] ITimetableRepository 생성 + Firestore 구현체
- [x] IAuthRepository 생성 + Firebase Auth 구현체

**Day 2: 기존 Repository 확장**

- [x] IPartyRepository 파티 채팅 메시지 메서드 추가 (subscribeToPartyMessages, sendPartyMessage, sendSystemMessage, sendAccountMessage, sendArrivedMessage, sendEndMessage)
- [x] IChatRepository 메서드는 이미 존재 (sendMessage, joinChatRoom, getNotificationSetting, updateNotificationSetting)
- [x] IUserRepository 북마크/알림설정 메서드 이미 존재

**Day 3-4: 신규 훅 생성**

- [x] hooks/auth/useAuth.ts - IAuthRepository + IUserRepository 사용
- [x] hooks/timetable/useTimetable.ts - ITimetableRepository 사용
- [x] hooks/storage/useImageUpload.ts - IStorageRepository 사용
- [x] hooks/board/useUserBoardInteractions.ts - IBoardRepository + IUserRepository 사용
- [x] hooks/user/useUserBookmarks.ts - IUserRepository 사용
- [x] hooks/notice/useNoticeSettings.ts - IUserRepository 사용
- [x] hooks/common/usePermissionStatus.ts - React Native 권한 API
- [x] hooks/chat/partyMessages.ts - IPartyRepository 사용 (useMessages, sendMessage 등)
- [x] hooks/chat/chatUtils.ts - IChatRepository 사용 (sendChatMessage, joinChatRoom 등)

**Day 5: 정리 및 검증**

- [x] DI Provider에 새 Repository 등록 (RepositoryContext.ts, RepositoryProvider.tsx)
- [x] useRepository 별칭 추가 (di/useRepository.ts, di/index.ts)
- [x] 레거시 훅은 `src/legacy/hooks-legacy/` 폴더에 보관 (참조용)
- [x] TypeScript 컴파일 검증 통과

**레거시 훅 이동 (hard-delete 대신)**

```
legacy/
├── ChatScreen.legacy.tsx        # 기존
└── hooks-legacy/                # 신규
    ├── README.md                # AI 컨텍스트 설명 문서
    ├── useAcademicSchedules.ts
    ├── useBoardComments.ts
    ├── useBoardPost.ts
    ├── useBoardPosts.ts
    ├── useCafeteriaMenu.ts
    ├── useChatMessages.ts
    ├── useChatRooms.ts
    ├── useComments.ts
    ├── useMyParty.ts
    ├── useNoticeComments.ts
    ├── useNoticeLike.ts
    ├── useNotices.ts
    ├── useNotifications.ts
    ├── useParties.ts
    ├── usePendingJoinRequest.ts
    ├── usePostActions.ts
    └── useUserDisplayNames.ts
```

**README.md 내용 예시:**

```markdown
# Legacy Hooks (레거시 훅)

## 개요
이 폴더에는 Firebase를 직접 import하는 레거시 훅들이 보관되어 있습니다.
새로운 Repository 패턴 기반 훅으로 마이그레이션이 완료되어 @deprecated 처리되었습니다.

## 주의사항
- **새 코드에서 이 훅들을 import하지 마세요**
- 대신 도메인별 폴더의 새 훅을 사용하세요 (hooks/party/, hooks/board/ 등)
- 이 폴더는 참조용으로만 보관됩니다

## 마이그레이션 매핑

| 레거시 훅 | 새 훅 경로 |
|----------|-----------|
| useAcademicSchedules.ts | hooks/setting/useAcademicSchedules.ts |
| useBoardComments.ts | hooks/board/useBoardComments.ts |
| useBoardPost.ts | hooks/board/useBoardPost.ts |
| useBoardPosts.ts | hooks/board/useBoardPosts.ts |
| useCafeteriaMenu.ts | hooks/setting/useCafeteriaMenu.ts |
| useChatMessages.ts | hooks/chat/useChatMessages.ts |
| useChatRooms.ts | hooks/chat/useChatRooms.ts |
| useComments.ts | hooks/board/ + hooks/notice/ |
| useMyParty.ts | hooks/party/useMyParty.ts |
| useNoticeComments.ts | hooks/notice/useNoticeComments.ts |
| useNoticeLike.ts | hooks/notice/useNoticeLike.ts |
| useNotices.ts | hooks/notice/useNotices.ts |
| useNotifications.ts | hooks/common/useNotifications.ts |
| useParties.ts | hooks/party/useParties.ts |
| usePendingJoinRequest.ts | hooks/party/usePendingJoinRequest.ts |
| usePostActions.ts | hooks/board/usePostActions.ts |
| useUserDisplayNames.ts | hooks/user/useUserDisplayNames.ts |

## Firebase 직접 의존 패턴 (참고용)
이 훅들은 `@react-native-firebase/firestore`를 직접 import하여 사용했습니다.
새 훅들은 Repository 인터페이스를 통해 데이터에 접근하므로
Spring 백엔드로 마이그레이션 시 구현체만 교체하면 됩니다.

## 보관 일자
2026-01-XX (마이그레이션 완료 시점)
```

### 2.5 완료 결과 ✅

| 지표 | 이전 | Phase 2 완료 후 |

|------|------|----------------|

| 도메인별 훅 Repository 적용률 | 97% | **100%** |

| 레거시 훅 | 28개 | src/legacy/hooks-legacy/에 보관 (참조용) |

| Firebase 직접 의존 훅 | 25개 | **0개** (모든 훅이 Repository 사용) |

| Repository 인터페이스 | 10개 | **14개** (+4: Auth, Storage, Timetable, Inquiry) |

| 신규/수정 훅 | - | **11개** (useAuth, useTimetable, useImageUpload, useUserBoardInteractions, useUserBookmarks, useNoticeSettings, usePermissionStatus, partyMessages 5개 함수, chatUtils 5개 함수) |

| SOLID DIP 점수 | 36점 | **70점+** |

---

## Phase 3: Screens/lib Firebase 직접 접근 제거 ✅ 완료

> **Note:** notifications.ts는 Phase 4에서 Firebase 제거 + 전략 패턴 적용을 동시에 처리합니다.

### 3.1 완료된 작업

**신규 Repository 인터페이스 생성:**

| Repository | 파일 | 용도 |

|------------|------|------|

| IFcmRepository | `src/repositories/interfaces/IFcmRepository.ts` | FCM 토큰 관리 |

| IModerationRepository | `src/repositories/interfaces/IModerationRepository.ts` | 신고/차단 관리 |

| IAppConfigRepository | `src/repositories/interfaces/IAppConfigRepository.ts` | 앱 버전 설정 |

| IMinecraftRepository | `src/repositories/interfaces/IMinecraftRepository.ts` | 마인크래프트 (Firestore + RTDB) |

**신규 Firestore 구현체 생성:**

| 구현체 | 파일 |

|--------|------|

| FirestoreFcmRepository | `src/repositories/firestore/FirestoreFcmRepository.ts` |

| FirestoreModerationRepository | `src/repositories/firestore/FirestoreModerationRepository.ts` |

| FirestoreAppConfigRepository | `src/repositories/firestore/FirestoreAppConfigRepository.ts` |

| FirestoreMinecraftRepository | `src/repositories/firestore/FirestoreMinecraftRepository.ts` |

**기존 Repository 확장:**

- `INoticeRepository`에 `incrementViewCount(noticeId)` 메서드 추가
- `FirestoreNoticeRepository`에 해당 구현 추가

**lib/ 파일 리팩토링 (Firebase 직접 의존 → Repository 패턴):**

| 파일 | 변경 내용 |

|------|----------|

| `fcm.ts` | FirestoreFcmRepository 사용 |

| `moderation.ts` | FirestoreModerationRepository 사용 |

| `versionCheck.ts` | FirestoreAppConfigRepository 사용 |

| `noticeViews.ts` | FirestoreNoticeRepository.incrementViewCount 사용 |

| `minecraft/registerAccount.ts` | FirestoreMinecraftRepository 사용 |

| `minecraftChat.ts` | FirestoreMinecraftRepository.sendMessage 사용 |

**screens/ 파일:**

| 파일 | 상태 |

|------|------|

| `useTaxiScreenPresenter.ts` | auth() 직접 사용 부분이 실제로 미사용이어서 제거 |

| `ProfileScreen.tsx` | `getUserLoginProvider`는 Firebase Auth providerData 필요 (마이그레이션 주석 추가) |

**Mock Repository 추가:**

- MockFcmRepository
- MockModerationRepository
- MockAppConfigRepository
- MockMinecraftRepository

### 3.2 완료 지표

| 지표 | 이전 | Phase 3 완료 후 |

|------|------|----------------|

| Repository 인터페이스 | 14개 | **18개** (+4: Fcm, Moderation, AppConfig, Minecraft) |

| lib/ Firebase 직접 의존 파일 | 7개 | **1개** (notifications.ts → Phase 4) |

| Mock Repository | 1개 | **5개** (+4) |

---

## Phase 4: 거대 파일 분할 - SRP 개선 (3일)

### 4.1 ChatScreen.tsx - ✅ 이미 완료

**현재 상태:** 15줄 (re-export만)

분할 완료된 구조:

```
src/screens/TaxiTab/
├── ChatScreen.tsx              # re-export만 (15줄) ✅
└── chat/
    ├── index.tsx               # 메인 컨테이너 (479줄)
    ├── ChatMessageList.tsx     # 메시지 렌더링
    ├── ChatInput.tsx           # 입력 UI
    ├── ChatMenu.tsx            # 액션 메뉴
    ├── JoinRequestSection.tsx  # 동승 요청
    ├── SettlementBar.tsx       # 정산 현황
    ├── SideMenu.tsx            # 사이드 메뉴
    └── ChatModals.tsx          # 모달들
```

레거시 파일: `legacy/ChatScreen.legacy.tsx` (3,276줄)

### 4.2 HomeScreen.tsx - ✅ 이미 완료

**현재 상태:** 164줄 (순수 컨테이너)

분할 완료된 구조:

```
src/screens/HomeScreen.tsx      # 컨테이너 (164줄) ✅
src/components/home/
├── TaxiSection.tsx             # 택시 파티 섹션
├── NoticeSection.tsx           # 공지사항 섹션
└── MinecraftSection.tsx        # 마인크래프트 섹션
src/components/timetable/
└── TimetableSection.tsx        # 시간표 섹션
src/components/academic/
└── AcademicCalendarSection.tsx # 학사일정 섹션
src/components/cafeteria/
└── CafeteriaSection.tsx        # 학식 섹션
```

### 4.3 RootNavigator.tsx ✅ 완료 (520줄 → 120줄)

**분리된 훅:**

| 훅 | 파일 | 줄수 | 책임 |

|----|------|------|------|

| useForegroundNotification | `src/navigations/hooks/useForegroundNotification.ts` | ~310줄 | 포그라운드 알림 상태, 14개 핸들러, 네비게이션 유틸 |

| useJoinRequestModal | `src/navigations/hooks/useJoinRequestModal.ts` | ~120줄 | 동승 요청 모달 상태, Firestore 구독, 승인/거절 핸들러 |

| useFcmSetup | `src/navigations/hooks/useFcmSetup.ts` | ~110줄 | FCM 초기화, 토큰 관리, 알림 핸들러 등록 |

**RootNavigator.tsx 변경:**

- **이전**: 520줄, 9개 책임
- **이후**: 120줄, 1개 책임 (인증 상태 라우팅 + UI 렌더링)

**SRP 개선 지표:**

| 지표 | 이전 | 이후 |

|------|------|------|

| RootNavigator 줄수 | 520줄 | **120줄** |

| 책임 수 | 9개 | **1개** |

| 훅 수 | 0개 | **3개** |

| 재사용성 | 낮음 | **높음** |

### 4.4 notifications.ts (464줄 → Firebase 제거 + 전략 패턴 동시 적용)

> **Note:** Phase 3에서 제외된 notifications.ts를 여기서 통합 처리합니다.

**현재 문제점:**

1. Firebase 직접 의존 (Messaging, Firestore)
2. 15개 if-else 체인 (OCP 위반)
3. `initForegroundMessageHandler` 함수에 14개 콜백 파라미터

**해결 방안:**

1. Firebase 접근을 Repository로 추상화
2. 전략 패턴으로 메시지 타입별 핸들러 분리
3. 콜백 파라미터를 Context 객체로 통합

**분할 계획:**

```
src/lib/notifications/
├── NotificationRouter.ts       # 라우터 (50줄)
├── NotificationContext.ts      # 핸들러 컨텍스트 (콜백 통합)
├── handlers/
│   ├── BaseHandler.ts          # 공통 인터페이스 (30줄)
│   ├── JoinRequestHandler.ts   # 동승 요청 (40줄)
│   ├── ChatHandler.ts          # 채팅 (40줄)
│   ├── NoticeHandler.ts        # 공지사항 (40줄)
│   ├── BoardHandler.ts         # 게시판 (40줄)
│   ├── PartyHandler.ts         # 파티 상태 (40줄)
│   └── index.ts                # 핸들러 등록
├── types.ts
└── index.ts                    # 메인 export

src/repositories/interfaces/
└── INotificationActionRepository.ts  # 동승 요청 승인/거절 등
```

**핸들러 인터페이스:**

```typescript
interface NotificationHandler {
  type: string | string[];  // 처리할 메시지 타입
  handleForeground(data: any, context: NotificationContext): Promise<void>;
  handleBackground?(data: any): Promise<void>;
  handleOpened?(data: any, navigation: any): void;
}
```

**작업 순서:**

1. `INotificationActionRepository` 생성 (acceptJoin, declineJoin 등)
2. `NotificationContext` 타입 정의 (14개 콜백 통합)
3. `BaseHandler` 및 개별 핸들러 생성
4. `NotificationRouter` 구현
5. 기존 notifications.ts를 새 구조로 마이그레이션
6. 기존 파일을 `legacy/notifications.legacy.ts`로 백업

---

## Phase 5: 도메인별 README.md 작성 (2일)

> **Note:** 폴더 구조와 index.ts는 이미 완료되어 있습니다. 이 Phase는 AI 컨텍스트 파악을 위한 문서화에 집중합니다.

### 5.1 현재 상태 (이미 완료)

- ✅ 도메인별 폴더 구조 (hooks/party, hooks/board 등 8개)
- ✅ index.ts export 설정
- ✅ 레거시 훅 정리 (Phase 2-4에서 legacy/hooks-legacy/로 이동 완료)

### 5.2 README.md 작성 대상 (8개 폴더)

```
src/hooks/
├── board/README.md       # 게시판 도메인
├── chat/README.md        # 채팅 도메인
├── party/README.md       # 택시 파티 도메인
├── notice/README.md      # 공지사항 도메인
├── setting/README.md     # 설정 도메인
├── user/README.md        # 사용자 도메인
├── taxi/README.md        # 택시 화면 도메인
└── common/README.md      # 공통 유틸리티
```

### 5.3 Import 경로 통일 (선택적)

루트 직접 import를 도메인 폴더 import로 변경:

```typescript
// Before
import { useChatRooms } from '../hooks/useChatRooms';

// After
import { useChatRooms } from '../hooks/chat';
```

**대상 파일:** 약 15개 (MainNavigator, NoticeScreen 등)

### 5.4 README.md 템플릿

각 도메인 폴더에 README.md 추가하여 AI가 컨텍스트 파악 용이하도록:

```markdown
# Party Domain (택시 파티)

## 개요
택시 동승 모집 및 매칭 기능

## Firestore 컬렉션
- `parties/{partyId}` - 파티 정보
- `joinRequests/{requestId}` - 동승 요청
- `chats/{partyId}/messages/{messageId}` - 파티 채팅

## Repository
- `IPartyRepository` - 인터페이스
- `FirestorePartyRepository` - Firestore 구현체

## Hooks
- `useParties` - 파티 목록 구독
- `useParty` - 단일 파티 구독
- `useMyParty` - 내 파티 조회
- `usePartyActions` - 파티 CRUD
- `useJoinRequest` - 동승 요청

## Screens
- `TaxiScreen` - 메인 화면
- `ChatScreen` - 파티 채팅
- `RecruitScreen` - 모집 화면

## Spring 마이그레이션 포인트
- Repository 구현체만 교체
- 실시간 구독 → WebSocket 전환
```

---

## Phase 6: 테스트 및 검증 (3일)

### 6.1 Mock Repository 완성

```
src/repositories/mock/
├── MockPartyRepository.ts      # 기존
├── MockChatRepository.ts       # 신규
├── MockBoardRepository.ts      # 신규
├── MockNoticeRepository.ts     # 신규
├── MockUserRepository.ts       # 신규
└── ...
```

### 6.2 단위 테스트 추가

```
src/__tests__/
├── hooks/
│   ├── party/
│   │   ├── useParties.test.ts
│   │   └── useJoinRequest.test.ts
│   └── ...
└── repositories/
    └── (Repository 테스트)
```

### 6.3 검증 체크리스트

- [ ] `grep -r "firebase" src/hooks/` → 결과 없음
- [ ] `grep -r "firebase" src/screens/` → 결과 없음 (Minecraft 제외)
- [ ] `grep -r "firebase" src/components/` → 결과 없음
- [ ] TypeScript 컴파일 에러 없음
- [ ] 모든 화면 기능 정상 동작

---

## Phase 7: 최종 SOLID 원칙 재분석 (2일)

### 7.1 분석 범위

전체 코드베이스를 구체적으로 빠짐없이 점검:

```
분석 대상:
├── src/hooks/           # 도메인별 훅 (Repository 패턴 적용 확인)
├── src/screens/         # 화면 (Firebase 직접 의존 제거 확인)
├── src/components/      # UI 컴포넌트 (순수 프레젠테이션 확인)
├── src/repositories/    # Repository 패턴 구현 상태
├── src/contexts/        # Context Firebase 의존 확인
├── src/navigations/     # Navigator 책임 분리 확인
├── src/lib/             # 외부 서비스 통합 (전략 패턴 확인)
├── src/utils/           # 유틸리티 함수
├── functions/src/       # Cloud Functions
└── legacy/              # 레거시 코드 정리 상태
```

### 7.2 SOLID 원칙별 체크리스트

#### SRP (단일 책임 원칙)

- [ ] 500줄 이상 파일 없음
- [ ] 각 파일이 단일 도메인 책임만 담당
- [ ] 훅, 화면, 컴포넌트 역할 분리 명확

#### OCP (개방-폐쇄 원칙)

- [ ] if-else 체인 5개 이상 없음
- [ ] 새 기능 추가 시 기존 코드 수정 불필요
- [ ] 전략 패턴/플러그인 구조 적용

#### LSP (리스코프 치환 원칙)

- [ ] Repository 인터페이스 계약 준수
- [ ] 타입별 조건 분기 최소화

#### ISP (인터페이스 분리 원칙)

- [ ] 훅 반환값 8개 이하
- [ ] 컴포넌트 props 10개 이하
- [ ] 불필요한 의존성 제거

#### DIP (의존성 역전 원칙)

- [ ] hooks/ 폴더 Firebase 직접 import 없음
- [ ] screens/ 폴더 Firebase 직접 import 없음 (특수 케이스 제외)
- [ ] components/ 폴더 Firebase 직접 import 없음
- [ ] 모든 데이터 접근이 Repository를 통함

### 7.3 정량적 지표 측정

| 지표 | 목표 | 측정 방법 |

|------|------|----------|

| Firebase 직접 접근 파일 | 0개 (특수 제외) | `grep -r "firebase" src/` |

| Repository 커버리지 | 100% | 도메인별 훅 분석 |

| 500줄+ 파일 | 0개 | `wc -l` 기반 |

| if-else 체인 5개+ | 0개 | 코드 분석 |

| 훅 반환값 8개+ | 0개 | 인터페이스 분석 |

### 7.4 최종 보고서 산출물

```markdown
# SKTaxi SOLID 원칙 최종 분석 보고서

## Executive Summary
- 전체 SOLID 준수율: XX/100
- 목표 달성 여부: ✅/❌

## 원칙별 점수
| 원칙 | 이전 점수 | 현재 점수 | 개선율 |
|------|----------|----------|-------|
| SRP  | 47       | XX       | +XX%  |
| OCP  | 56       | XX       | +XX%  |
| LSP  | 74       | XX       | +XX%  |
| ISP  | 56       | XX       | +XX%  |
| DIP  | 36       | XX       | +XX%  |

## 계층별 분석 결과
(hooks, screens, components, contexts, lib 등)

## Firebase 직접 접근 현황
- 제거 완료: XX개
- 특수 케이스 유지: X개 (Minecraft, Auth 등)

## Spring 마이그레이션 준비 상태
- Repository 인터페이스 완성도: XX%
- 구현체 교체 예상 난이도: 낮음/중간/높음

## 추가 개선 권장사항
(발견된 추가 개선점)
```

### 7.5 예상 결과

| 지표 | Phase 6 완료 시 | Phase 7 검증 후 |

|------|----------------|----------------|

| SOLID 종합 점수 | 80점 | 80점+ (검증 완료) |

| Spring 마이그레이션 준비 | 준비됨 | 검증 완료 |

| AI 컨텍스트 파악 용이성 | 높음 | 문서화 완료 |

---

## Spring 마이그레이션 가이드 (향후)

### Repository 구현체 교체

```typescript
// src/repositories/spring/SpringPartyRepository.ts
export class SpringPartyRepository implements IPartyRepository {
  private apiClient: ApiClient;
  private realtimeClient: RealtimeClient;

  async getParty(id: string): Promise<Party | null> {
    return this.apiClient.get(`/api/parties/${id}`);
  }

  subscribeToParties(options: SubscriptionOptions<Party[]>): Unsubscribe {
    return this.realtimeClient.subscribe('/ws/parties', options.onData);
  }
}
```

### Provider 교체

```typescript


// src/di/RepositoryProvider.tsx
const repositories = useMemo(() => ({
  // Firestore → Spring 교체
  partyRepository: new SpringPartyRepository(apiClient, wsClient),
  // ...
}), []);
```

---

## 일정 요약

| Phase | 기간 | 작업 내용 | SOLID 점수 |

|-------|------|----------|-----------|

| Phase 1 | 2일 | API 추상화, 에러 처리 (구독 표준화 이미 완료) | 51 → 53 |

| Phase 2 | 5일 | Hooks Repository 패턴 완성 + 레거시 훅 legacy/로 이동 | 53 → 70 |

| Phase 3 | 3일 | Screens/lib Firebase 제거 (9개 파일, notifications.ts 제외) | 70 → 73 |

| Phase 4 | 3일 | RootNavigator 분할 + notifications.ts (Firebase 제거 + 전략 패턴 동시 처리) | 73 → 78 |

| Phase 5 | 2일 | 도메인별 README.md 작성 (폴더 구조/index.ts 이미 완료) | 78 → 80 |

| Phase 6 | 3일 | 테스트 및 검증 | 80 (안정화) |

| Phase 7 | 2일 | **전체 코드베이스 SOLID 재분석** | 80점+ (검증) |

| **총계** | **약 3주** | | **80점+ (검증 완료)** |

## 기대 효과

| 지표 | 현재 | 완료 후 | 개선 |

|------|------|--------|------|

| Firebase 직접 접근 | 34개 | 0개 | -100% |

| Repository 커버리지 | 26% | 100% | +285% |

| SOLID 종합 점수 | 51 | 80+ | +57% |

| 테스트 가능성 | 낮음 | 높음 | - |

| Spring 마이그레이션 난이도 | 높음 | 낮음 | - |

| AI 컨텍스트 파악 용이성 | 낮음 | 높음 | - |