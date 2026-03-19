# RN Spring 연동 진행 현황

> 최종 수정일: 2026-03-19
> 관련 문서: [RN Spring 연동 아키텍처 가이드](./frontend-architecture-guideline.md) | [RN Spring 연동 로드맵](./frontend-integration-roadmap.md) | [API 명세](./api-specification.md) | [Codex Phase Handoff Prompts](./codex-phase-handoff-prompts.md)

---

## 1. 문서 목적

이 문서는 React Native 프론트의 Spring 마이그레이션 작업이
현재 어디까지 진행되었는지 기록하는 상태 문서다.

이 문서는 다음 목적을 가진다.

- 현재 완료된 phase와 미완료 phase를 빠르게 파악
- 다음 Codex 스레드가 어디서부터 이어야 하는지 즉시 판단
- 이미 합의된 아키텍처/실행 규칙을 다시 뒤흔들지 않도록 기준 고정

---

## 2. 현재 기준 결론

- 최종 구조 기준 문서는 작성 완료
- 실행 로드맵 문서는 작성 완료
- Phase A 공통 transport 기반 구축은 1차 완료
- auth/member 경로의 Spring concrete repository는 CompleteProfile/guard 정리까지 연결 완료
- App Notice / Notification Center는 Spring API + 중앙 DI 기준으로 전환 완료
- Taxi Home은 Spring REST query + join request/pending/chat entry 범위까지 연결 완료
- 전역 DI와 feature-local entrypoint의 혼재는 줄었고, Taxi Home screen chain의 mock singleton도 제거됨
- 공식 작업 전략은 `migrate-as-you-centralize`

즉, 현재 상태는 다음과 같이 요약할 수 있다.

- 공통 infra는 준비되었고
- auth/bootstrap, CompleteProfile, FCM token 경로는 Spring 기준으로 고정됐고
- auth 진입선의 프로필/온보딩 source of truth도 member profile + local adjunct 기준으로 정리됐다.
- 이제 App Notice / Notification Center는 실서버 기준으로 동작하고,
- Taxi Home도 목록/개인 상태 조회, 동승 요청 생성/취소, 수락 대기 화면, 실제 파티 채팅 진입까지 Spring 기준으로 정리됐다.

---

## 3. Phase 진행 현황

| Phase                                                 | 상태           | 비고                                                |
| ----------------------------------------------------- | -------------- | --------------------------------------------------- |
| Phase A. 공통 Transport 구축                          | 진행 완료(1차) | 공통 API/실시간 레이어 및 전역 token resolver 추가  |
| Phase B. 인증/회원 bootstrap 정리                     | 완료           | CompleteProfile/guard/source-of-truth 정리까지 완료 |
| Phase C. App Notice / Notification Center / Taxi Home | 완료           | App Notice/Notification Center/Taxi Home screen chain 완료 |
| Phase D. Notification 정식 이전                       | 미시작         | REST + SSE 전환 필요                                |
| Phase E. Taxi Party 정식 이전                         | 미시작         | REST + SSE 전환 필요                                |
| Phase F. Chat 정식 이전                               | 미시작         | REST + STOMP 전환 필요                              |
| Phase G. 남은 mock 화면 체인 정리                     | 미시작         | feature-local 임시 경로 수렴 필요                   |
| Phase H. 정리/수렴                                    | 미시작         | Firestore direct path와 legacy 분기 제거            |

---

## 4. 이번까지 완료된 작업

### 4.1 아키텍처/로드맵 문서화

다음 문서를 추가하거나 갱신했다.

- `docs/spring-migration/frontend-architecture-guideline.md`
- `docs/spring-migration/frontend-integration-roadmap.md`
- `docs/spring-migration/implementation-roadmap.md`

핵심으로 고정된 규칙:

- Repository는 도메인 경계로 유지한다.
- 화면 조합은 Query/Assembler/Facade로 분리한다.
- 전역 DI가 최종 목표다.
- 하지만 전면 선리팩터링은 하지 않는다.
- 공통 infra는 먼저 진행하고, feature migration은 중앙화와 함께 진행한다.

### 4.2 Phase A 구현

다음 공통 파일을 추가했다.

- `src/shared/api/apiConfig.ts`
- `src/shared/api/authTokenProvider.ts`
- `src/shared/api/apiErrorMapper.ts`
- `src/shared/api/httpClient.ts`
- `src/shared/api/index.ts`
- `src/shared/realtime/sseClient.ts`
- `src/shared/realtime/chatSocketClient.ts`
- `src/shared/realtime/index.ts`

인증 훅에는 다음 연결을 추가했다.

- `src/features/auth/hooks/useAuthSession.ts`
  - `authRepository.refreshToken()`을 전역 auth token resolver에 등록

### 4.3 Phase A 결과

현재 가능한 것:

- 공통 REST base URL/timeout/config 관리
- Bearer token 자동 주입 가능한 HTTP client 사용
- SSE 연결에 필요한 URL/헤더/options 준비
- STOMP CONNECT에 필요한 URL/헤더/options 준비
- Spring repository 구현 시 공통 transport 재사용 가능

현재 아직 남은 것:

- concrete Spring repository 구현
- 실제 SSE 클라이언트 구현체 선택 및 연결
- 실제 STOMP 라이브러리 연결

### 4.4 Phase B 구현

다음 auth/member 경로를 추가하거나 갱신했다.

- `src/features/member/data/api/memberApiClient.ts`
- `src/features/member/data/dto/memberDto.ts`
- `src/features/member/data/dto/updateMemberProfileDto.ts`
- `src/features/member/data/mappers/memberMapper.ts`
- `src/features/member/data/repositories/IMemberRepository.ts`
- `src/features/member/data/repositories/SpringMemberRepository.ts`
- `src/features/member/model/types.ts`
- `src/features/member/services/memberFcmTokenService.ts`
- `src/features/member/index.ts`
- `src/di/RepositoryContext.ts`
- `src/di/RepositoryProvider.tsx`
- `src/di/repositoryContracts.ts`
- `src/di/useRepository.ts`
- `src/features/auth/services/authSessionService.ts`
- `src/features/auth/services/authLocalAdjunctService.ts`
- `src/features/auth/hooks/useAuthSession.ts`
- `src/app/bootstrap/registerPushHandlers.ts`
- `src/features/auth/services/permissionOnboardingService.ts`
- `src/features/auth/hooks/usePermissionOnboarding.ts`
- `src/features/auth/services/profileCompletionService.ts`
- `src/features/auth/hooks/useCompleteProfile.ts`
- `src/features/user/data/repositories/IUserRepository.ts`
- `src/features/user/data/repositories/FirebaseUserRepository.ts`

핵심 변경:

- Spring member API client/repository를 공통 transport 위에 추가
- `memberRepository`를 전역 DI에 등록
- `useAuthSession()`에서 인증 사용자 감지 시 아래 bootstrap 순서를 고정
  1. Firebase 로그인 상태 확인
  2. Firebase ID Token 확보
  3. `POST /v1/members`
  4. `GET /v1/members/me`
- `signInWithGoogle()` / `signInWithEmailAndPassword()`는 auth session 준비가 끝날 때까지 대기
- bootstrap 실패 시 half-authenticated 상태로 진행하지 않고 세션을 정리
- 앱 런타임 토큰 등록/refresh/로그아웃 토큰 해제를 모두 `/v1/members/me/fcm-tokens`로 전환
- `IUserRepository`의 Firebase FCM token 저장 메서드를 제거해 direct Firebase 저장 경로를 정리
- `CompleteProfileScreen` 저장 경로를 `PATCH /v1/members/me`로 이전
- auth state의 핵심 프로필 source of truth를 mock user profile 구독이 아니라 Spring member profile + local adjunct 기준으로 전환
- `permissionsComplete`를 AsyncStorage 기반 local adjunct로 영속화해 앱 재시작 후에도 유지되게 정리
- `finalizeGoogleSignIn()` / auth bootstrap 경로에서 `createInitialUserProfile()` / `syncLoginMetadata()` 의존을 제거
- backend 계약에 닉네임 중복 검사가 없음을 확인하고 CompleteProfile의 frontend pre-check를 제거

### 4.5 Phase B 결과

현재 가능한 것:

- 앱 재시작 시 기존 Firebase 세션이 있으면 Spring member bootstrap을 먼저 수행
- 신규 로그인 시 login function이 member bootstrap 완료 전에는 성공으로 반환되지 않음
- `CompleteProfileScreen` 제출값이 `PATCH /v1/members/me`로 저장됨
- `useAuthSession()`은 mock `userRepository.subscribeToUserProfile()` 없이 auth state를 구성함
- auth state `user`는 Spring member profile + local adjunct(`permissionsComplete`)를 source of truth로 사용함
- `PermissionOnboarding` 완료 상태가 user id 기준 local adjunct에 저장되어 앱 재시작 후에도 유지됨
- FCM token 등록/refresh/삭제가 member repository 경유로 Spring API를 호출함
- hook/screen에 서버 DTO를 직접 노출하지 않고 auth/member는 repository 경계만 참조함

Phase B 완료 판단 근거:

- `useAuthSession()`은 [useAuthSession.ts](/Users/jisung/SKTaxi/src/features/auth/hooks/useAuthSession.ts#L177)에서 member bootstrap 후 `GET /v1/members/me` 응답과 local adjunct를 합쳐 auth state를 만든다.
- `useAuthEntryGuard()`는 [useAuthEntryGuard.ts](/Users/jisung/SKTaxi/src/app/guards/useAuthEntryGuard.ts#L11)에서 이 auth state만 읽고 `CompleteProfile` / `PermissionOnboarding` 진입 여부를 결정한다.
- `permissionsComplete`는 [authLocalAdjunctService.ts](/Users/jisung/SKTaxi/src/features/auth/services/authLocalAdjunctService.ts#L1)에서 user id 기준 AsyncStorage에 저장되므로 mock in-memory 기본값으로 되돌아가지 않는다.
- `CompleteProfile` 제출 시 [profileCompletionService.ts](/Users/jisung/SKTaxi/src/features/auth/services/profileCompletionService.ts#L27)에서 member repository의 `updateMyProfile()`만 호출하고, frontend 닉네임 중복 pre-check는 수행하지 않는다.

### 4.6 Phase C 구현

다음 feature를 Spring API 기준으로 연결했다.

- App Notice
  - `src/features/settings/data/api/appNoticeApiClient.ts`
  - `src/features/settings/data/dto/appNoticeDto.ts`
  - `src/features/settings/data/mappers/appNoticeMapper.ts`
  - `src/features/settings/data/repositories/SpringAppNoticeRepository.ts`
  - `src/features/settings/application/appNoticeViewAssembler.ts`
  - `src/features/settings/hooks/useAppNoticeFeedData.ts`
  - `src/features/settings/hooks/useAppNoticeDetailData.ts`
- Notification Center
  - `src/features/user/data/api/notificationApiClient.ts`
  - `src/features/user/data/dto/notificationDto.ts`
  - `src/features/user/data/mappers/notificationMapper.ts`
  - `src/features/user/data/repositories/SpringNotificationRepository.ts`
  - `src/features/user/application/notificationCenterAssembler.ts`
  - `src/features/user/hooks/useNotificationCenterData.ts`
- Taxi Home
  - `src/features/taxi/data/api/taxiHomeApiClient.ts`
  - `src/features/taxi/data/dto/taxiHomeDto.ts`
  - `src/features/taxi/application/taxiHomeQuery.ts`
  - `src/features/taxi/application/taxiAcceptancePendingQuery.ts`
  - `src/features/taxi/hooks/useTaxiHomeData.ts`
  - `src/features/taxi/hooks/useTaxiAcceptancePendingData.ts`
  - `src/features/taxi/screens/TaxiScreen.tsx`
  - `src/features/taxi/screens/AcceptancePendingScreen.tsx`

이번 단계에서 실제로 사용한 API contract:

- App Notice
  - `GET /v1/app-notices`
  - `GET /v1/app-notices/{appNoticeId}`
- Notification Center
  - `GET /v1/notifications`
  - `POST /v1/notifications/{notificationId}/read`
  - `POST /v1/notifications/read-all`
  - `DELETE /v1/notifications/{notificationId}`
- Taxi Home
  - `GET /v1/parties?status=OPEN&size=50&sort=createdAt,desc`
  - `GET /v1/members/me/parties`
  - `GET /v1/members/me/join-requests?status=PENDING`
  - `GET /v1/members/me/join-requests`
  - `GET /v1/parties/{id}`
  - `POST /v1/parties/{partyId}/join-requests`
  - `PATCH /v1/join-requests/{id}/cancel`

계약 확인 결과:

- 로컬 `http://localhost:8080/v3/api-docs`는 이번 작업 시점에 응답을 주지 않아 최종 구현은 `/Users/jisung/skuri-backend` controller/dto와 markdown 명세를 기준으로 맞췄다.
- App Notice는 backend 응답에 작성자/조회수 필드가 없어서 assembler에서 화면 전용 placeholder/optional 값으로 흡수했다.
- Notification enum은 backend canonical enum을 repository mapper에서 기존 app navigation이 소비하는 문자열로 정규화했다.
- Notification의 `POST_LIKED + noticeId`는 `notice_post_like`로 유지하되 알림함 icon/탭 이동에서 notice detail dead path가 되지 않게 정리했다.
- SpringAppNoticeRepository의 상세 404는 공통 API mapper가 반환하는 `RepositoryError(NOT_FOUND)` 기준으로 null 처리한다.
- Taxi Home card에 필요한 예상 요금/참여자 아바타/요청 상태 일부는 현재 backend summary에 없어서 query layer에서 fallback 값으로 조합했다.
- Taxi Home의 `getMyParties()` / `getMyJoinRequests()`는 개인 상태 조회로 묶고, `NETWORK_ERROR` / `TIMEOUT` / `RATE_LIMITED`만 read-only fallback, 인증/권한/계약 오류는 화면 에러로 올린다.

### 4.7 Phase C 결과

현재 가능한 것:

- `RepositoryProvider`의 `appNoticeRepository` 기본 구현은 `SpringAppNoticeRepository`다.
- `RepositoryProvider`의 `notificationRepository` 기본 구현은 `SpringNotificationRepository`다.
- App Notice 목록/상세 hook은 feature-local entrypoint 없이 중앙 DI의 `appNoticeRepository`를 직접 사용한다.
- Notification Center hook은 feature-local entrypoint 없이 중앙 DI의 `notificationRepository`를 직접 사용한다.
- Notification Center 읽음 처리/전체 읽음 처리/단건 삭제는 Spring REST를 호출한다.
- Taxi Home은 feature-local repository entrypoint 없이 `loadTaxiHomeQueryResult()` query를 통해 실제 파티 목록, 내 활성 파티, 내 pending join request 상태를 읽는다.
- Taxi Home의 동승 요청 생성은 `POST /v1/parties/{partyId}/join-requests`로 연결되고, 중복 요청(`ALREADY_REQUESTED`)은 pending request 재조회로 복구한다.
- Taxi Home 플로팅 파티 채팅 버튼과 joined card action은 `GET /v1/members/me/parties` 결과의 active party id를 기준으로 실제 `Chat` route로 이동한다.
- AcceptancePending은 `loadTaxiAcceptancePendingSource()` query가 `GET /v1/members/me/join-requests` + `GET /v1/parties/{id}`를 조합해 상태를 읽고, 취소는 `PATCH /v1/join-requests/{id}/cancel`로 처리한다.

현재 아직 남은 것:

- Notification의 SSE 실시간 동기화는 Phase D 범위다.
- `IPartyRepository` 전체 Spring 구현 및 전역 DI 교체는 아직 하지 않았다.
- Taxi chat detail 자체의 데이터 소스는 아직 mock adapter이며, chat REST/STOMP 이전은 Phase F 범위다.

feature별 상태:

- 완료
  - App Notice
  - Notification Center
  - Taxi Home
- 미완료
  - 없음

---

## 5. 현재 남아 있는 구조 상태

현재 앱은 여전히 아래 두 구조가 혼재한다.

- 전역 DI (`RepositoryProvider`, `RepositoryContext`, `useRepository`)
- feature-local repository entrypoint

이 혼재 상태는 아직 정상 범위다.
현재 공식 전략은 다음과 같다.

- Phase A는 이 혼재 상태와 무관하게 먼저 진행
- Phase B 이후 concrete feature migration 시
  해당 feature를 전역 DI 기준으로 함께 수렴

즉, 다음 작업자는 앱 전체를 먼저 전면 리팩터링하지 않는다.

Phase C 반영 후 구조 상태:

- App Notice의 screen entrypoint는 제거됐고 중앙 DI `appNoticeRepository`로 수렴했다.
- Notification Center의 screen entrypoint는 제거됐고 중앙 DI `notificationRepository`로 수렴했다.
- Taxi Home/AcceptancePending screen chain은 `shared/api` 위의 query/application adapter로 수렴했고, `ITaxiAcceptancePendingRepository` mock singleton은 제거됐다.
- 다만 Taxi domain 전체의 최종 도메인 경계 수렴은 Phase E의 `IPartyRepository` Spring 구현과 Phase F의 chat 이전까지 남아 있다.

---

## 6. 다음 우선순위

현재 시점에서 가장 자연스러운 다음 단계는 아래 순서다.

1. Phase D 이후
   - Notification
   - Taxi Party
   - Chat

이 순서를 권장하는 이유:

- auth 진입선의 프로필/온보딩 source of truth가 정리됐으므로, 이제 Phase A/B 기반 위에서 concrete feature migration을 안정적으로 진행할 수 있다.
- App Notice / Notification Center / Taxi Home screen chain이 닫혔으므로, 다음부터는 SSE/STOMP와 도메인 repository 수렴 같은 정식 이전 phase를 진행하면 된다.

---

## 7. 다음 작업자가 반드시 지켜야 할 규칙

- 먼저 앱 전체 DI를 한 번에 뒤집으려 하지 않는다.
- 공통 transport를 우회하는 새로운 HTTP/SSE/STOMP 코드를 만들지 않는다.
- 새 feature-local singleton repository를 추가하지 않는다.
- Spring API를 붙이는 feature는 같은 작업에서 중앙 DI 수렴까지 시도한다.
- 서버 DTO를 hook/screen으로 직접 올리지 않는다.
- touched feature에서 direct mock import가 남아 있으면 같이 제거한다.
- phase는 작업 단위로 진행하되, 커밋은 phase 전체를 한 번에 묶지 않는다.
- 커밋은 리뷰 가능한 작은 단위로 분리한다.
- 기능 추가, 리팩터링, 테스트, 문서 수정은 가능한 분리 커밋으로 나눈다.
- 런타임 코드와 문서 변경은 가능하면 별도 커밋으로 분리한다.
- 커밋 메시지는 Conventional Commits를 사용하고, 타입은 영어, 나머지 메시지는 한국어로 작성한다.
- 작업 후 이 상태 문서와 로드맵 문서를 함께 갱신한다.

---

## 8. 현재 알려진 주의사항

### 8.0 API 계약 참조 소스

다음 작업자는 실제 API 호출 구현 전에 아래 순서로 계약을 확인한다.

1. 로컬 백엔드 `/v3/api-docs`
   - 예: `http://localhost:8080/v3/api-docs`
2. 백엔드 코드
   - 경로: `/Users/jisung/skuri-backend`
3. markdown 명세
   - `docs/spring-migration/api-specification.md`

충돌 시 우선순위:

- `/v3/api-docs`
- 백엔드 코드
- markdown 명세

즉, handoff 문서나 로드맵 문서만 보고 endpoint를 추측해서 구현하지 않는다.

### 8.0.1 허용된 known caveat

- 기존 사용자 업그레이드 시 `PermissionOnboarding`이 1회 다시 열릴 수 있다.
- 이는 Firestore 기반 과거 온보딩 상태를 AsyncStorage local adjunct로 일괄 backfill하지 않은 현재 구조에서 발생 가능한 현상이다.
- 현재 제품 판단상 허용된 상태이며, 이 사유만으로 Phase C 이상 작업을 막지 않는다.

### 8.1 타입체크

`npx tsc --noEmit`는 현재 프로젝트의 기존 선행 오류들 때문에 전체 성공하지 않는다.

현재 확인된 기존 선행 오류 영역:

- `firebase-cloud-functions/src/index.ts`

따라서 다음 작업자는 다음 원칙으로 검증한다.

- 변경한 파일 기준 타입 오류가 없는지 우선 확인
- 전체 타입 오류는 기존 오류와 신규 오류를 분리해서 판단

### 8.2 실시간 라이브러리 선택

현재 `src/shared/realtime/*`는 공통 connection option builder까지 구현된 상태다.

즉:

- SSE는 아직 concrete client 라이브러리를 실제 연결하지 않았다.
- STOMP도 아직 concrete 라이브러리를 실제 연결하지 않았다.

다음 작업자는 concrete feature migration 시
현재 공통 옵션 레이어를 재사용하는 방향으로 실제 라이브러리를 연결하면 된다.

---

## 9. 한 줄 상태 요약

- 아키텍처 기준 수립 완료
- 실행 로드맵 수립 완료
- Phase A 1차 완료
- Phase B 후속 정리 완료
- Phase C는 App Notice / Notification Center / Taxi Home 완료 상태
