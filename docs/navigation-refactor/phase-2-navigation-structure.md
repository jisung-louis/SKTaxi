# SKURI 2.0 Navigation Refactor Plan

## 문서 목적

이 문서는 SKURI 2.0 로드맵의 2단계인 내비게이션 구조 변경 작업의 기준 문서다.

목표는 다음 두 가지다.

1. 바텀 탭 구조를 `홈/택시/공지/게시판/채팅`에서 `캠퍼스/택시/공지/커뮤니티`로 변경한다.
2. 3단계 UI 전면 교체 전에 필요한 라우팅 기반을 먼저 정리한다.

이 단계에서는 화면 UI를 전면 교체하지 않는다.

## 현재 구조

현재 메인 내비게이션은 `src/app/navigation/MainNavigator.tsx`를 기준으로 아래 구조를 가진다.

- `HomeTab`
- `TaxiTab`
- `NoticeTab`
- `BoardTab`
- `ChatTab`

문제는 다음과 같다.

- 탭 이름과 제품 로드맵의 목표 구조가 다르다.
- `BoardTab`, `ChatTab`가 분리되어 있어 이후 커뮤니티 통합 UI 전환에 맞는 라우팅 기반이 없다.
- `navigation.navigate('...Tab')` 호출이 여러 feature/service/runtime 파일에 직접 흩어져 있어 탭 이름 변경이 한 파일 수정으로 끝나지 않는다.

## 목표 구조

이번 단계의 목표 구조는 아래와 같다.

```text
RootNavigator
└── MainNavigator
    └── Bottom Tabs
        ├── CampusTab
        │   └── CampusStack
        │       ├── CampusMain
        │       ├── Notification
        │       ├── Setting
        │       ├── Profile
        │       ├── ProfileEdit
        │       ├── AppNotice
        │       ├── AppNoticeDetail
        │       ├── AccountModification
        │       ├── NotificationSettings
        │       ├── Inquiries
        │       ├── TermsOfUse
        │       ├── PrivacyPolicy
        │       ├── CafeteriaDetail
        │       ├── AcademicCalendarDetail
        │       ├── TimetableDetail
        │       ├── MinecraftDetail
        │       └── MinecraftMapDetail
        ├── TaxiTab
        ├── NoticeTab
        └── CommunityTab
            └── CommunityStack
                ├── BoardMain
                ├── BoardDetail
                ├── BoardWrite
                ├── BoardEdit
                ├── ChatList
                └── ChatDetail
```

## 핵심 결정

### 1. `HomeTab`은 `CampusTab`으로 이름을 바꾼다

- 탭 라벨만 `캠퍼스`로 바꾸는 것이 아니라 라우트 이름 자체를 `CampusTab`으로 변경한다.
- 관련 스택 타입도 `HomeStackParamList` 대신 `CampusStackParamList`로 정리한다.
- `HomeScreen` 파일과 `src/features/home` 폴더는 이번 단계에서 유지한다.
  - 이유: 현재 이 화면은 캠퍼스 대시보드 역할을 하지만, 파일 이동/feature rename은 내비게이션 변경과 별개의 리팩터링 단위다.

### 2. `BoardTab`과 `ChatTab`는 제거하고 `CommunityTab`으로 통합한다

- 바텀 탭에서는 `CommunityTab` 하나만 노출한다.
- 하지만 내부적으로는 게시판과 채팅 상세 진입을 유지해야 하므로 `CommunityStack` 안에 게시판 스크린과 채팅 스크린을 모두 등록한다.
- 초기 화면은 `BoardMain`으로 둔다.

### 3. 이번 단계에서는 커뮤니티 상단 탭 UI를 만들지 않는다

- 요구사항상 `커뮤니티 탭`은 아직 기존 `게시판 탭`으로 임시 연결한다.
- 따라서 `CommunityTab` 진입 시 기본 화면은 기존 `BoardScreen`이다.
- `ChatList`와 `ChatDetail`은 푸시 알림, 마인크래프트 화면, 향후 UI 연결을 위해 stack 내부 라우트로만 유지한다.

### 4. 임시 제약을 문서화하고 받아들인다

- 이번 단계 직후에는 바텀 탭에서 공개 채팅 목록으로 직접 들어가는 진입점이 사라진다.
- 이는 제품 요구사항에 맞춘 임시 상태다.
- 3단계 UI 전면 교체에서 `CommunityMain` 또는 상단 탭 구조를 추가하며 해결한다.

## 변경 범위

### A. 내비게이션 정의부

#### 1. `src/app/navigation/types.ts`

변경 내용:

- `MainTabParamList`를 아래 기준으로 변경
  - `CampusTab`
  - `TaxiTab`
  - `NoticeTab`
  - `CommunityTab`
- `HomeStackParamList`를 `CampusStackParamList`로 변경
- 필요 시 `CampusMain` 라우트 이름으로 정리
- `CommunityStackParamList` 추가
  - `BoardStackParamList`와 `ChatStackParamList`를 묶는 역할

#### 2. `src/app/navigation/MainNavigator.tsx`

변경 내용:

- `MAIN_TAB_LABELS` 변경
  - `HomeTab -> CampusTab`
  - `BoardTab/ChatTab -> CommunityTab`
- `HIDDEN_BOTTOM_NAV_SCREENS` 변경
  - `CampusTab` 기준으로 홈 스택 숨김 목록 유지
  - `CommunityTab` 기준으로 게시판/채팅 상세 숨김 목록 통합
- `HomeStackNavigator -> CampusStackNavigator` 정리
- `CommunityStackNavigator` 추가
  - `BoardMain`, `BoardDetail`, `BoardWrite`, `BoardEdit`
  - `ChatList`, `ChatDetail`
- `Tab.Screen` 구성 변경
  - `ChatTab` 제거
  - `BoardTab` 제거
  - `CommunityTab` 추가
- 초기 탭은 `CampusTab`

### B. 탭 이름 직접 참조 사용처

#### 1. `src/features/home/screens/HomeScreen.tsx`

변경 내용:

- `navigation.navigate('HomeTab', ...)`를 `CampusTab` 기준으로 변경

#### 2. `src/features/settings/services/appNoticeNavigationService.ts`

변경 내용:

- 앱 공지 상세 이동 시 `HomeTab` 대신 `CampusTab` 사용

#### 3. `src/features/board/services/boardNavigationService.ts`

변경 내용:

- 게시판 상세 이동 루트를 `BoardTab`이 아니라 `CommunityTab` 기준으로 변경

#### 4. `src/features/chat/services/chatRoomService.ts`

변경 내용:

- 현재 활성 탭 검사에서 `ChatTab` 대신 `CommunityTab` 기준으로 확인
- 채팅방 상세 이동도 `CommunityTab -> ChatDetail`로 변경

#### 5. `src/features/minecraft/screens/MinecraftDetailScreen.tsx`

변경 내용:

- 마인크래프트 채팅방 이동 시 `ChatTab` 대신 `CommunityTab` 사용

### C. 런타임/푸시/알림 라우팅 사용처

#### 1. `src/app/bootstrap/pushNotificationRuntime.ts`

변경 내용:

- `chat_room_message` 클릭 시 `CommunityTab -> ChatDetail`
- 게시판 관련 푸시 이동은 `CommunityTab` 기준으로 동작하도록 정리
- 공지, 택시 라우트는 유지

#### 2. `src/app/bootstrap/useForegroundNotificationRuntime.ts`

변경 내용:

- 게시판 fallback 이동을 `BoardTab`이 아닌 `CommunityTab`으로 변경

#### 3. `src/features/taxi/hooks/useJoinRequestModal.ts`

변경 내용:

- 이번 단계 직접 변경 대상은 아니지만, 택시 승인 알림 이동 로직이 메인 탭 구조와 호환되는지 점검

#### 4. `src/features/user/screens/NotificationScreen.tsx`

변경 내용:

- 이번 단계에서 탭 이름 변경 사용처가 있으면 같이 정리
- 이미 별도 커밋으로 `notification.data` 문자열 타입 가드 적용 완료

## 구현 순서

### 1단계. 타입과 내비게이터 구조 변경

- `types.ts`에서 새 탭/스택 타입 정의
- `MainNavigator.tsx`에서 실제 탭 구조 교체

### 2단계. 탭 이름 직접 참조 사용처 정리

- `HomeScreen`
- `appNoticeNavigationService`
- `boardNavigationService`
- `chatRoomService`
- `MinecraftDetailScreen`

### 3단계. 런타임/푸시 라우팅 정리

- `pushNotificationRuntime`
- `useForegroundNotificationRuntime`
- 관련 fallback route 정리

### 4단계. 검증

- 변경 파일 기준 `eslint`
- 가능한 범위에서 `tsc` 확인
  - 현재 코드베이스에 선행 타입 오류가 있으므로 신규 오류 유무 중심으로 확인
- 내비게이션 동작 수동 점검
  - 캠퍼스 탭 진입
  - 커뮤니티 탭 진입
  - 게시글 상세 진입
  - 채팅방 상세 딥링크 진입
  - 앱 공지 상세 진입
  - 푸시/포그라운드 알림 이동 경로 점검

## 리팩터링 관점 메모

이번 분석에서 확인된 구조적 메모:

- `src/features/home`은 도메인상 이미 `campus dashboard`에 가까움
- 하지만 파일 이동까지 이번 단계에서 같이 처리하면 변경 범위가 불필요하게 커진다
- 따라서 이번 단계는 라우트/탭 이름 변경에 집중하고, feature rename은 후속 리팩터링으로 분리한다

## 후속 작업

이번 단계 완료 후 이어질 작업:

1. `docs/project/project-overview.md`, `README.md` 등 공개 문서의 내비게이션 구조 동기화
2. 3단계 UI 전면 교체에서 `CommunityMain` 또는 상단 탭 UI 추가
3. `home -> campus/dashboard` feature naming 정리 검토

## 완료 기준

아래 조건을 만족하면 이번 단계의 구조 변경은 완료로 본다.

- 바텀 탭이 `캠퍼스/택시/공지/커뮤니티` 4개로 보인다
- `캠퍼스` 탭은 기존 홈 대시보드를 그대로 보여준다
- `커뮤니티` 탭은 기존 게시판 화면으로 진입한다
- 게시판 상세/작성/수정 이동이 유지된다
- 채팅방 상세 딥링크 진입이 유지된다
- 앱 공지/게시판/채팅 관련 알림 이동이 새 탭 구조에서 동작한다
