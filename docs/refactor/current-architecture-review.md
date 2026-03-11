# 현재 아키텍처 분석 및 리팩토링 방향

## 요약

이 프로젝트는 완전히 무질서한 구조는 아니지만, 레이어드 아키텍처로 정리하려는 시도와 기능 단위로 급하게 증식한 실제 코드가 겹쳐 있는 과도기 구조다.  
즉, 폴더는 나뉘어 있지만 책임 경계는 자주 깨지고 있고, 그래서 유지보수 시 실제 체감은 "뒤섞여 있다"에 가깝다.

핵심 판단은 다음과 같다.

- 현재 구조는 완전한 feature-based도 아니고 완전한 layered도 아니다.
- 의도된 데이터 흐름은 `screen -> hook -> repository(interface) -> Firebase` 이다.
- 실제 구현은 `screen/navigation/lib/utils -> repository implementation/Firebase` 우회 경로가 많다.
- `Repository + DI`는 도입되어 있지만 강제되는 규칙이 아니라서 구조적 일관성이 약하다.
- 프론트엔드는 "모듈화 의도는 있으나 실제로는 큰 파일과 강한 결합이 남아 있는 구조"다.
- Cloud Functions 역시 비슷한 문제가 있지만, 본 리팩터링 범위에서는 제외한다.

## 현재 런타임 구조

### 1. 앱 진입

- `App.tsx` 에서 `RepositoryProvider -> AuthProvider -> CourseSearchProvider -> NavigationContainer` 순으로 Provider를 구성한다.
- `RootNavigator` 는 인증 여부, 프로필 완성 여부, 권한 온보딩 여부에 따라 흐름을 분기한다.
- `MainNavigator` 는 탭/스택 네비게이션을 구성한다.

### 2. 의도된 데이터 계층

현재 코드가 지향하는 기본 구조는 다음과 같다.

```text
Screen / Presenter
-> Domain Hook
-> Repository Interface + DI
-> Firestore / Auth / Storage / RTDB
```

이 방향은 아래 구조에서 비교적 선명하게 보인다.

- `src/di`
- `src/repositories/interfaces`
- `src/repositories/firestore`
- `src/hooks/auth`
- `src/hooks/party`
- `src/hooks/board`
- `src/hooks/notice`
- `src/hooks/chat`

### 3. 실제 구현의 우회 경로

문제는 이 흐름이 일관되게 지켜지지 않는다는 점이다.

- 일부 `screen` 이 직접 repository를 사용한다.
- 일부 `navigation hook` 이 직접 Firestore를 구독한다.
- 일부 `lib` 와 `utils` 가 repository 구현체를 직접 생성한다.
- 일부 `screen` 이 Firebase API를 직접 호출한다.

따라서 실제 구조는 다음에 더 가깝다.

```text
screen
  -> hook
  -> di/repository
  -> lib
  -> utils
  -> Firebase direct
```

이게 현재 의존성이 꼬여 보이는 가장 큰 이유다.

## 폴더 구조 평가

### 현재 장점

- 도메인별 hook 분리가 어느 정도 되어 있다.
- repository interface와 firestore 구현체를 분리하려는 방향이 있다.
- DI Provider가 존재한다.
- 일부 복잡한 화면은 presenter hook으로 분리하려는 시도가 있다.
- 정적 import 기준 파일 단위 순환 의존성은 검출되지 않았다.

### 현재 문제

#### 1. 레이어 구조와 feature 구조가 동시에 존재한다

한 기능이 여러 축으로 흩어진다.

예를 들어 게시판 기능은 아래에 동시에 퍼져 있다.

- `src/screens/BoardTab`
- `src/components/board`
- `src/hooks/board`
- `src/repositories/firestore/FirestoreBoardRepository.ts`
- `src/types/board.ts`
- `src/constants/board.ts`
- `src/lib/moderation.ts`

반면 택시/채팅 일부는 `src/screens/TaxiTab/hooks`, `src/screens/ChatTab/hooks` 처럼 screen 하위의 feature-local hook 구조도 사용한다.

결과적으로 아래 두 방식이 공존한다.

- 가로 레이어 분리: `hooks/components/repositories/types`
- 세로 feature 분리: `screens/TaxiTab/hooks/components/chat`

이 구조는 기능 변경 시 탐색 비용을 크게 올린다.

#### 2. repository 경계가 강제되지 않는다

`Repository + DI`가 있지만 경계는 자주 깨진다.

- `lib/versionCheck.ts`
- `lib/fcm.ts`
- `lib/notifications.ts`
- `utils/chatUtils.ts`
- `utils/partyMessageUtils.ts`

이 파일들은 repository 구현체를 직접 생성하거나 Firebase를 직접 사용한다.  
즉, repository 패턴이 존재해도 애플리케이션 전역 규칙으로 통제되고 있지 않다.

#### 3. navigation 계층이 너무 두껍다

이상적인 navigator는 화면 조립과 라우팅에 집중해야 한다.  
하지만 현재는 다음 책임까지 같이 가진다.

- 권한 상태 확인
- unread 계산
- Firestore 구독
- foreground notification 라우팅
- join request modal 관리

그 결과 navigator가 composition layer가 아니라 사실상 application layer 일부가 되어 있다.

#### 4. 큰 파일이 많고 책임 분리가 불완전하다

대표적으로 다음 파일들은 유지보수 비용이 높다.

- `src/screens/ChatTab/ChatDetailScreen.tsx`
- `src/screens/HomeTab/MinecraftDetailScreen.tsx`
- `src/screens/TaxiTab/hooks/useChatScreenPresenter.ts`
- `src/screens/TaxiTab/chat/ChatModals.tsx`
- `src/screens/TaxiTab/RecruitScreen.tsx`

특히 택시 채팅과 공개 채팅, 마인크래프트 상세, 권한 온보딩은 복합 책임이 한 파일에 많이 모여 있다.

#### 5. `lib` 와 `utils` 가 순수하지 않다

현재 `lib` 와 `utils` 는 단순 유틸리티 계층이 아니다.

- 서비스 로직
- 알림 orchestration
- 계정 탈퇴 정리
- repository 생성
- 일부 Firebase 접근

같은 역할이 섞여 있다.

즉, 이름은 util/lib인데 실제로는 application service 성격을 가진 파일들이 많다.

#### 6. 미래 구조용 스캐폴딩이 현재 구조를 더 복잡하게 만든다

`src/api`, 일부 repository interface, Spring 마이그레이션 주석 등은 미래 방향을 보여주지만 현재 런타임에서 적극적으로 쓰이지 않는 부분도 많다.

이 상태는 다음 문제를 만든다.

- 지금 쓰는 구조와 나중에 쓰고 싶은 구조가 공존한다.
- 실제 규칙보다 "의도"가 더 많다.
- 새 기능 추가 시 어디에 넣어야 할지 판단 기준이 흔들린다.

#### 7. 이름과 문서 일관성이 약하다

예시:

- `src/constants/typhograpy.ts`
- `src/screens/HomeTab/SettingScreen/NofiticationSettingScreen.tsx`

또한 일부 주석은 실제 파일 상태와 맞지 않는다.  
이런 작은 불일치는 시간이 지날수록 구조 신뢰도를 떨어뜨린다.

## 백엔드 구조 평가

Firebase Cloud Functions는 `firebase-cloud-functions/src/index.ts` 한 파일에 많이 집중되어 있다.

현재 이 파일은 아래 역할을 모두 가진다.

- 파티 알림
- 채팅 알림
- 공지 RSS 수집
- 공지 상세 크롤링
- 마인크래프트 RTDB -> Firestore 동기화
- 게시판/공지 알림
- FCM 실패 토큰 정리

즉, 프론트와 마찬가지로 "도메인 모듈 분리 의도는 있으나 실제 구현은 모놀리스" 상태다.

다만 이 문서 세트의 리팩터링 실행 범위는 프론트엔드이며,  
Cloud Functions는 곧 Spring 백엔드로 마이그레이션될 예정이므로 구조 개편 대상에서 제외한다.

## 현재 아키텍처에 대한 최종 평가

현재 구조를 가장 정확하게 표현하면 다음과 같다.

> Firebase 중심 레이어드 구조 위에 feature-local presenter와 예외 util/service가 누적된 하이브리드 구조

따라서 이 프로젝트를 리팩토링할 때는 "폴더만 옮기는 수준"으로는 충분하지 않다.  
핵심은 아래 두 가지다.

- 기능을 한 곳에 모으는 것
- Firebase 접근 경계를 강제하는 것

## 권장 리팩토링 방향

### 방향 1. feature-based 중심으로 재편

기능 단위로 코드를 모으는 것이 맞다.

예시:

- `features/auth`
- `features/taxi`
- `features/chat`
- `features/board`
- `features/notice`
- `features/timetable`
- `features/home`
- `features/settings`
- `features/minecraft`

### 방향 2. feature 내부에 계층을 작게 둔다

feature-based는 "컴포넌트만 한 폴더에 모은다"가 아니다.  
실제로는 feature 내부에 필요한 하위 계층을 같이 둔다.

예시:

```text
src/features/taxi/
  screens/
  components/
  hooks/
  services/
  data/
    repositories/
  model/
  providers/
  index.ts
```

여기서 중요한 점은 `global hooks`, `global components`, `global utils` 를 무한정 늘리는 것이 아니라,  
해당 기능에 속한 것은 feature 내부에 가두는 것이다.

### 방향 3. 공용 코드는 진짜 공용만 남긴다

아래는 계속 공용 레벨에 남겨도 된다.

- `src/app`
- `src/shared/ui`
- `src/shared/lib`
- `src/shared/types`
- `src/shared/constants`
- `src/app/providers`
- `src/app/navigation`

단, 여기에는 정말 여러 feature가 함께 쓰는 코드만 남겨야 한다.

## 우선순위

리팩토링 우선순위는 다음이 적절하다.

1. 택시 채팅 / 공개 채팅
2. 공지 / 게시판 댓글 구조
3. 인증 / 온보딩 / 프로필
4. 설정 / 알림
5. 마인크래프트 특수 기능

## 결론

지금 이 프로젝트는 feature-based로 재편하는 것이 맞다.  
다만 단순히 폴더만 `features/*` 로 옮기면 안 되고, 다음 원칙이 같이 필요하다.

- 기능 코드는 feature 내부에 모은다.
- Firebase 접근은 repository/service 경계 밖으로 못 나오게 한다.
- navigator는 얇게 유지한다.
- `lib/utils` 에 숨어 있는 비즈니스 로직을 명시적인 application layer로 올린다.
- 큰 screen/presenter부터 먼저 쪼갠다.
