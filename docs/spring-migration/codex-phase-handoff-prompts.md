# Codex Phase Handoff Prompts

> 최종 수정일: 2026-03-18
> 관련 문서: [RN Spring 연동 진행 현황](./frontend-migration-status.md) | [RN Spring 연동 아키텍처 가이드](./frontend-architecture-guideline.md) | [RN Spring 연동 로드맵](./frontend-integration-roadmap.md) | [API 명세](./api-specification.md)

---

## 1. 사용 방법

새 Codex 스레드에서 아래 프롬프트를 복사해 사용한다.

공통 원칙:

- 먼저 관련 문서를 읽고 시작한다.
- 목표 phase만 처리한다.
- 작업 중 합의된 아키텍처를 임의로 바꾸지 않는다.
- phase는 작업 단위로 보고, 커밋은 그 안에서 목적별 작은 단위로 분리한다.
- 작업 완료 후 상태 문서를 갱신한다.
- 실제 API 호출 구현 전에는 아래 순서로 계약을 확인한다.
  1. 로컬 백엔드 `/v3/api-docs`
  2. 백엔드 코드 `/Users/jisung/skuri-backend`
  3. `docs/spring-migration/api-specification.md`
- 충돌 시 우선순위는 `/v3/api-docs` > 백엔드 코드 > markdown 명세다.
- 표현/매핑 수준의 계약 차이는 프론트 mapper/query에서 흡수한다.
- 하지만 인증/인가, 상태 전이, 핵심 도메인 규칙, SSE/STOMP 계약 불일치는 프론트 workaround로 덮지 않는다.
- 이런 불일치를 발견하면 해당 feature 작업을 중단하고, 차이점/영향 범위/필요한 백엔드 변경안을 사용자에게 보고한다.

---

## 2. 공통 시작 프롬프트

```text
/Users/jisung/SKTaxi 프로젝트에서 React Native 프론트의 Spring 마이그레이션 작업을 이어서 진행해줘.

작업 시작 전에 반드시 아래 문서를 먼저 읽고, 그 기준을 준수해.
- /Users/jisung/SKTaxi/docs/spring-migration/frontend-migration-status.md
- /Users/jisung/SKTaxi/docs/spring-migration/frontend-architecture-guideline.md
- /Users/jisung/SKTaxi/docs/spring-migration/frontend-integration-roadmap.md
- /Users/jisung/SKTaxi/docs/spring-migration/api-specification.md

중요 규칙:
- 전역 DI가 최종 목표지만, 앱 전체를 먼저 전면 리팩터링하지는 마.
- 공통 infra는 이미 일부 준비되어 있으니 재사용해.
- 현재 공식 전략은 "migrate-as-you-centralize"다.
- Spring API를 붙이는 feature는 같은 작업 안에서 중앙집중식 DI로 함께 수렴시켜.
- 새로운 feature-local singleton repository 패턴을 추가하지 마.
- 서버 DTO를 hook/screen으로 직접 올리지 마.
- touched feature에 남아 있는 direct mock import는 같이 제거해.
- phase 전체를 한 커밋으로 묶지 마.
- 커밋은 리뷰 가능한 작은 단위로 분리해.
- 기능/리팩터링/테스트/문서는 가능한 별도 커밋으로 나눠.
- 런타임 코드와 문서 변경은 가능하면 별도 커밋으로 나눠.
- 커밋 메시지는 Conventional Commits를 사용하고, 타입은 영어, 나머지 메시지는 한국어로 써.
- 변경 후 docs/spring-migration/frontend-migration-status.md를 갱신해.
- 실제 API를 붙일 때는 먼저 localhost의 /v3/api-docs 또는 /Users/jisung/skuri-backend 코드를 확인해.
- 표현/매핑 수준 차이는 프론트에서 흡수할 수 있지만, 서버 진실 공급원 계약 불일치는 사용자에게 바로 보고해.

작업 후에는 아래 형식으로 보고해.
1. 이번 스레드에서 처리한 phase/범위
2. 변경 파일
3. 아직 남은 작업
4. 검증 결과
5. 다음 스레드가 이어야 할 시작점
```

---

## 3. Phase B 프롬프트

```text
/Users/jisung/SKTaxi 프로젝트에서 Spring 마이그레이션 Phase B를 진행해줘.

반드시 먼저 읽을 문서:
- /Users/jisung/SKTaxi/docs/spring-migration/frontend-migration-status.md
- /Users/jisung/SKTaxi/docs/spring-migration/frontend-architecture-guideline.md
- /Users/jisung/SKTaxi/docs/spring-migration/frontend-integration-roadmap.md
- /Users/jisung/SKTaxi/docs/spring-migration/api-specification.md

이번 스레드 목표:
- 로그인 직후 Spring 보호 API bootstrap 흐름을 안정화
- Firebase 로그인 후 아래 흐름을 프론트에서 고정
  1. Firebase 로그인
  2. Firebase ID Token 확보
  3. POST /v1/members
  4. GET /v1/members/me
- 필요하면 공통 transport를 재사용해 Member API client / Spring repository를 추가
- 기존 Auth 흐름과 충돌 없이 연결
- 실제 endpoint/DTO는 localhost의 /v3/api-docs 또는 /Users/jisung/skuri-backend 구현 기준으로 확인

중요 규칙:
- 앱 전체 DI 전면 리팩터링은 하지 마.
- touched auth/member 경로는 중앙 DI 기준에 맞게 정리해.
- 서버 DTO를 hook/screen에 직접 노출하지 마.
- 기존 mock/Firebase 경로와의 책임 분리를 명확히 해.
- 커밋은 목적별 작은 단위로 분리하고, Phase B 전체를 한 커밋으로 묶지 마.

검증:
- 로그인 이후 보호 API 호출 흐름이 어떻게 보장되는지 코드 기준으로 설명
- 변경 파일 기준 타입 오류 확인
- 상태 문서 갱신

작업 완료 후:
- 이번 Phase B에서 무엇을 끝냈는지
- 아직 남은 Phase B 작업이 있는지
- 다음 스레드가 Phase C로 넘어가도 되는지
를 명확히 적어줘.
```

---

## 4. Phase B 후속 프롬프트

```text
/Users/jisung/SKTaxi 프로젝트에서 Spring 마이그레이션 Phase B 후속 정리를 진행해줘.

반드시 먼저 읽을 문서:
- /Users/jisung/SKTaxi/docs/spring-migration/frontend-migration-status.md
- /Users/jisung/SKTaxi/docs/spring-migration/frontend-architecture-guideline.md
- /Users/jisung/SKTaxi/docs/spring-migration/frontend-integration-roadmap.md
- /Users/jisung/SKTaxi/docs/spring-migration/api-specification.md

이번 스레드 목표:
- CompleteProfile 저장 경로를 Spring member API로 이전
- auth 진입 가드의 핵심 프로필 source of truth를 mock user profile에서 member profile 기준으로 전환
- permission onboarding 상태를 재시작 후에도 유지되는 방식으로 정리
- auth/member bootstrap 경로에 남아 있는 mock user profile 의존을 제거하거나 local adjunct 책임으로 축소

반드시 확인할 현재 문제:
- useAuthSession.ts는 member bootstrap 후에도 userRepository.subscribeToUserProfile()를 auth state source of truth로 사용한다.
- MockUserRepository 기본 프로필은 studentId/department null, permissionsComplete false로 시작한다.
- 그래서 현재 구조를 그대로 두면 앱 재시작 후 CompleteProfile / PermissionOnboarding 가드가 다시 열릴 수 있다.

작업 원칙:
- CompleteProfile core 필드(nickname/displayName, studentId, department, photoUrl)는 memberRepository 경계로 붙여.
- permissionsComplete처럼 backend에 아직 없는 값은 local adjunct로 둘 수 있지만, mock in-memory state에만 두지는 마.
- 서버 DTO를 hook/screen으로 직접 올리지 마.
- 앱 전체 DI 전면 리팩터링은 하지 마.
- touched auth/member 경로는 중앙 DI 기준에 맞게 정리해.
- 실제 endpoint/DTO는 localhost의 /v3/api-docs 또는 /Users/jisung/skuri-backend 구현 기준으로 확인해.
- 닉네임 중복 정책이 backend 계약과 다르면 프론트 workaround로 덮지 말고 사용자에게 변경 요청안을 보고해.

검증:
- 앱 재시작 후에도 프로필 완성 여부와 permission onboarding 여부가 안정적으로 유지되는지 코드 기준으로 설명
- useAuthEntryGuard가 어떤 source of truth를 읽는지 설명
- 변경 파일 기준 타입 오류 확인
- 상태 문서 갱신

작업 완료 후:
- 이번 스레드에서 Phase B 후속 중 무엇을 끝냈는지
- 아직 남은 Phase B 필수 작업이 있는지
- 이제 Phase C로 넘어가도 되는지
를 명확히 적어줘.
```

---

## 5. Phase C 프롬프트

```text
/Users/jisung/SKTaxi 프로젝트에서 Spring 마이그레이션 Phase C를 진행해줘.

반드시 먼저 읽을 문서:
- /Users/jisung/SKTaxi/docs/spring-migration/frontend-migration-status.md
- /Users/jisung/SKTaxi/docs/spring-migration/frontend-architecture-guideline.md
- /Users/jisung/SKTaxi/docs/spring-migration/frontend-integration-roadmap.md
- /Users/jisung/SKTaxi/docs/spring-migration/api-specification.md

이번 스레드 목표:
- App Notice screen
- Notification Center
- Taxi Home
이 3개 중 현재 안전하게 진행 가능한 범위를 Spring API로 연결

시작 전 전제:
- frontend-migration-status.md에서 Phase B 후속 정리가 닫혔는지 먼저 확인해.
- Phase B 후속 정리가 남아 있으면 Phase C를 강행하지 말고 사용자에게 먼저 보고해.

작업 원칙:
- 기존 feature-local entrypoint를 그대로 두고 단순 구현체 swap만 하지 말고,
  가능하면 같은 작업에서 중앙 DI 경계로 흡수해.
- 화면 조합이 복잡하면 Repository가 아니라 Query/Assembler/Facade로 분리해.
- touched hook에서 direct mock import를 제거해.
- 새 공통 transport(shared/api, shared/realtime)를 재사용해.
- 커밋은 App Notice / Notification Center / Taxi Home 또는 문서/리팩터링 성격에 맞게 분리해.
- 실제 endpoint/DTO/enum은 localhost의 /v3/api-docs 또는 /Users/jisung/skuri-backend 구현 기준으로 확인해.

우선순위:
1. App Notice
2. Notification Center
3. Taxi Home

검증:
- 어떤 API contract를 사용했는지
- 어떤 feature가 중앙 DI로 수렴되었는지
- 어떤 feature는 아직 임시 adapter인지
- 변경 파일 기준 타입 오류
- 상태 문서 갱신

작업 완료 후 다음 스레드가 이어받기 쉽게
"완료/부분완료/미완료"를 feature별로 나눠 적어줘.
```

---

## 6. Phase D 프롬프트

```text
/Users/jisung/SKTaxi 프로젝트에서 Spring 마이그레이션 Phase D를 진행해줘.

반드시 먼저 읽을 문서:
- /Users/jisung/SKTaxi/docs/spring-migration/frontend-migration-status.md
- /Users/jisung/SKTaxi/docs/spring-migration/frontend-architecture-guideline.md
- /Users/jisung/SKTaxi/docs/spring-migration/frontend-integration-roadmap.md
- /Users/jisung/SKTaxi/docs/spring-migration/rn-notification-migration-reference.md
- /Users/jisung/SKTaxi/docs/spring-migration/api-specification.md

이번 스레드 목표:
- Notification 도메인을 Firestore에서 Spring REST + SSE로 이전
- unread count, read/unread, delete, read-all 흐름 반영

중요 규칙:
- Notification 관련 touched feature는 중앙 DI 기준으로 수렴시켜.
- SSE 연결은 shared/realtime을 기반으로 구현해.
- push payload 해석은 canonical enum 기준으로 맞춰.
- direct mock/Firebase import가 남아 있으면 같이 제거해.
- 커밋은 기능/리팩터링/문서를 가능한 분리해.
- 실제 endpoint/event payload는 localhost의 /v3/api-docs 또는 /Users/jisung/skuri-backend 구현 기준으로 확인해.

검증:
- unread count 동기화 방식
- SSE reconnect / snapshot 처리 방식
- 변경 파일 기준 타입 확인
- 상태 문서 갱신
```

---

## 7. Phase E 프롬프트

```text
/Users/jisung/SKTaxi 프로젝트에서 Spring 마이그레이션 Phase E를 진행해줘.

반드시 먼저 읽을 문서:
- /Users/jisung/SKTaxi/docs/spring-migration/frontend-migration-status.md
- /Users/jisung/SKTaxi/docs/spring-migration/frontend-architecture-guideline.md
- /Users/jisung/SKTaxi/docs/spring-migration/frontend-integration-roadmap.md
- /Users/jisung/SKTaxi/docs/spring-migration/api-specification.md

이번 스레드 목표:
- Taxi Party 도메인을 Spring REST + SSE로 이전
- IPartyRepository의 Spring 구현 추가
- create/update/join-request/my-party/state-transition 흐름 이전

중요 규칙:
- 서버가 최종 상태 판단을 한다는 원칙을 지켜.
- 클라이언트 서비스에 남아 있는 서버 판단 로직은 축소하거나 제거해.
- touched taxi feature는 중앙 DI 기준으로 수렴시켜.
- Taxi Home과 Party 도메인 read model이 섞이면 Query/Assembler로 분리해.
- 커밋은 리뷰 가능한 작은 단위로 나누고, 도메인이 섞이면 분리해.
- 실제 endpoint/DTO/event는 localhost의 /v3/api-docs 또는 /Users/jisung/skuri-backend 구현 기준으로 확인해.

검증:
- 어떤 클라이언트 로직이 서버 판단으로 이동했는지
- SSE snapshot/event 처리 방식
- 변경 파일 기준 타입 확인
- 상태 문서 갱신
```

---

## 8. Phase F 프롬프트

```text
/Users/jisung/SKTaxi 프로젝트에서 Spring 마이그레이션 Phase F를 진행해줘.

반드시 먼저 읽을 문서:
- /Users/jisung/SKTaxi/docs/spring-migration/frontend-migration-status.md
- /Users/jisung/SKTaxi/docs/spring-migration/frontend-architecture-guideline.md
- /Users/jisung/SKTaxi/docs/spring-migration/frontend-integration-roadmap.md
- /Users/jisung/SKTaxi/docs/spring-migration/api-specification.md

이번 스레드 목표:
- Chat 도메인을 Spring REST + STOMP로 이전
- message history는 REST, 실시간 송수신은 STOMP로 분리
- party:{partyId} 채팅방 패턴을 일관되게 처리

중요 규칙:
- shared/realtime/chatSocketClient를 재사용해.
- chatRepository가 서버 DTO 대신 앱 도메인 모델을 반환하게 해.
- chat detail/community unread 등 복잡한 화면 조합은 필요 시 Query/Facade로 분리해.
- touched feature는 중앙 DI 기준으로 수렴시켜.
- 커밋은 transport 연결, repository 구현, 화면 연결, 문서를 가능하면 분리해.
- 실제 STOMP destination/message DTO는 localhost의 /v3/api-docs 또는 /Users/jisung/skuri-backend 구현 기준으로 확인해.

검증:
- CONNECT header 인증 방식
- room subscribe / room summary / error queue 처리 방식
- 변경 파일 기준 타입 확인
- 상태 문서 갱신
```

---

## 9. Phase G/H 프롬프트

```text
/Users/jisung/SKTaxi 프로젝트에서 Spring 마이그레이션의 정리 단계(Phase G/H)를 진행해줘.

반드시 먼저 읽을 문서:
- /Users/jisung/SKTaxi/docs/spring-migration/frontend-migration-status.md
- /Users/jisung/SKTaxi/docs/spring-migration/frontend-architecture-guideline.md
- /Users/jisung/SKTaxi/docs/spring-migration/frontend-integration-roadmap.md
- /Users/jisung/SKTaxi/docs/spring-migration/api-specification.md

이번 스레드 목표:
- 남아 있는 mock 화면 체인 정리
- feature-local 임시 entrypoint 제거 또는 DI 경계로 흡수
- Firestore direct CRUD / legacy client 분기 제거
- 문서와 실제 코드 구조 동기화

중요 규칙:
- 단순 기계적 이동만 하지 말고 최종 구조 기준을 맞춰.
- Repository와 Query/Assembler 책임을 다시 섞지 마.
- 사용되지 않는 adapter / mock 경로는 명확히 제거해.
- 정리 단계도 한 커밋에 몰지 말고 제거/리팩터링/문서를 성격별로 분리해.

검증:
- 남아 있는 local entrypoint 목록
- 제거된 direct mock/Firebase 경로
- 문서 동기화 여부
- 상태 문서 갱신
```

---

## 9. 현재 추천 시작점

현재 상태 기준으로 다음 스레드의 추천 시작점은 아래 둘 중 하나다.

1. Phase B
2. Phase C에서 App Notice부터 시작

보다 안전한 순서는 다음과 같다.

- Phase B 먼저
- 그 다음 Phase C

이유:

- 로그인 후 Spring bootstrap이 먼저 안정되어야
  이후 concrete feature migration에서 보호 API 사용이 자연스럽다.
