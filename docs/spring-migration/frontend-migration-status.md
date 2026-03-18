# RN Spring 연동 진행 현황

> 최종 수정일: 2026-03-18
> 관련 문서: [RN Spring 연동 아키텍처 가이드](./frontend-architecture-guideline.md) | [RN Spring 연동 로드맵](./frontend-integration-roadmap.md) | [Codex Phase Handoff Prompts](./codex-phase-handoff-prompts.md)

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
- 실제 Spring API를 사용하는 concrete repository 구현은 아직 시작 전
- 전역 DI와 feature-local entrypoint의 혼재는 아직 남아 있음
- 공식 작업 전략은 `migrate-as-you-centralize`

즉, 현재 상태는 다음과 같이 요약할 수 있다.

- 공통 infra는 준비되었고
- 이제부터는 feature별로 Spring 연결과 중앙화 수렴을 함께 진행하면 된다.

---

## 3. Phase 진행 현황

| Phase | 상태 | 비고 |
|------|------|------|
| Phase A. 공통 Transport 구축 | 진행 완료(1차) | 공통 API/실시간 레이어 및 전역 token resolver 추가 |
| Phase B. 인증/회원 bootstrap 정리 | 미시작 | `POST /v1/members` / `GET /v1/members/me` 부트스트랩 연결 필요 |
| Phase C. App Notice / Notification Center / Taxi Home | 미시작 | 추천 첫 concrete migration 대상 |
| Phase D. Notification 정식 이전 | 미시작 | REST + SSE 전환 필요 |
| Phase E. Taxi Party 정식 이전 | 미시작 | REST + SSE 전환 필요 |
| Phase F. Chat 정식 이전 | 미시작 | REST + STOMP 전환 필요 |
| Phase G. 남은 mock 화면 체인 정리 | 미시작 | feature-local 임시 경로 수렴 필요 |
| Phase H. 정리/수렴 | 미시작 | Firestore direct path와 legacy 분기 제거 |

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
- 로그인 직후 Spring member bootstrap

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

---

## 6. 다음 우선순위

현재 시점에서 가장 자연스러운 다음 단계는 아래 순서다.

1. Phase B
   - 로그인 후 Spring bootstrap 고정
   - `POST /v1/members`
   - `GET /v1/members/me`
   - 보호 API 호출 흐름 안정화
2. Phase C
   - App Notice
   - Notification Center
   - Taxi Home
3. Phase D 이후
   - Notification
   - Taxi Party
   - Chat

이 순서를 권장하는 이유:

- Phase A 기반을 가장 빨리 검증할 수 있다.
- 현재 구조상 entrypoint가 정리된 3개 화면이 가장 빠른 승리 지점이다.
- 이 3개를 옮기면서 중앙 DI 수렴 패턴도 같이 확정할 수 있다.

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

### 8.1 타입체크

`npx tsc --noEmit`는 현재 프로젝트의 기존 선행 오류들 때문에 전체 성공하지 않는다.

이번 작업과 직접 무관한 기존 오류 영역:

- `firebase-cloud-functions/*`
- 일부 `board/*`
- 일부 `taxi/testing/*`
- 일부 `user/model/*`

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
- 다음 작업은 Phase B 또는 Phase C부터 시작
