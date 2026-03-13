# 단계별 리팩터링 로드맵

이 문서는 SKURI 프로젝트를 현재 구조에서 최종 목표 구조로 옮기기 위한 실행 계획이다.  
리팩터링 AI는 반드시 이 순서를 따라야 한다.

## 전체 전략

리팩터링은 아래 원칙으로 진행한다.

1. 한 번에 전체를 뒤집지 않는다.
2. 먼저 구조를 만들고, 그 다음 파일을 옮긴다.
3. 이동과 책임 분리를 동시에 하되, 기능 변경은 최소화한다.
4. 각 단계 종료 시 동작 보존과 import 경계를 확인한다.
5. 마지막에만 레거시 root 폴더를 제거한다.

즉, 이 로드맵은 폴더 이동만 수행하는 계획이 아니다.  
대형 파일을 `screen/component/hook/service/data` 로 쪼개고, Firebase 접근과 비즈니스 로직의 책임을 올바른 레이어로 내리는 작업까지 포함한다.

## 버전 관리 전략

- 전체 리팩터링은 기본적으로 하나의 장기 브랜치 `skuri-refactoring` 에서 진행한다.
- Phase마다 새 브랜치를 파지 않는다. 다른 에이전트로 작업을 넘길 때도 같은 장기 브랜치 위에서 이어간다.
- 각 Phase는 최소 1개의 독립 커밋으로 마무리한다.
- 권장 커밋 분리는 다음 순서를 따른다.
  1. 구조 생성
  2. 기계적 이동/rename
  3. import 갱신
  4. 책임 분리와 로직 재배치
  5. 테스트/문서 보강
- 하나의 커밋에는 하나의 목적만 담는다.
- 하나의 커밋이 두 개 이상의 Phase를 동시에 넘나들면 안 된다.
- 다른 에이전트에게 넘길 수 있는 지점은 "Phase 완료 + 검증 통과 + 커밋 완료" 상태뿐이다.
- 병렬 작업이 정말 필요할 때만 phase 하위 임시 브랜치를 추가로 만들 수 있지만, 기본 실행 전략으로 간주하지 않는다.

## 범위 제외

- `firebase-cloud-functions/` 이하 Firebase Cloud Functions 리팩터링은 이 로드맵의 범위에서 제외한다.
- 이유: 해당 영역은 별도 Spring 백엔드 마이그레이션으로 대체될 예정이기 때문이다.
- 따라서 이 로드맵은 `src/` 프론트엔드 구조 재편에만 적용한다.

## 단계 개요

| 단계 | 목표 |
|---|---|
| Phase 0 | 기준선 확보와 리팩터링 골격 생성 |
| Phase 1 | `app/shared` 기반 구축 |
| Phase 2 | `auth` + 앱 진입 흐름 정리 |
| Phase 3 | `user` feature 분리 |
| Phase 4 | `taxi` feature 분리 |
| Phase 5 | `chat` feature 분리 |
| Phase 6 | `notice` feature 분리 |
| Phase 7 | `board` feature 분리 |
| Phase 8 | `timetable`, `campus`, `home`, `settings`, `minecraft` 분리 |
| Phase 9 | 레거시 제거와 최종 검증 |

---

## Phase 0. 기준선 확보와 골격 생성

### 목적

- 최종 구조를 수용할 폴더 골격을 만든다.
- 새 코드가 들어갈 위치를 먼저 고정한다.
- 기존 코드를 바로 지우지 않고 migration path를 만든다.

### 작업

#### 프론트엔드

- `src/app`
- `src/shared`
- `src/features`

아래 디렉터리를 먼저 만든다.

```text
src/app/bootstrap
src/app/navigation
src/app/providers
src/app/guards

src/shared/ui
src/shared/hooks
src/shared/lib
src/shared/constants
src/shared/types
src/shared/testing

src/features/auth
src/features/user
src/features/home
src/features/taxi
src/features/chat
src/features/notice
src/features/board
src/features/timetable
src/features/campus
src/features/settings
src/features/minecraft
```

### 추가 작업

- TS path alias는 `@/app`, `@/shared`, `@/features` 기준으로 정리한다.
- alias는 `tsconfig.json`, `babel.config.js`, `jest.config.js` 에서 모두 같은 규칙으로 맞춘다.
- 현재 Babel alias plugin이 없다면 `babel-plugin-module-resolver` 를 추가하고 동일한 alias 규칙을 반영한다.
- 각 feature에 placeholder `index.ts` 를 만든다.
- 아직 기존 root import는 유지한다.

### 완료 기준

- 새 구조가 생성되었다.
- 아직 기존 코드 동작은 깨지지 않는다.
- 신규/이동 코드가 들어갈 공식 위치가 정해졌다.

---

## Phase 1. `app/shared` 기반 구축

### 목적

- 공용 코드와 앱 조립 코드를 먼저 분리한다.
- 이후 feature 분리를 위한 기반을 만든다.

### 이동 대상

#### `shared/constants`

- `src/constants/colors.ts`
- `src/constants/typhograpy.ts`
- `src/constants/constants.ts` 중 공용 layout 값
- `src/constants/board.ts` 중 board 전용이 아닌 값만
- `src/constants/mock_data/*` 는 testing으로 이동

#### `shared/lib`

- `src/errors/*` -> `src/shared/lib/errors/*`
- `src/config/firebase.ts` -> `src/shared/lib/firebase/*`
- Firebase accessor helper 정리
- analytics 공용 부분 -> `src/shared/lib/analytics/*`
- date helper, validation helper, device helper 성격 코드 -> `src/shared/lib/*`
- `src/lib/moderation.ts` -> `src/shared/lib/moderation/*`

#### `shared/ui`

- `src/components/common/*`

단, 공용이 아닌 component는 이동하지 않는다.

#### `shared/hooks`

- `src/hooks/useScreenView.ts`
- `src/hooks/common/useFirestoreSubscription.ts`
- `src/hooks/common/usePagination.ts`

#### `app/bootstrap`

- `src/config/google.ts`
- 앱 시작 시 등록되는 global handler
- `src/navigations/hooks/useFcmSetup.ts` 의 앱 시작 등록 책임
- `src/lib/notifications.ts` 중 global handler 등록 책임

#### `app/providers`

- `App.tsx` 내부 provider 조합 로직을 `AppProviders.tsx` 로 분리

#### `app/navigation`

- `src/navigations/*`

단, business logic은 남기지 말고 navigation shell만 옮긴다.

### 핵심 리팩터링

- `MainNavigator`, `RootNavigator` 에서 business logic을 제거하기 위한 TODO 목록을 만든다.
- route key는 English stable key로 정리할 준비를 한다.
- navigation은 feature public API import만 사용하도록 방향을 잡는다.
- `notifications.ts`, `fcm.ts`, `versionCheck.ts` 같은 infra/service 혼합 파일의 분해 계획을 코드에 반영한다.

### 완료 기준

- 공용 UI, 공용 infra, app composition 위치가 생겼다.
- `App.tsx` 는 최대한 얇아졌다.
- 새 코드에서 `shared` 와 `app` 구분이 적용되기 시작했다.

---

## Phase 2. `auth` + 앱 진입 흐름 정리

### 목적

- 로그인과 앱 진입 gating 흐름을 `auth` feature 중심으로 정리한다.
- 인증 관련 provider/context/hook/screen을 한 feature 안으로 모은다.

### 이동 대상

#### `features/auth`

- `src/hooks/auth/*`
- `src/contexts/AuthContext.tsx`
- `src/screens/auth/*`
- `src/screens/PermissionOnboardingScreen.tsx`
- `src/hooks/useProfileCompletion.ts`
- `src/repositories/interfaces/IAuthRepository.ts`
- `src/repositories/firestore/FirestoreAuthRepository.ts`

### 재구성

권장 구조:

```text
src/features/auth/
  components/
  data/repositories/
    IAuthRepository.ts
    FirebaseAuthRepository.ts
  hooks/
    useAuth.ts
    useProfileCompletion.ts
  model/
    types.ts
  providers/
    AuthProvider.tsx
  screens/
    LoginScreen.tsx
    AccountGuideScreen.tsx
    CompleteProfileScreen.tsx
    PermissionOnboardingScreen.tsx
    TermsOfUseForAuthScreen.tsx
  services/
    authSessionService.ts
    permissionOnboardingService.ts
  index.ts
```

### 핵심 작업

- `AuthContext` 이름을 `AuthProvider` 중심으로 정리한다.
- login/profile completion/permission onboarding 흐름을 `auth` feature public API 뒤로 숨긴다.
- `RootNavigator` 는 인증 상태와 guard 결과만 받아서 분기하게 만든다.
- `CompleteProfileScreen` 과 `PermissionOnboardingScreen` 의 데이터 쓰기 로직은 service/hook으로 내린다.
- 권한 온보딩 완료 후 FCM 토큰 저장은 auth screen이 아니라 user/auth service를 통해 수행한다.

### 완료 기준

- auth 진입 흐름 관련 코드는 `features/auth` 안에 모인다.
- app/navigation은 auth feature public API만 사용한다.
- direct repository/Firebase 호출이 auth screen에서 제거된다.

---

## Phase 3. `user` feature 분리

### 목적

- 사용자 도메인을 독립 feature로 분리한다.
- profile, account, notification settings, bookmarks, display names를 한 곳에 모은다.

### 이동 대상

- `src/hooks/user/*`
- `src/repositories/interfaces/IUserRepository.ts`
- `src/repositories/firestore/FirestoreUserRepository.ts`
- 설정 하위의 profile/account/notification 관련 화면

대상 화면 예시:

- `ProfileScreen`
- `ProfileEditScreen`
- `AccountModificationScreen`
- `NofiticationSettingScreen.tsx`

### 권장 구조

```text
src/features/user/
  components/
  data/repositories/
    IUserRepository.ts
    FirebaseUserRepository.ts
  hooks/
    useUserProfile.ts
    useAccountInfo.ts
    useNotificationSettings.ts
    useUserBookmarks.ts
    useUserDisplayNames.ts
  model/
    types.ts
  screens/
    ProfileScreen.tsx
    ProfileEditScreen.tsx
    AccountModificationScreen.tsx
    NotificationSettingsScreen.tsx
  services/
    userProfileService.ts
  index.ts
```

### 핵심 작업

- user feature는 다른 feature가 참조하는 공통 domain feature가 된다.
- taxi/chat/notice/board/minecraft는 user feature public API만 통해 사용자 정보를 본다.
- `userRepository.updateUserProfile` 같은 호출이 여기에서 관리되도록 정리한다.

### 완료 기준

- user 관련 hooks와 repository가 한 feature에 모인다.
- settings와 auth가 user public API를 통해 연동된다.

---

## Phase 4. `taxi` feature 분리

### 목적

- 앱의 핵심 도메인인 taxi/party/join request/settlement를 한 feature로 통합한다.
- 현재 가장 얽혀 있는 파티 채팅과 상태 관리를 구조화한다.

### 이동 대상

- `src/screens/TaxiScreen.tsx`
- `src/screens/TaxiTab/*`
- `src/screens/TaxiTab/chat/*`
- `src/screens/TaxiTab/hooks/*`
- `src/hooks/party/*`
- `src/contexts/JoinRequestContext.tsx`
- `src/repositories/interfaces/IPartyRepository.ts`
- `src/repositories/firestore/FirestorePartyRepository.ts`
- `src/utils/partyMessageUtils.ts`

### 권장 구조

```text
src/features/taxi/
  components/
  data/repositories/
    IPartyRepository.ts
    FirebasePartyRepository.ts
  hooks/
    useParties.ts
    useParty.ts
    useMyParty.ts
    usePartyActions.ts
    useJoinRequest.ts
    useJoinRequestStatus.ts
    usePendingJoinRequest.ts
    useTaxiScreenPresenter.ts
    useChatScreenPresenter.ts
  model/
    types.ts
    selectors.ts
  providers/
    JoinRequestProvider.tsx
  screens/
    TaxiScreen.tsx
    RecruitScreen.tsx
    AcceptancePendingScreen.tsx
    MapSearchScreen.tsx
    ChatScreen.tsx
  services/
    partyCreationService.ts
    joinRequestService.ts
    settlementService.ts
    partyMessageService.ts
  index.ts
```

### 핵심 작업

- `JoinRequestContext` 는 taxi feature provider로 이동한다.
- 파티 채팅 message helper는 util이 아니라 taxi service가 된다.
- `useTaxiScreenPresenter`, `useChatScreenPresenter` 의 과도한 책임을 분리한다.
- map/location/device permission은 shared permission helper + taxi feature hook 조합으로 정리한다.
- `useJoinRequestModal` 과 관련 notification action은 taxi feature 쪽으로 끌어내린다.

### 완료 기준

- taxi 관련 화면/훅/데이터 접근이 feature 내부에 모인다.
- `utils/partyMessageUtils.ts` 는 제거되거나 taxi service로 대체된다.
- taxi screen/presenter에서 direct Firebase 접근이 사라진다.

---

## Phase 5. `chat` feature 분리

### 목적

- 공개 채팅 도메인을 taxi와 분리한다.
- 공개 채팅과 파티 채팅을 구조적으로 나눈다.

### 이동 대상

- `src/screens/ChatListScreen.tsx`
- `src/screens/ChatTab/*`
- `src/hooks/chat/*` 중 공개 채팅 관련
- `src/repositories/interfaces/IChatRepository.ts`
- `src/repositories/firestore/FirestoreChatRepository.ts`
- `src/utils/chatUtils.ts`

### 권장 구조

```text
src/features/chat/
  components/
  data/repositories/
    IChatRepository.ts
    FirebaseChatRepository.ts
  hooks/
    useChatRooms.ts
    useChatRoom.ts
    useChatMessages.ts
    useChatActions.ts
    useChatRoomStates.ts
    useChatRoomNotifications.ts
    useChatListPresenter.ts
  model/
    types.ts
  screens/
    ChatListScreen.tsx
    ChatDetailScreen.tsx
  services/
    chatRoomService.ts
    unreadStateService.ts
  index.ts
```

### 핵심 작업

- 공개 채팅과 파티 채팅 helper를 분리한다.
- chat room unread 계산 로직을 screen/navigation 밖으로 내린다.
- `MainNavigator` 내부 unread/firestore 구독 로직을 chat feature hook/service로 이동한다.
- `ChatDetailScreen` 에 남아 있는 Minecraft bridge 호출은 minecraft feature public API를 통해 사용하게 바꾼다.

### 완료 기준

- 공개 채팅은 독립 feature가 된다.
- navigation은 chat public API만 소비한다.
- `utils/chatUtils.ts` 는 제거되거나 chat service로 대체된다.

---

## Phase 6. `notice` feature 분리

### 목적

- 학교 공지 도메인을 독립 feature로 정리한다.
- notice 전용 UI/html/rendering/read-status를 한 곳에 모은다.

### 이동 대상

- `src/screens/NoticeScreen.tsx`
- `src/screens/NoticeTab/*`
- `src/components/htmlRender/*`
- `src/hooks/notice/*`
- `src/repositories/interfaces/INoticeRepository.ts`
- `src/repositories/firestore/FirestoreNoticeRepository.ts`
- `src/lib/noticeViews.ts`

### 핵심 작업

- notice detail html renderer는 shared가 아니라 notice feature 소유로 둔다.
- read status helper와 unread banner logic은 notice feature model/service로 정리한다.
- app notice는 notice가 아니라 settings feature가 소유한다.

### 완료 기준

- 학교 공지 feature가 독립된다.
- notice 관련 데이터 접근과 렌더링이 같은 feature 내부에서 해결된다.

---

## Phase 7. `board` feature 분리

### 목적

- 게시판 도메인을 한 feature로 정리한다.
- board comments, likes, bookmarks 흐름을 구조화한다.

### 이동 대상

- `src/screens/BoardScreen.tsx`
- `src/screens/BoardTab/*`
- `src/components/board/*`
- `src/hooks/board/*`
- `src/repositories/interfaces/IBoardRepository.ts`
- `src/repositories/firestore/FirestoreBoardRepository.ts`

### 고정 정책

- `src/lib/moderation.ts` 는 `src/shared/lib/moderation/*` 로 이동한다. `features/moderation` 은 도입하지 않는다.
- `src/components/common/UniversalCommentList.tsx` 는 `src/shared/ui/comments/*` 로 이동한다.
- comment item action, 권한 체크, mutation 호출은 shared에 넣지 않고 board/notice 각 feature의 hook/service adapter가 담당한다.
- 즉, comment UI는 shared, comment business action은 feature 소유라는 정책으로 고정한다.

### 완료 기준

- board 관련 코드는 board feature 안에 모인다.
- bookmark/like/comment 흐름은 board feature service/hook으로 정리된다.

---

## Phase 8. `timetable`, `campus`, `home`, `settings`, `minecraft` 분리

### 목적

- 남은 부가 기능 도메인을 정리하고 홈을 composition feature로 완성한다.

### 8-1. `timetable`

이동 대상:

- `src/hooks/timetable/*`
- `src/hooks/useCourseSearch.ts`
- `src/contexts/CourseSearchContext.tsx`
- `src/components/timetable/*`
- `src/repositories/interfaces/ITimetableRepository.ts`
- `src/repositories/interfaces/ICourseRepository.ts`
- `src/repositories/firestore/FirestoreTimetableRepository.ts`
- `src/repositories/firestore/FirestoreCourseRepository.ts`

### 8-2. `campus`

이동 대상:

- `src/components/academic/*`
- `src/components/cafeteria/*`
- `src/hooks/setting/useAcademicSchedules.ts`
- `src/hooks/setting/useCafeteriaMenu.ts`
- `AcademicCalendarDetailScreen`
- `CafeteriaDetailScreen`

### 8-3. `settings`

이동 대상:

- `src/screens/HomeTab/SettingScreen.tsx`
- `src/screens/HomeTab/SettingScreen/*`
- `src/hooks/setting/useAppNotice.ts`
- `src/hooks/setting/useAppNotices.ts`
- `src/hooks/setting/useSubmitInquiry.ts`
- app version check 로직
- legal document screens

추가 분해 대상:

- `src/lib/versionCheck.ts` -> `features/settings/services/appVersionService.ts`

### 8-4. `minecraft`

이동 대상:

- `MinecraftDetailScreen`
- `MinecraftMapDetailScreen`
- `lib/minecraft/*`
- `lib/minecraftChat.ts`
- `FirestoreMinecraftRepository`

추가 주의:

- Minecraft RTDB 연결은 특수 인프라지만, 여전히 `features/minecraft/data` 또는 `services` 안에만 둔다.
- 다른 feature가 Minecraft 기능을 사용할 때는 public API만 통한다.

### 8-5. `home`

이동 대상:

- `HomeScreen`
- `src/components/home/*`

핵심:

- home은 각 feature public API를 조합만 한다.
- home 전용 repository는 만들지 않는다.

### 완료 기준

- 남은 부가 기능들이 feature 체계 안으로 들어왔다.
- home은 조합 전용 feature로 정리되었다.

---

## Phase 9. 레거시 제거와 최종 검증

### 목적

- 임시 shim과 레거시 root 구조를 제거한다.
- 최종 구조만 남긴다.

### 제거 대상

- `src/screens`
- `src/components`
- `src/hooks`
- `src/repositories`
- `src/contexts`
- `src/lib`
- `src/utils`
- `src/api`

단, 실제 최종 feature/app/shared 이동이 모두 끝난 후에만 제거한다.

### 정리 작업

- route key와 UI label 완전 분리
- 오타 파일명 정리
- barrel export 정리
- deep import 제거
- dead code 삭제
- placeholder migration comment 제거

### 최종 검증 항목

- lint 통과
- test 통과
- 앱 진입, 로그인, 프로필 완료, 권한 온보딩 동작 확인
- 택시 파티 목록/생성/채팅/정산 동작 확인
- 공개 채팅 목록/상세 동작 확인
- 공지 목록/상세/읽음 처리 동작 확인
- 게시판 목록/상세/작성/수정/댓글 동작 확인
- 시간표/학사일정/학식 동작 확인
- 앱 공지/문의하기/설정 화면 동작 확인

## 단계별 실행 원칙

각 단계에서 공통으로 지켜야 할 것:

- 기능 변경보다 구조 이동을 우선한다.
- 동작 변경이 필요한 경우 service 분리와 함께 최소 범위로 한다.
- 한 단계가 끝날 때 public API와 import 경계를 점검한다.
- 다음 단계로 가기 전에 레이어 위반을 남겨둔 채 넘어가지 않는다.
- 각 단계 종료 시 hard gate 검증으로 `npm test -- --runInBand` 를 수행한다.
- lint 검증은 전역 `npm run lint` 가 아니라 "이번 Phase에서 추가/수정한 파일에 대한 대상 eslint"를 hard gate로 사용한다.
- 전역 `npm run lint` 는 참고 지표로만 사용한다. 현재 baseline 자체에 레거시 오류와 대량 warning이 남아 있고, root lint에는 범위 밖인 `firebase-cloud-functions/` 도 포함되기 때문이다.
- 전역 `npx tsc --noEmit` 는 phase gate로 사용하지 않는다. 현재 리포에는 프론트엔드 리팩터링 범위 밖인 `firebase-cloud-functions/` 와 기존 mock/test 코드의 선행 타입 오류가 남아 있기 때문이다.
- 각 Phase 스레드는 작업 마지막에 `docs/refactor/migration-status.md` 를 반드시 현재 상태로 갱신한다.
- 실제 구현 과정에서 구조 규칙이나 phase 해석을 더 명확히 고정했다면 관련 refactor 문서도 같은 턴에서 함께 갱신한다.

## 최종 목표 상태 요약

최종적으로 리팩터링 AI는 아래 상태를 만들어야 한다.

- 프론트엔드는 `app/shared/features` 구조가 된다.
- 각 feature는 자기 화면, 자기 hook, 자기 service, 자기 data를 가진다.
- shared는 진짜 공용만 가진다.
- app은 조립과 guard만 가진다.
- navigation은 business logic을 가지지 않는다.
- Firebase 접근은 허용된 data/shared infra 레이어 안에만 있다.
