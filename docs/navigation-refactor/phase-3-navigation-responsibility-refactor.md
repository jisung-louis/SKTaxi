# SKURI 2.0 Navigation Responsibility Refactor Plan

## 문서 목적

이 문서는 현재 내비게이션 관련 코드에서 책임이 한 파일에 과도하게 몰리거나, 같은 책임이 여러 군데에 중복된 부분을 정리하기 위한 기준 문서다.

이번 정리의 목표는 UI 변경이 아니라 아래 3가지를 만드는 것이다.

1. 내비게이션 구조 변경이 한 파일에 과도하게 몰리지 않도록 파일 책임을 나눈다.
2. 알림 진입 로직이 여러 군데에 흩어져 있는 상태를 줄인다.
3. Campus 전환 과정에서 생긴 임시 중복 코드를 공통 helper 로 정리한다.

## 현재 문제

### 1. `MainNavigator.tsx`에 책임이 너무 많다

현재 `src/app/navigation/MainNavigator.tsx`가 아래 역할을 모두 갖고 있다.

- 메인 바텀 탭 등록
- 각 탭 stack navigator 정의
- 각 탭 screen import 와 등록
- 탭 라벨 관리
- 바텀 탭 숨김 규칙 관리
- animated tab bar 연결
- 알림 권한 bubble 표시

이 상태에서는 탭 하나의 구조만 바꿔도 `MainNavigator.tsx`를 크게 수정하게 된다.

### 2. 알림 클릭 후 이동 규칙이 여러 곳에 흩어져 있다

현재 알림 타입별 이동 규칙이 아래 파일들에 나뉘어 있다.

- `src/app/bootstrap/pushNotificationRuntime.ts`
- `src/app/bootstrap/useForegroundNotificationRuntime.ts`
- `src/features/user/screens/NotificationScreen.tsx`

이 구조에서는 같은 목적지를 여러 방식으로 이동하고 있어, 탭 구조가 다시 바뀌면 수정 누락이 발생하기 쉽다.

### 3. Campus 전환 과정에서 화면 이동 helper 가 중복됐다

현재 아래 두 화면이 거의 같은 helper 를 각각 들고 있다.

- `src/features/campus/screens/CampusScreen.tsx`
- `src/features/home/screens/HomeScreen.tsx`

중복된 helper 는 아래 종류다.

- Campus 내부 상세 화면 열기
- Taxi 메인/채팅 관련 화면 열기
- Notice 목록/상세 화면 열기

### 4. 채팅 feature 서비스가 앱 전체 navigation 구조를 알고 있다

`src/features/chat/services/chatRoomService.ts` 안에 아래 책임이 들어 있다.

- 현재 root navigation state 에서 `Main > CommunityTab > ChatDetail` 상태를 해석
- 특정 채팅방으로 이동하는 route 생성

이건 chat domain 자체보다 `app/navigation` 계층의 책임에 더 가깝다.

## 목표 구조

이번 정리 이후 기준 구조는 아래처럼 잡는다.

```text
src/app/navigation
├── components
│   ├── AnimatedTabBar.tsx
│   └── V2BottomTabBar.tsx
├── config
│   └── mainTabs.ts
├── navigators
│   ├── CampusStackNavigator.tsx
│   ├── CommunityStackNavigator.tsx
│   ├── NoticeStackNavigator.tsx
│   └── TaxiStackNavigator.tsx
├── selectors
│   └── getCurrentChatRoomIdFromNavigationState.ts
├── services
│   ├── campusEntryNavigation.ts
│   ├── communityNavigation.ts
│   └── notificationNavigation.ts
├── MainNavigator.tsx
└── types.ts
```

## 실행 원칙

### 1. `MainNavigator.tsx`는 조립 전용 파일로 축소한다

`MainNavigator.tsx`는 아래 역할만 남긴다.

- `JoinRequestProvider` 래핑
- 메인 탭 조립
- 탭 상태 hook 연결
- `AnimatedTabBar`에 상태 전달

반대로 아래 내용은 별도 파일로 이동한다.

- 탭별 stack navigator
- 바텀 탭 라벨/숨김 규칙 config
- animated tab bar 구현

### 2. 알림 이동 규칙은 app 계층에 모은다

알림 타입을 보고 어디로 갈지 결정하는 코드는 `src/app/navigation/services/notificationNavigation.ts`로 모은다.

이 파일은 아래 역할을 맡는다.

- 알림 payload 타입별 분기
- board/notice/app notice/community chat/taxi chat 목적지 helper 호출
- 필요 시 `join_request` 콜백 호출

이후 아래 파일들은 직접 route 객체를 조립하지 않고 공통 함수를 호출한다.

- `pushNotificationRuntime.ts`
- `useForegroundNotificationRuntime.ts`
- `NotificationScreen.tsx`

### 3. Campus 전환 helper 는 공통 service 로 뺀다

`src/app/navigation/services/campusEntryNavigation.ts`를 만들고 아래 helper 를 한 곳에 둔다.

- Campus 내부 상세 화면 이동
- Taxi 메인 이동
- Taxi 승인대기 화면 이동
- Notice 목록 이동
- Notice 상세 이동

이후 `CampusScreen.tsx`와 `HomeScreen.tsx`는 같은 helper 를 함께 사용한다.

### 4. 채팅방 state selector 는 feature 밖으로 옮긴다

아래 기능은 `chatRoomService.ts`에서 제거하고 `app/navigation`으로 이동한다.

- 현재 navigation state 에서 열린 chatRoomId 추출
- Community chat detail 화면으로 이동

이유는 이 책임이 chat 도메인 규칙이 아니라 앱 navigation 구조 자체이기 때문이다.

## 변경 범위

### A. 파일 추가

- `src/app/navigation/components/AnimatedTabBar.tsx`
- `src/app/navigation/config/mainTabs.ts`
- `src/app/navigation/navigators/CampusStackNavigator.tsx`
- `src/app/navigation/navigators/CommunityStackNavigator.tsx`
- `src/app/navigation/navigators/NoticeStackNavigator.tsx`
- `src/app/navigation/navigators/TaxiStackNavigator.tsx`
- `src/app/navigation/selectors/getCurrentChatRoomIdFromNavigationState.ts`
- `src/app/navigation/services/campusEntryNavigation.ts`
- `src/app/navigation/services/communityNavigation.ts`
- `src/app/navigation/services/notificationNavigation.ts`

### B. 파일 수정

- `src/app/navigation/MainNavigator.tsx`
- `src/app/navigation/index.ts`
- `src/app/bootstrap/pushNotificationRuntime.ts`
- `src/app/bootstrap/useForegroundNotificationRuntime.ts`
- `src/features/chat/index.ts`
- `src/features/chat/services/chatRoomService.ts`
- `src/features/campus/screens/CampusScreen.tsx`
- `src/features/home/screens/HomeScreen.tsx`
- `src/features/user/screens/NotificationScreen.tsx`

### C. 이번 단계에서 하지 않는 것

- 모든 navigation `any` 제거
- notification model 을 discriminated union 으로 전면 교체
- feature navigation service 삭제
- Root/Auth navigator 구조 변경

이건 다음 정리 단위로 남긴다.

## 완료 기준

아래 조건을 만족하면 이번 정리를 완료로 본다.

1. `MainNavigator.tsx`가 탭 조립 중심의 얇은 파일이 된다.
2. 알림 클릭 목적지 분기가 하나의 service 로 모인다.
3. `CampusScreen.tsx`와 `HomeScreen.tsx`의 공통 이동 helper 중복이 제거된다.
4. chat feature service 가 root navigation state 해석 책임을 더 이상 갖지 않는다.
5. 기존 동작은 유지되며, 탭 구조와 알림 이동 흐름이 깨지지 않는다.
