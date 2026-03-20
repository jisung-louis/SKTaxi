# RN Spring 연동 로드맵

> 최종 수정일: 2026-03-20
> 관련 문서: [프로젝트 종합 문서](./project-overview.md) | [역할 정의](./role-definition.md) | [API 명세](./api-specification.md) | [백엔드 레이어 점검](./backend-layer-review-and-spring-migration.md) | [RN Notification Migration Reference](./rn-notification-migration-reference.md) | [RN Spring 연동 아키텍처 가이드](./frontend-architecture-guideline.md) | [RN Spring 연동 진행 현황](./frontend-migration-status.md) | [Spring API 커버리지와 로깅 가이드](./frontend-api-coverage.md) | [Codex Phase Handoff Prompts](./codex-phase-handoff-prompts.md)

---

## 1. 문서 목적

이 문서는 `/Users/jisung/SKTaxi` React Native 앱을
Firebase/Mock 기반 현재 구조에서
실제 Spring 백엔드(`https://api.skuri.kr`)로 점진적으로 연결하기 위한
프론트엔드 실행 계획을 정리한다.

백엔드 구현 순서 문서인 `implementation-roadmap.md`가
Spring 서버 내부 구현 관점을 다룬다면,
본 문서는 RN 앱에서 어떤 순서로 어떤 경계를 바꿔야 하는지에 집중한다.

---

## 2. 현재 프론트 상태 요약

### 2.1 유지할 수 있는 구조

- 전역 DI 경계는 이미 존재한다.
  - `src/di/RepositoryProvider.tsx`
  - `src/di/RepositoryContext.ts`
  - `src/di/useRepository.ts`
- 도메인 Repository 인터페이스도 상당수 정리되어 있다.
  - `IPartyRepository`
  - `IChatRepository`
  - `IBoardRepository`
  - `INoticeRepository`
  - `IUserRepository`
- Firebase Auth 기반 로그인 흐름은 유지 가능하다.
  - Spring은 Firebase ID Token 검증만 수행한다.

### 2.2 최근 구조 개선 사항

다음 화면 계열은 기존의 “hook이 mock 구현을 직접 아는 구조”에서
“hook -> repository entrypoint” 구조로 한 단계 정리되었다.

- `src/features/settings/hooks/useAppNoticeFeedData.ts`
- `src/features/settings/hooks/useAppNoticeDetailData.ts`
- `src/features/user/hooks/useNotificationCenterData.ts`
- `src/features/taxi/hooks/useTaxiHomeData.ts`

현재 위 hook들은 각각 아래 entrypoint만 참조한다.

- `src/features/settings/data/repositories/appNoticeScreenRepository.ts`
- `src/features/user/data/repositories/notificationCenterRepository.ts`
- `src/features/taxi/data/repositories/taxiHomeRepository.ts`

이 변경으로 얻는 이점:

- hook이 더 이상 `Mock...Repository` 클래스를 직접 몰라도 된다.
- Spring 전환 시 hook 수정 없이 entrypoint 구현만 교체할 수 있다.
- 화면 로직과 데이터 소스 선택 지점이 분리된다.

### 2.3 아직 남은 구조적 한계

- 위 entrypoint는 아직도 module-level에서 mock 구현을 직접 생성한다.
- 즉, 전역 DI(`RepositoryProvider`)와 feature-local entrypoint가 공존하는 상태다.
- 따라서 구조는 분명 좋아졌지만, 아직 “완전히 통일된 주입 구조”는 아니다.

현재 이 패턴이 남아 있는 대표 영역:

- Notice home/detail
- Board detail
- Chat detail
- Community home
- Campus detail/home
- Taxi recruit/chat/pending

---

## 3. 확정된 런타임 계약

### 3.0 계약 확인 우선순위

실제 프론트 구현 시 API 계약은 아래 우선순위로 확인한다.

1. 로컬 백엔드 `/v3/api-docs`
   - 예: `http://localhost:8080/v3/api-docs`
2. 백엔드 구현 코드
   - 경로: `/Users/jisung/skuri-backend`
3. markdown 명세
   - `docs/spring-migration/api-specification.md`

충돌 시 우선순위:

- `/v3/api-docs`
- 백엔드 코드
- markdown 명세

즉, 이 문서는 프론트 실행 로드맵이지 endpoint의 최종 source of truth가 아니다.

### 3.1 기본 서버 정보

- REST base URL: `https://api.skuri.kr`
- 인증: `Authorization: Bearer <firebase_id_token>`
- 로그인 후 bootstrap: `POST /v1/members`

### 3.2 실시간 계약

- Taxi/Notification/Post 계열: SSE
- Chat 계열: WebSocket(STOMP + SockJS)

SSE endpoint:

- `GET /v1/sse/parties`
- `GET /v1/sse/parties/{partyId}/join-requests`
- `GET /v1/sse/members/me/join-requests`
- `GET /v1/sse/notifications`
- `GET /v1/sse/posts`

STOMP endpoint / destination:

- endpoint: `/ws`
- publish: `/app/chat/{chatRoomId}`
- subscribe room: `/topic/chat/{chatRoomId}`
- subscribe room summary: `/user/queue/chat-rooms`
- subscribe error: `/user/queue/errors`
- party chat room id pattern: `party:{partyId}`

### 3.3 이미지 업로드 계약

- `POST /v1/images`
- content-type: `multipart/form-data`
- form fields:
  - `file`
  - `context`
- context enum:
  - `POST_IMAGE`
  - `CHAT_IMAGE`
  - `APP_NOTICE_IMAGE`
  - `PROFILE_IMAGE`

응답 메타:

- `url`
- `thumbUrl`
- `width`
- `height`
- `size`
- `mime`

---

## 4. 마이그레이션 원칙

### 4.1 데이터 접근 원칙

- hook은 repository 또는 query/facade만 참조한다.
- hook이 `Mock...Repository`, Firebase SDK, Spring transport를 직접 참조하지 않는다.
- 화면은 repository/query 구현 교체를 몰라야 한다.
- 서버 DTO는 mapper를 거쳐 domain model 또는 screen read model로 변환한다.

### 4.2 서버 진실 공급원 원칙

- 최종 상태 판단은 서버가 한다.
- 클라이언트는 화면용 파생 계산만 수행한다.
  - 정렬
  - 검색어 필터
  - 섹션 분리
  - 로딩/에러 상태

### 4.3 실시간 분리 원칙

- REST: 기준 상태 조회
- SSE: 목록/상태 변경 동기화
- STOMP: 채팅 송수신

즉, 실시간 연결이 끊기더라도
REST 재조회만으로 화면이 복구되어야 한다.

### 4.4 점진적 전환 원칙

- 한 번에 모든 feature를 바꾸지 않는다.
- 기존 entrypoint가 있는 화면은 구현체 교체부터 먼저 한다.
- 전역 DI를 타는 feature는 `Spring...Repository` 추가 후 `RepositoryProvider` 교체로 간다.

### 4.5 구조 수렴 원칙

- 최종 구조는 중앙집중식 DI를 기본 규칙으로 삼는다.
- Domain Repository는 `RepositoryProvider`에 등록한다.
- 화면 조합이 복잡한 영역은 Query/Assembler/Facade로 분리한다.
- 과도기 feature-local entrypoint는 최종적으로 전역 DI 경계로 흡수한다.

### 4.6 실행 규칙

- 앱 전체 전역 DI 선리팩터링은 Phase 시작의 선행 조건이 아니다.
- Phase A 공통 transport는 현재 혼재 구조를 유지한 상태에서도 바로 진행한다.
- 실제 Spring API를 붙이는 feature는 같은 작업 안에서 중앙집중식 DI로 함께 수렴시킨다.
- 즉, 기본 전략은 “전면 선리팩터링”이 아니라 “feature별 연결 + feature별 중앙화”다.
- 새로운 feature-local singleton repository 패턴은 추가하지 않는다.
- touched feature에 남아 있는 direct mock import는 해당 작업 안에서 제거한다.
- phase는 작업 계획 단위로 사용하고, 커밋 단위로 사용하지 않는다.
- 커밋은 리뷰 가능한 작은 목적 단위로 분리한다.
- phase 전체를 한 커밋으로 묶는 방식은 금지한다.
- 실제 API 호출 구현 전에는 반드시 계약 확인 우선순위(3.0)를 따라 endpoint/DTO/enum을 검증한다.
- 표현/매핑 수준의 계약 차이는 프론트 mapper/query에서 흡수할 수 있다.
- 하지만 인증/인가, 상태 전이, 핵심 도메인 규칙, SSE/STOMP 계약 불일치는 프론트 workaround로 덮지 않는다.
- 이런 서버 진실 공급원 불일치를 발견하면 해당 feature 작업은 중단하고, 사용자에게 백엔드 수정 요청안을 보고한다.

---

## 5. 구현 순서

### Phase A. 공통 Transport 구축

목표:

- HTTP / SSE / STOMP를 공통 레이어로 정리
- Firebase Auth 토큰을 모든 보호 API와 실시간 연결에 재사용

중요:

- 이 단계는 전역 DI 전면 통일이 끝나기를 기다리지 않는다.
- 현재 혼재 구조와 무관하게 먼저 진행한다.
- 이후 feature migration이 이 공통 transport를 재사용한다.

작업:

- `src/shared/api/` 계층 추가
  - `apiConfig`
  - `httpClient`
  - `authTokenProvider`
  - `apiErrorMapper`
- `src/shared/realtime/` 계층 추가
  - `sseClient`
  - `chatSocketClient`
- `useAuthSession()`의 `refreshAuthToken()` 기반 토큰 공급자 작성

완료 기준:

- 보호 REST 요청에 Bearer token이 자동으로 붙는다.
- SSE 연결 시 Authorization 헤더를 붙일 수 있다.
- STOMP CONNECT 헤더에 Authorization을 넣을 수 있다.

### Phase B. 인증/회원 bootstrap 정리

목표:

- 로그인 직후 Spring 보호 API를 안정적으로 호출할 수 있게 한다.
- auth 진입 가드가 mock profile 기본값이 아니라 실제 member profile과 지속 가능한 onboarding 상태를 기준으로 동작하게 한다.

작업:

- 로그인 성공 후 다음 흐름을 고정한다.
  1. Firebase 로그인
  2. ID Token 확보
  3. `POST /v1/members`
  4. `GET /v1/members/me`
- FCM token 등록/삭제도 Spring API 기준으로 이동한다.
- `CompleteProfileScreen` 저장 경로를 `PATCH /v1/members/me`로 이전한다.
- auth session의 핵심 프로필 source of truth를 `userRepository.subscribeToUserProfile()`가 아니라 member profile 기준으로 정리한다.
- `permissionsComplete`는 mock in-memory profile에만 남기지 않고, 재시작 후에도 유지되는 local adjunct 또는 backend 지원 방식으로 정리한다.
- `finalizeGoogleSignIn()`에 남아 있는 `createInitialUserProfile()` / `syncLoginMetadata()` mock 의존은 제거하거나 local adjunct 책임으로 축소한다.
- 닉네임 중복 정책이 제품 필수 규칙이라면 backend 계약을 추가 요청하고, 아니라면 frontend pre-check를 제거한다.

2026-03-18 진행 반영:

- `SpringMemberRepository`와 member API client를 추가했다.
- `memberRepository`를 전역 DI에 등록했다.
- `useAuthSession()`에서 auth user 감지 시 `POST /v1/members` → `GET /v1/members/me`를 먼저 수행한다.
- `signInWithGoogle()` / `signInWithEmailAndPassword()`는 auth session bootstrap 완료까지 대기한다.
- 앱 런타임 토큰 등록/refresh/로그아웃 토큰 해제를 `/v1/members/me/fcm-tokens`로 이전했다.
- 기존 `IUserRepository` 기반 Firebase FCM token 저장 경로는 제거했다.

2026-03-19 진행 반영:

- `CompleteProfileScreen` 저장 경로를 `PATCH /v1/members/me`로 이전했다.
- `useAuthSession()`은 member bootstrap 후 mock user profile 구독 대신 Spring member profile + local adjunct로 auth state를 구성한다.
- `permissionsComplete`는 user id 기준 AsyncStorage local adjunct로 저장해 앱 재시작 후에도 유지되게 했다.
- `finalizeGoogleSignIn()` / auth bootstrap 경로에서 `createInitialUserProfile()` / `syncLoginMetadata()` 의존을 제거했다.
- backend 계약에 닉네임 중복 검사가 없음을 확인했고, frontend pre-check를 제거했다.
- 기존 사용자 업그레이드 시 `PermissionOnboarding`이 1회 다시 열릴 수 있는 known caveat는 현재 허용된 상태이며, Phase C 이상의 blocker로 보지 않는다.

완료 기준:

- 앱 재시작/재로그인 후 보호 API 호출이 일관되게 성공한다.
- `CompleteProfile` 제출값이 Spring member API에 저장된다.
- local adjunct가 생성된 사용자 기준으로는 앱 재시작 후에도 `CompleteProfile` / `PermissionOnboarding` 진입 여부가 mock 기본값 때문에 다시 열리지 않는다.
- 기존 사용자 업그레이드 시 `PermissionOnboarding`이 1회 다시 열릴 수 있는 known caveat는 현재 허용된 상태다.
- auth 진입 가드가 member profile + 지속 가능한 onboarding 상태를 기준으로 동작한다.

### Phase C. 최근 entrypoint 3종 먼저 교체

대상:

- App Notice screen
- Notification Center
- Taxi Home

이유:

- 이미 hook -> repository entrypoint 구조가 정리되어 있으므로
  hook 변경 없이 구현체 교체만으로 가장 빠르게 전환 가능하다.
- 현재는 Phase B 후속 정리가 완료됐으므로 바로 시작할 수 있다.

작업:

- `appNoticeScreenRepository.ts`를 `SpringAppNoticeScreenRepository`로 교체
- `notificationCenterRepository.ts`를 `SpringNotificationCenterRepository`로 교체
- `taxiHomeRepository.ts`를 `SpringTaxiHomeRepository`로 교체
- 가능하면 같은 작업에서 `RepositoryProvider` 경계로 흡수하거나,
  최소한 중앙 DI로 이동할 수 있는 형태의 adapter로 축소

주의:

- 이 단계의 목적은 빠른 실서버 연결이지만,
  새로운 local singleton 구조를 더 늘리는 방식으로 진행하지 않는다.
- 가능하면 “entrypoint swap”과 “중앙 DI 수렴”을 함께 처리한다.
- 불가피하게 임시 entrypoint를 유지한 경우, 후속 Phase G에서 제거 대상으로 남긴다.

완료 기준:

- App Notice 목록/상세가 실제 Spring API를 사용한다.
- Notification Center 목록/읽음 처리 UI가 실제 Spring API를 사용한다.
- Taxi Home 목록/동승 요청/수락 대기 화면/파티 채팅 진입이 Spring 기준으로 이어진다.

2026-03-19 진행 반영:

- `SpringAppNoticeRepository`를 추가했고 `RepositoryProvider`의 `appNoticeRepository` 기본 구현을 Spring으로 교체했다.
- `useAppNoticeFeedData()` / `useAppNoticeDetailData()`는 feature-local entrypoint를 제거하고 중앙 DI `appNoticeRepository` + assembler 조합으로 재구성했다.
- `SpringNotificationRepository`를 추가했고 `RepositoryProvider`의 `notificationRepository` 기본 구현을 Spring으로 교체했다.
- `useNotificationCenterData()`는 feature-local entrypoint를 제거하고 중앙 DI `notificationRepository` 기준으로 목록/읽음 처리 UI를 구성한다.
- backend notification enum은 repository mapper에서 기존 RN navigation이 소비하는 canonical lower-snake 문자열로 정규화했다.
- Taxi Home은 `loadTaxiHomeQueryResult()` query가 `GET /v1/parties` / `GET /v1/members/me/parties`를 직접 호출하도록 옮겼고, 기존 `taxiHomeRepository.ts` entrypoint는 제거했다.
- `notice_post_like`는 알림함 icon/탭 이동에서 notice detail dead path가 나지 않도록 navigation/assembler를 정리했다.
- `SpringAppNoticeRepository`의 상세 404는 공통 API error mapper가 반환하는 `RepositoryError(NOT_FOUND)` 기준으로 null 처리하게 맞췄다.
- Taxi Home은 `GET /v1/members/me/join-requests`까지 묶어 개인 상태를 읽고, `NETWORK_ERROR` / `TIMEOUT` / `RATE_LIMITED`만 read-only fallback으로 허용한다.
- Taxi Home의 join request 생성은 `POST /v1/parties/{partyId}/join-requests`, AcceptancePending 조회/취소는 `GET /v1/members/me/join-requests` / `GET /v1/parties/{id}` / `PATCH /v1/join-requests/{id}/cancel`로 연결했다.
- AcceptancePending 전용 mock singleton repository는 제거했고, Taxi Home screen chain은 query/application adapter 기준으로 닫았다.
- Taxi Home의 floating CTA / joined action은 실제 `Chat` route 진입으로 연결했지만, chat detail 데이터 소스 자체의 Spring 이전은 Phase F 범위로 남아 있다.

### Phase D. Notification 도메인 정식 이전

목표:

- Firestore 기반 알림 인박스/미읽음 수를 Spring REST + SSE로 대체

작업:

- `INotificationRepository` 계열 Spring 구현 추가
- 인앱 알림 배지 / 읽음 처리 / 삭제 / 전체 읽음 처리 전환
- `GET /v1/sse/notifications` 기반 실시간 unread count 동기화

문서 기준:

- `rn-notification-migration-reference.md`

완료 기준:

- 알림 목록과 unread count가 Firestore 없이 동작한다.
- push payload는 canonical enum 기준으로만 해석한다.

### Phase E. Taxi Party 정식 이전

목표:

- 파티/동승요청/내 파티/정산/상태 전이를 Spring API로 이관

작업:

- `IPartyRepository` Spring 구현 추가
- Party REST + SSE 연결
- 기존 클라이언트 서비스에 남은 서버 판단 로직 축소
  - join request 처리
  - 상태 전이
  - 리더 권한 판단
  - 정산 진행 판단

완료 기준:

- 파티 생성 → 요청 → 수락/거절 → 상태 변경 → 정산 플로우가 Spring 기준으로 동작한다.

### Phase F. Chat 정식 이전

목표:

- 채팅방 목록/상세/메시지 송수신을 REST + STOMP 구조로 전환

작업:

- `IChatRepository` Spring 구현 추가
- 이력 조회는 REST
- 메시지 송수신은 STOMP
- `/user/queue/errors` 처리 추가
- party chat room id(`party:{partyId}`) 처리 일관화

완료 기준:

- 공개 채팅과 파티 채팅 모두 같은 STOMP transport로 동작한다.

### Phase G. 남은 mock 화면 체인 정리

대표 대상:

- Notice home/detail
- Board detail
- Community home
- Campus detail/home
- Taxi recruit
- Taxi chat detail
- Chat detail

작업:

- direct mock import 제거
- touched feature를 전역 DI 기준으로 수렴
- 화면 조합 로직은 Query/Assembler/Facade로 재배치

권장 정책:

- 도메인 핵심 데이터는 `RepositoryProvider` 경로로 통일한다.
- 복잡한 화면 조합은 Query/Assembler/Facade로 분리하고, 가능하면 중앙집중식으로 등록한다.
- feature-local entrypoint는 임시 단계에서만 허용하고 최종 상태로 두지 않는다.

### Phase H. 정리/수렴

작업:

- Firestore 직접 CRUD 제거
- Cloud Functions 전제 client 분기 제거
- mock 전용 repository 남용 정리
- 문서와 실제 RN 구조 동기화

완료 기준:

- Firebase는 Auth + FCM 중심으로만 남고
- 앱의 도메인 데이터 접근은 Spring으로 수렴한다.

---

## 6. 이전 계획 대비 수정된 점

### 6.1 변경된 점

이전에는 다음 3개 화면이 “hook 내부에서 mock 구조를 직접 안다”고 판단했다.

- App Notice screen
- Notification Center
- Taxi Home

현재는 위 3개가 모두 “hook -> repository entrypoint” 구조로 정리되었으므로,
이 세 영역은 hook 리팩터링보다 구현체 교체가 우선이다.

### 6.2 변경되지 않은 점

아래 큰 방향은 그대로 유지된다.

- 공통 transport를 먼저 만든다.
- Firebase Auth는 유지하고, Spring은 Firebase ID Token을 검증한다.
- Notification은 REST + SSE로 간다.
- Chat은 REST + STOMP로 간다.
- 최종적으로는 mock/direct Firebase 경로를 정리해야 한다.

### 6.3 새로 추가된 판단

현재 앱은 아래 두 구조가 동시에 존재한다.

- 전역 DI RepositoryProvider
- feature-local repository entrypoint

따라서 앞으로의 로드맵에는
“실서버 연결”과
“주입 구조 통일”
두 작업을 분리해서 보되,
최종 구조 기준은 별도 아키텍처 문서(`frontend-architecture-guideline.md`)로 고정한다.

즉:

- 단기 목표: 서버 연결 성공
- 중기 목표: 주입 구조 일관화

### 6.4 실행 해석 고정

위 두 목표는 순차 분리가 아니라 결합해서 해석한다.

- Phase A: 공통 infra를 먼저 깐다.
- Phase B 이후: feature 하나를 옮길 때 서버 연결과 중앙화 수렴을 같은 작업 단위로 묶는다.
- 따라서 “모든 DI 통일 후 마이그레이션”도 아니고,
  “구조는 그대로 둔 채 연결만 진행”도 아니다.
- 공식 작업 전략은 “migrate-as-you-centralize”다.

---

## 7. 권장 파일 작업 순서

1. `src/shared/api/*`
2. `src/shared/realtime/*`
3. 인증 bootstrap 관련 훅/서비스
4. `appNoticeScreenRepository.ts`
5. `notificationCenterRepository.ts`
6. `taxiHomeRepository.ts`
7. `RepositoryProvider.tsx`
8. Notification / Taxi / Chat Spring 구현체
9. Query/Assembler/Facade 정리
10. 남아 있는 mock entrypoint 제거

### 7.1 에이전트 작업 규칙

다른 AI 에이전트 또는 후속 구현자는 아래 규칙을 따른다.

- 공통 transport 작업을 전역 DI 전면 개편 대기 상태로 두지 않는다.
- Spring API를 붙이는 feature는 같은 변경에서 DI 수렴까지 시도한다.
- 새로운 local singleton repository를 추가하지 않는다.
- hook이 mock/Firebase/Spring transport를 직접 import하는 새 경로를 만들지 않는다.
- repository가 화면 문구나 badge tone 같은 표현 데이터를 반환하게 만들지 않는다.
- 화면 조합이 복잡하면 Query/Assembler/Facade를 추가한다.

---

## 8. 완료 체크리스트

- [ ] hook이 mock 클래스를 직접 import하지 않는다.
- [x] 보호 API가 Firebase ID Token Bearer 인증으로 동작한다.
- [x] `POST /v1/members` bootstrap이 앱 시작 흐름에 포함된다.
- [x] `GET /v1/members/me` bootstrap이 앱 시작 흐름에 포함된다.
- [x] FCM token 등록/삭제가 Spring API를 사용한다.
- [ ] Notification inbox가 Spring REST + SSE로 동작한다.
- [ ] Taxi home/party/join-request가 Spring REST + SSE로 동작한다.
- [ ] Chat이 REST + STOMP로 동작한다.
- [ ] 이미지 업로드가 `/v1/images`를 사용한다.
- [ ] `docs/spring-migration` 문서가 실제 RN 구조와 모순되지 않는다.
