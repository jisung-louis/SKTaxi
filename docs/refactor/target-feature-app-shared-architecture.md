# 최종 목표 아키텍처: feature + app/shared

## 목표

최종 목표는 다음 세 가지를 동시에 만족하는 구조다.

1. 기능별 코드는 `features/*` 안에 모인다.
2. 앱 조립 코드는 `app/*` 에 남는다.
3. 진짜 공용 코드만 `shared/*` 에 남는다.

이 프로젝트의 최종 구조는 "가로 레이어 중심 구조"가 아니라,  
"기능 중심 구조 위에 app/shared를 얇게 얹는 구조"여야 한다.

## 범위 제외

- `firebase-cloud-functions/` 이하 Firebase Cloud Functions 리팩터링은 이 목표 구조의 대상이 아니다.
- 이유: Cloud Functions는 별도 Spring 백엔드 마이그레이션으로 대체될 예정이기 때문이다.
- 따라서 본 문서의 "최종 목표 구조"는 `src/` 프론트엔드 코드베이스에만 적용한다.

## 최종 Top-Level 구조

```text
src/
  app/
    bootstrap/
    navigation/
    providers/
    guards/

  shared/
    ui/
    hooks/
    lib/
    constants/
    types/
    testing/

  features/
    auth/
    user/
    home/
    taxi/
    chat/
    notice/
    board/
    timetable/
    campus/
    settings/
    minecraft/
```

## 영역별 책임

### `app/`

앱 전체를 조립하는 레이어다.  
여기에는 "도메인 고유 로직"이 아니라 "앱 레벨 orchestration"만 둔다.

포함 대상:

- 앱 부트스트랩
- 전역 provider 조합
- navigation
- auth/profile/permission guard
- 앱 시작 시 필요한 global handler 등록

포함하면 안 되는 것:

- feature 고유 비즈니스 로직
- Firebase 문서 조작 로직
- feature 전용 hook
- feature 전용 component

권장 구조:

```text
src/app/
  bootstrap/
    configureGoogleSignin.ts
    registerGlobalHandlers.ts

  navigation/
    RootNavigator.tsx
    MainTabs.tsx
    routeNames.ts
    types.ts

  providers/
    AppProviders.tsx

  guards/
    AuthGuard.tsx
    ProfileCompletionGuard.tsx
    PermissionGuard.tsx
```

### `shared/`

여러 feature에서 공통으로 쓰는 코드만 두는 레이어다.  
shared는 어떤 feature에도 종속되면 안 된다.

포함 대상:

- 공용 UI primitives
- 공용 상수
- 공용 타입
- Firebase client wrapper 같은 infra-level helper
- analytics, date, validation, error helper 같은 cross-feature utility
- testing helper

포함하면 안 되는 것:

- board 전용 component
- notice 전용 html renderer
- taxi 전용 current location 화면 상태
- chat 전용 unread 계산

권장 구조:

```text
src/shared/
  ui/
    Button/
    Card/
    Dropdown/
    Input/
    Modal/
    PageHeader/
    Loading/
    EmptyState/

  hooks/
    useScreenView.ts

  lib/
    analytics/
    errors/
    firebase/
      auth.ts
      firestore.ts
      database.ts
      messaging.ts
      storage.ts
    permissions/
    date/
    validation/
    device/

  constants/
    colors.ts
    typography.ts
    layout.ts
    departments.ts

  types/
    common.ts

  testing/
    mocks/
    factories/
```

### `features/`

기능별 코드를 모으는 핵심 레이어다.  
각 feature는 자기 화면, 자기 hook, 자기 서비스, 자기 데이터 접근 코드를 내부에 가진다.

## 최종 Feature 목록

### `features/auth`

책임:

- 로그인
- 로그아웃
- 세션 상태
- auth 상태 구독
- 로그인 진입 플로우
- 계정 가이드
- 프로필 완료 전 진입 제어
- 권한 온보딩과 auth-entry 연결

소유 대상 예시:

- `LoginScreen`
- `AccountGuideScreen`
- `CompleteProfileScreen`
- `PermissionOnboardingScreen`
- `TermsOfUseForAuthScreen`
- `useAuth`
- `AuthProvider`

### `features/user`

책임:

- 사용자 프로필
- 계좌 정보
- 알림 설정
- 북마크
- display name lookup
- 현재 사용자 메타 정보

소유 대상 예시:

- `useUserProfile`
- `useAccountInfo`
- `useNotificationSettings`
- `useUserBookmarks`
- `useUserDisplayNames`
- `IUserRepository`
- `FirestoreUserRepository`

### `features/home`

책임:

- 홈 대시보드 화면
- 여러 feature의 요약 정보를 조합하여 렌더링

중요:

- home은 composition feature다.
- home은 자체 repository를 늘리지 않는다.
- home은 다른 feature의 public API를 조합하는 역할만 한다.

### `features/taxi`

책임:

- 파티 목록
- 파티 생성
- 동승 요청
- 파티 채팅
- 정산
- join request badge / modal

소유 대상 예시:

- `TaxiScreen`
- `RecruitScreen`
- `AcceptancePendingScreen`
- `ChatScreen`
- `MapSearchScreen`
- `useParties`, `useParty`, `useMyParty`, `usePartyActions`
- `JoinRequestProvider`
- `IPartyRepository`, `FirestorePartyRepository`
- `partyMessageUtils` 대체 서비스

### `features/chat`

책임:

- 공개 채팅방 목록
- 공개 채팅방 상세
- 채팅방 알림 설정
- unread 상태

소유 대상 예시:

- `ChatListScreen`
- `ChatDetailScreen`
- `useChatRooms`, `useChatRoom`, `useChatMessages`, `useChatActions`
- `IChatRepository`, `FirestoreChatRepository`
- `chatUtils` 대체 서비스

### `features/notice`

책임:

- 학교 공지 목록
- 공지 상세
- 공지 댓글
- 공지 읽음 상태
- 공지 좋아요

소유 대상 예시:

- `NoticeScreen`
- `NoticeDetailScreen`
- `NoticeDetailWebViewScreen`
- `useNotices`, `useNotice`, `useNoticeComments`
- `INoticeRepository`, `FirestoreNoticeRepository`
- notice html rendering 관련 코드
- notice view count 관련 서비스

### `features/board`

책임:

- 게시글 목록/상세/작성/수정
- 댓글
- 좋아요/북마크

소유 대상 예시:

- `BoardScreen`
- `BoardDetailScreen`
- `BoardWriteScreen`
- `BoardEditScreen`
- `useBoardPosts`, `useBoardPost`, `useBoardComments`
- `IBoardRepository`, `FirestoreBoardRepository`

### `features/timetable`

책임:

- 시간표 조회/편집
- 강의 검색
- course cache

소유 대상 예시:

- `TimetableDetailScreen`
- `TimetableSection`
- `useTimetable`
- `useCourseSearch`
- `CourseSearchProvider`
- `ITimetableRepository`
- `ICourseRepository`

### `features/campus`

책임:

- 학사 일정
- 학식 메뉴

소유 대상 예시:

- `AcademicCalendarDetailScreen`
- `CafeteriaDetailScreen`
- `AcademicCalendarSection`
- `CafeteriaSection`
- `useAcademicSchedules`
- `useCafeteriaMenu`

### `features/settings`

책임:

- 앱 공지
- 문의하기
- 법적 문서 화면
- 앱 버전 정보
- 설정 허브 화면

소유 대상 예시:

- `SettingScreen`
- `AppNoticeScreen`
- `AppNoticeDetailScreen`
- `InquiriesScreen`
- `TermsOfUseScreen`
- `PrivacyPolicyScreen`
- `useAppNotice`, `useAppNotices`, `useSubmitInquiry`
- app version check use case

### `features/minecraft`

책임:

- 마인크래프트 서버 상태
- whitelist 관리 화면
- RTDB 기반 bridge 관련 프론트 로직

소유 대상 예시:

- `MinecraftDetailScreen`
- `MinecraftMapDetailScreen`
- `registerMinecraftAccount`
- `minecraftChat` 관련 앱측 브리지

## Canonical Feature 구조

모든 feature는 아래 구조를 기본형으로 삼는다.  
모든 디렉터리가 필수는 아니지만, 역할은 반드시 이 기준을 따라야 한다.

```text
src/features/<feature>/
  screens/
  components/
  hooks/
  services/
  data/
    repositories/
    datasources/
  model/
  providers/
  __tests__/
  index.ts
```

## Feature 내부 폴더 역할

### `screens/`

- navigation route에 직접 연결되는 컨테이너
- 여러 component, hook, service를 조합
- 화면 조립과 라우팅 파라미터 처리 담당

금지:

- Firebase 직접 호출
- repository 구현체 직접 생성
- 대규모 비즈니스 규칙 구현

### `components/`

- 해당 feature에서만 쓰는 UI 조각
- presentational component 우선
- feature 내부 재사용 목적

금지:

- 다른 feature 전용 데이터 접근
- navigation state 조작 남발

### `hooks/`

- UI orchestration
- subscription 연결
- 화면 상태 조합
- component가 쓰기 좋은 형태로 service 결과를 가공

금지:

- raw Firebase SDK 호출
- 복잡한 cross-document transaction

### `services/`

- feature 비즈니스 로직
- use case
- 여러 repository 호출을 조합하는 workflow
- 비즈니스 규칙, side-effect orchestration

예시:

- 파티 생성
- 동승 수락/거절
- 정산 완료
- 앱 공지 강제 업데이트 체크
- 탈퇴 처리 workflow

### `data/repositories/`

- feature 데이터 접근 구현체
- Firebase / API adapter
- repository interface와 implementation 소유

예시:

- `IChatRepository`
- `FirebaseChatRepository`
- `INoticeRepository`
- `FirebaseNoticeRepository`

### `data/datasources/`

- raw SDK 호출을 가장 낮은 레벨에서 감싸는 곳
- 필요 시 repository보다 한 단계 더 아래에서 분리

예시:

- Firestore query builder
- RTDB adapter
- FCM adapter

### `model/`

- feature 타입
- constants
- mapper
- selector
- pure function

### `providers/`

- feature 전용 context/provider

예시:

- `AuthProvider`
- `JoinRequestProvider`
- `CourseSearchProvider`

### `index.ts`

- feature의 public API만 export
- 다른 feature와 app은 내부 경로가 아니라 이 public API만 사용

## Frontend 최종 목표 트리

```text
src/
  app/
    bootstrap/
      configureGoogleSignin.ts
      registerGlobalHandlers.ts
    guards/
      AuthGuard.tsx
      ProfileCompletionGuard.tsx
      PermissionGuard.tsx
    navigation/
      RootNavigator.tsx
      MainTabs.tsx
      routeNames.ts
      types.ts
    providers/
      AppProviders.tsx

  shared/
    constants/
      colors.ts
      typography.ts
      layout.ts
      departments.ts
    hooks/
      useScreenView.ts
    lib/
      analytics/
      date/
      device/
      errors/
      firebase/
      permissions/
      validation/
    testing/
      factories/
      mocks/
    types/
      common.ts
    ui/
      Button/
      Card/
      Dropdown/
      EmptyState/
      Input/
      Loading/
      Modal/
      PageHeader/
      Text/

  features/
    auth/
      components/
      data/
        repositories/
      hooks/
      model/
      providers/
      screens/
      services/
      index.ts

    user/
      components/
      data/
        repositories/
      hooks/
      model/
      screens/
      services/
      index.ts

    home/
      components/
      hooks/
      screens/
      model/
      index.ts

    taxi/
      components/
      data/
        repositories/
      hooks/
      model/
      providers/
      screens/
      services/
      index.ts

    chat/
      components/
      data/
        repositories/
      hooks/
      model/
      screens/
      services/
      index.ts

    notice/
      components/
      data/
        repositories/
      hooks/
      model/
      screens/
      services/
      index.ts

    board/
      components/
      data/
        repositories/
      hooks/
      model/
      screens/
      services/
      index.ts

    timetable/
      components/
      data/
        repositories/
      hooks/
      model/
      providers/
      screens/
      services/
      index.ts

    campus/
      components/
      data/
        repositories/
      hooks/
      model/
      screens/
      services/
      index.ts

    settings/
      components/
      data/
        repositories/
      hooks/
      model/
      screens/
      services/
      index.ts

    minecraft/
      components/
      data/
        repositories/
      hooks/
      model/
      screens/
      services/
      index.ts
```

## 현재 폴더 -> 최종 위치 매핑 기준

### 루트 레벨 매핑

| 현재 위치 | 최종 위치 |
|---|---|
| `src/screens/*` | 각 feature의 `screens/` |
| `src/components/common/*` | `src/shared/ui/*` |
| `src/components/board/*` | `src/features/board/components/*` |
| `src/components/home/*` | `src/features/home/components/*` |
| `src/components/academic/*` | `src/features/campus/components/*` |
| `src/components/cafeteria/*` | `src/features/campus/components/*` |
| `src/components/timetable/*` | `src/features/timetable/components/*` |
| `src/components/htmlRender/*` | `src/features/notice/components/html/*` |
| `src/hooks/auth/*` | `src/features/auth/hooks/*` |
| `src/hooks/user/*` | `src/features/user/hooks/*` |
| `src/hooks/party/*` | `src/features/taxi/hooks/*` |
| `src/hooks/chat/*` | `src/features/chat/hooks/*` |
| `src/hooks/board/*` | `src/features/board/hooks/*` |
| `src/hooks/notice/*` | `src/features/notice/hooks/*` |
| `src/hooks/timetable/*` | `src/features/timetable/hooks/*` |
| `src/hooks/setting/*` | `settings`, `campus` 로 분리 |
| `src/hooks/common/useScreenView.ts` | `src/shared/hooks/useScreenView.ts` |
| `src/hooks/common/useFirestoreSubscription.ts` | `src/shared/hooks/useFirestoreSubscription.ts` |
| `src/hooks/common/usePagination.ts` | `src/shared/hooks/usePagination.ts` |
| `src/hooks/common/usePermissionStatus.ts` | `src/shared/hooks/usePermissionStatus.ts` + `src/shared/lib/permissions/*` |
| `src/hooks/common/useNotifications.ts` | `src/features/user/hooks/*` |
| `src/repositories/interfaces/*` | 각 feature의 `data/repositories/*` |
| `src/repositories/firestore/*` | 각 feature의 `data/repositories/*` |
| `src/contexts/AuthContext.tsx` | `src/features/auth/providers/AuthProvider.tsx` |
| `src/contexts/JoinRequestContext.tsx` | `src/features/taxi/providers/JoinRequestProvider.tsx` |
| `src/contexts/CourseSearchContext.tsx` | `src/features/timetable/providers/CourseSearchProvider.tsx` |
| `src/navigations/*` | `src/app/navigation/*` |
| `src/config/*` | `src/app/bootstrap/*` 또는 `src/shared/lib/firebase/*` |
| `src/constants/*` | `src/shared/constants/*` 또는 feature `model/*` |
| `src/errors/*` | `src/shared/lib/errors/*` |
| `src/lib/*` | `shared/lib` 또는 각 feature `services/` 로 재배치 |
| `src/utils/*` | `shared/lib` 또는 각 feature `services/model` 로 재배치 |

### 특수 파일 분해 매핑

아래 파일들은 단순 이동이 아니라 "역할별 분해"가 필요하다.

| 현재 파일 | 최종 분해 방향 |
|---|---|
| `src/lib/notifications.ts` | `app/bootstrap/registerPushHandlers.ts` + `features/taxi/services/*` + `features/chat/services/*` + `features/notice/services/*` |
| `src/lib/fcm.ts` | `shared/lib/firebase/messaging/*` + `features/user/services/fcmTokenService.ts` |
| `src/lib/versionCheck.ts` | `features/settings/services/appVersionService.ts` |
| `src/lib/minecraftChat.ts` | `features/minecraft/services/minecraftChatBridgeService.ts` |
| `src/lib/minecraft/registerAccount.ts` | `features/minecraft/services/registerMinecraftAccountService.ts` |
| `src/lib/moderation.ts` | `shared/lib/moderation/moderationService.ts` |
| `src/utils/withdrawUtils.ts` | `features/user/services/accountWithdrawalService.ts` |
| `src/utils/chatUtils.ts` | `features/chat/services/chatRoomMessageService.ts` |
| `src/utils/partyMessageUtils.ts` | `features/taxi/services/partyMessageService.ts` |
| `src/navigations/hooks/useFcmSetup.ts` | `app/bootstrap/registerPushHandlers.ts` |
| `src/navigations/hooks/useForegroundNotification.ts` | `app/bootstrap/notificationRouter.ts` + feature action service 호출 |
| `src/navigations/hooks/useJoinRequestModal.ts` | `features/taxi/hooks/useJoinRequestModal.ts` |
| `src/hooks/common/useNotifications.ts` | `features/user/hooks/useInAppNotifications.ts` |
| `src/api/*` | 최종적으로 제거. HTTP backend가 필요해지면 `shared/lib/http/*` 또는 각 feature `data/datasources/http/*` 로 재도입 |

### 현재 root screen 분류 기준

| 현재 파일 | 최종 feature |
|---|---|
| `src/screens/HomeScreen.tsx` | `features/home` |
| `src/screens/TaxiScreen.tsx` | `features/taxi` |
| `src/screens/BoardScreen.tsx` | `features/board` |
| `src/screens/NoticeScreen.tsx` | `features/notice` |
| `src/screens/ChatListScreen.tsx` | `features/chat` |
| `src/screens/PermissionOnboardingScreen.tsx` | `features/auth` |

## 최종 상태에서 없어져야 하는 레거시 루트 폴더

최종 구조에서는 아래 루트 구조가 사라져야 한다.

- `src/screens`
- `src/components`
- `src/hooks`
- `src/repositories`
- `src/contexts`
- `src/lib`
- `src/utils`
- `src/api`

단, 완전 제거는 마지막 단계에서 한다.  
중간 단계에서는 re-export shim을 잠시 둘 수 있다.

## 최종 아키텍처의 성공 조건

최종적으로 아래 조건을 만족해야 한다.

- 새 코드는 반드시 `app`, `shared`, `features` 아래에만 생성된다.
- feature 코드 변경 시 다른 feature 내부 파일을 직접 뒤지지 않아도 된다.
- screen은 repository 구현체와 Firebase SDK를 직접 모른다.
- navigation은 feature public API만 사용한다.
- shared는 어떤 feature에도 의존하지 않는다.
- home은 composition feature로만 동작한다.
