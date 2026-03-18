# RN Spring 연동 아키텍처 가이드

> 최종 수정일: 2026-03-18
> 관련 문서: [RN Spring 연동 로드맵](./frontend-integration-roadmap.md) | [API 명세](./api-specification.md) | [역할 정의](./role-definition.md)

---

## 1. 문서 목적

이 문서는 React Native 앱이 Firebase/Mock 기반 구조에서
Spring 백엔드(`https://api.skuri.kr`) 중심 구조로 이동할 때
프론트엔드가 따라야 할 기본 아키텍처를 고정한다.

핵심 목표는 다음 3가지다.

- 서버 DTO, Firebase 구현, mock 구현이 화면까지 직접 새지 않게 한다.
- `RepositoryProvider`를 중심으로 데이터 접근 지점을 중앙집중식으로 관리한다.
- 도메인 데이터 접근과 화면 조합 로직을 분리하되, 불필요하게 모든 것을 `Repository`로 만들지 않는다.

---

## 2. 최종 방향

### 2.1 큰 원칙

- Firebase는 로그인과 Firebase ID Token 발급에만 사용한다.
- 도메인 데이터의 최종 진실 공급원은 Spring 서버다.
- 프론트는 서버가 준 도메인 상태를 소비하고, 화면용 파생 계산만 수행한다.
- 데이터 접근의 기본 진입점은 전역 DI다.
  - 현재 기준 파일:
    - `src/di/RepositoryProvider.tsx`
    - `src/di/RepositoryContext.ts`
    - `src/di/useRepository.ts`

### 2.2 권장 레이어

Spring 연동 이후 프론트는 아래 레이어를 기본 구조로 사용한다.

```text
Spring REST / SSE / STOMP
    ↓
Transport / API layer
    ↓
DTO Mapper
    ↓
Domain Repository
    ↓
Query / Assembler / Facade
    ↓
Hook
    ↓
Screen
```

이때 핵심은 다음과 같다.

- Repository는 도메인 경계를 대표한다.
- 화면 전용 조합은 Query/Assembler/Facade 레이어에서 처리한다.
- Hook은 React 상태와 사용자 상호작용을 연결하는 역할에 집중한다.

---

## 3. 레이어별 책임

### 3.1 Transport / API layer

위치 권장:

- `src/shared/api/*`
- `src/shared/realtime/*`
- 필요 시 feature 내부 `data/api/*`

역할:

- HTTP client 구성
- Authorization header 주입
- SSE 연결
- STOMP 연결
- 공통 에러 파싱
- 재시도, reconnect, timeout 정책

금지:

- React state 보유
- 화면 문구 생성
- 화면 전용 타입 직접 반환

### 3.2 DTO Mapper

위치 권장:

- `src/features/<feature>/data/dto/*`
- `src/features/<feature>/data/mappers/*`

역할:

- Spring 응답 DTO를 앱 내부 도메인 모델로 변환
- enum, 날짜, nullable 필드, 서버 응답 구조 차이를 흡수

금지:

- 화면용 label 생성
- UI badge, empty state, 문구 조합

### 3.3 Domain Repository

위치 권장:

- `src/features/<feature>/data/repositories/*`

역할:

- 앱이 사용하는 안정된 도메인 인터페이스 제공
- REST/SSE/STOMP를 숨기고 도메인 모델로 반환
- create/update/subscribe 같은 도메인 동작 제공

예시:

- `IPartyRepository`
- `IChatRepository`
- `INoticeRepository`
- `IUserRepository`

Repository가 반환해야 하는 것:

- `Party`
- `JoinRequest`
- `ChatRoom`
- `Notice`
- `UserProfile`

Repository가 반환하면 안 되는 것:

- `publishedLabel: "3시간 전"`
- `emptyStateTitle`
- `primaryActionLabel`
- 화면 색상/뱃지/문구 정보

즉, Repository는 “서버 DTO”도 아니고 “완전한 화면 ViewData”도 아닌
앱 표준 도메인 모델을 반환해야 한다.

### 3.4 Query / Assembler / Facade

위치 권장:

- `src/features/<feature>/application/queries/*`
- `src/features/<feature>/application/assemblers/*`

역할:

- 여러 Domain Repository를 조합
- 복잡한 화면용 read model 생성
- 화면에 필요한 파생값 계산
- 서버 기준 상태를 바탕으로 화면 소비용 구조를 구성

이 레이어가 필요한 대표 사례:

- Taxi Home
- Notification Center
- Community Home
- My Page 대시보드
- unread count와 목록 상태를 함께 보여주는 화면

예시:

- `TaxiHomeQuery`
- `NotificationCenterQuery`
- `AppNoticeFeedQuery`

권장 이유:

- 화면 조합 로직을 Repository에 밀어 넣지 않게 해준다.
- Hook이 비대해지는 것을 막는다.
- Spring API 교체와 UI 조합 변경을 분리할 수 있다.

### 3.5 Hook

위치:

- `src/features/<feature>/hooks/*`

역할:

- 로딩/에러 상태 관리
- search query, selected filter, selected sort 같은 화면 상태 관리
- refetch, mutate, optimistic UI 연결
- Repository 또는 Query 호출

Hook에 남겨도 되는 것:

- 입력 상태
- 현재 탭 상태
- 정렬 선택 상태
- debounce
- 화면 단위의 간단한 memoization

Hook에서 빼야 하는 것:

- 서버 DTO 매핑
- 여러 repository를 깊게 조합하는 로직
- 재사용 가치가 있는 화면 조합 규칙

---

## 4. 현재 코드 기준 분류

### 4.1 Domain Repository로 유지할 것

- `IPartyRepository`
- `IChatRepository`
- `IBoardRepository`
- `INoticeRepository`
- `IUserRepository`
- `IAppNoticeRepository`

이들은 Spring 연동 시 `Spring...Repository` 구현을 붙이고,
전역 DI에서 교체하는 방향으로 유지한다.

### 4.2 Query/Assembler 성격으로 재정리할 것

현재 이름은 Repository지만, 실제 성격은 화면 조합 레이어에 가깝다.

- `ITaxiHomeRepository`
- `IAppNoticeScreenRepository`
- `notificationCenterRepository`
- `communityHomeRepository`
- `boardDetailRepository`
- `chatDetailRepository`
- `noticeHomeRepository`
- `noticeDetailRepository`

이들은 장기적으로 다음 중 하나로 정리한다.

- 실제 Domain Repository만으로 충분하면 제거
- 화면 조합이 계속 필요하면 `Query` 또는 `Facade`로 승격

예:

- `ITaxiHomeRepository` → `TaxiHomeQuery`
- `IAppNoticeScreenRepository` → `AppNoticeFeedQuery`

---

## 5. 서버 API 설계 원칙

### 5.1 쓰기 API

쓰기 API는 도메인/유스케이스 중심으로 유지한다.

예:

- `POST /v1/parties`
- `POST /v1/parties/{id}/join-requests`
- `PATCH /v1/members/me`

### 5.2 읽기 API

읽기 API는 필요하면 화면 최적화 endpoint를 허용한다.

허용 예:

- unread count
- 내 권한이 반영된 버튼 상태
- 여러 aggregate를 조합한 dashboard 응답
- 서버에서 join한 결과가 필요한 read model

비권장 예:

- `"3시간 전"` 같은 표시 문구
- `"아직 공지가 없어요"` 같은 empty state 문구
- 버튼 label, badge tone, 로컬라이즈된 카피

즉, 서버는 “화면을 위한 읽기 모델”까지는 제공할 수 있지만,
“표현 카피와 UI 텍스트”까지 책임지지는 않는다.

### 5.3 백엔드 계약 불일치 처리 원칙

Spring 백엔드 계약이 현재 프론트 정책과 완전히 맞지 않을 수 있다.

이때는 불일치 종류를 나눠서 처리한다.

프론트에서 흡수 가능한 불일치:

- 필드명 차이
- 응답 shape 차이
- 날짜 포맷 차이
- nullable 처리 차이
- enum 이름 차이
- 화면용 파생값 차이
- 화면 조합 방식 차이

위 항목은 의미가 동일하다면
DTO mapper 또는 Query/Assembler에서 흡수하고 작업을 계속 진행할 수 있다.

즉, “표현/매핑 수준의 차이”는 프론트에서 해결한다.

백엔드 수정 요청이 필요한 불일치:

- endpoint 자체가 없음
- HTTP method가 다름
- 인증/인가 정책이 다름
- 서버가 최종 판단해야 할 비즈니스 규칙이 다름
- 상태 머신 규칙이 다름
- SSE event name 또는 payload가 다름
- STOMP destination 또는 message contract가 다름
- unread count, join request, settlement, FCM token, 권한 판단처럼
  서버 진실 공급원이어야 하는 핵심 도메인 규칙이 다름

위 항목은 프론트 workaround로 덮지 않는다.

처리 원칙:

- 프론트에서 흡수 가능한 차이는 문서화하고 계속 진행한다.
- 서버 진실 공급원 계약이 어긋나면 해당 feature 작업은 중단한다.
- 중단 시에는 사용자에게 아래 내용을 보고한다.
  1. 무엇이 다른지
  2. 실제 기준이 무엇인지
  3. 프론트에서 흡수 가능한지 여부
  4. 필요한 백엔드 변경안

금지:

- 서버가 해야 할 판단을 프론트에 임시로 넣는 것
- 없는 endpoint를 추측해서 우회 구현하는 것
- 계약 불일치를 조용히 프론트 workaround로 덮는 것
- 문서와 실제 구현이 어긋난 상태를 그대로 두는 것

---

## 6. DI 정책

### 6.1 기본 정책

- 중앙집중식 관리가 기본이다.
- Domain Repository는 `RepositoryProvider`에서 일괄 등록한다.
- Hook은 가능한 `useRepository()` 또는 feature 단위 래퍼 훅만 사용한다.

### 6.2 Query/Facade 정책

복잡한 화면 조합 객체도 중앙관리 대상으로 본다.

단기적으로는 다음 두 방식 중 하나를 선택할 수 있다.

1. `RepositoryProvider`에 Query/Facade까지 함께 등록한다.
2. Repository만 DI로 받고, Query는 hook 내부에서 조립한다.

현재 프로젝트 목표가 “한 곳에서 다 보고 관리”에 가깝기 때문에,
당분간은 1번 전략을 우선 권장한다.

단, 이름으로 역할을 구분한다.

예:

- `partyRepository`
- `chatRepository`
- `taxiHomeQuery`
- `notificationCenterQuery`

즉, 한 컨테이너에 같이 있더라도
모두를 `Repository`라고 부르지는 않는다.

### 6.3 과도기 정책

feature-local entrypoint는 임시 단계에서만 허용한다.

허용 범위:

- 아직 전역 DI로 올리기 전인 짧은 과도기
- 실험적 mock 전환
- 마이그레이션 도중 임시 연결 지점

목표 상태:

- Hook이 feature-local singleton import를 직접 하지 않는다.
- 구현 교체 지점은 전역 DI에 모인다.

### 6.4 마이그레이션 실행 규칙

중앙집중식 DI가 최종 목표인 것은 맞지만,
Spring 마이그레이션을 시작하기 전에
앱 전체를 한 번에 전면 리팩터링하는 것은 권장하지 않는다.

기본 규칙은 다음과 같다.

- Phase A 공통 transport 구축은 현재 혼재 구조와 독립적으로 바로 진행한다.
- 전역 DI 전면 통일이 Phase A의 선행 조건은 아니다.
- 실제 Spring API를 붙이는 feature부터 중앙집중식 DI로 함께 흡수한다.
- 즉, “전면 선리팩터링”이 아니라 “feature별 연결 + feature별 중앙화”를 같이 진행한다.

권장 작업 방식:

1. 공통 transport를 먼저 구축한다.
2. 특정 feature의 Spring Repository 또는 Query를 구현한다.
3. 그 feature가 feature-local entrypoint를 쓰고 있었다면, 같은 작업 안에서 전역 DI로 흡수한다.
4. hook이 mock/Firebase/Spring 구현체를 직접 import하는 경로를 제거한다.

금지 또는 비권장:

- 실제 서버 연결 없이 앱 전체 DI만 기계적으로 먼저 뒤집는 작업
- 새로운 feature-local singleton repository 패턴 추가
- Spring 연결 후에도 touched feature를 임시 entrypoint 상태로 오래 방치하는 것

즉, 작업 기준은 다음 한 줄로 정리할 수 있다.

- “공통 infra는 즉시 진행, feature 마이그레이션은 중앙화와 함께 진행”

---

## 7. 마이그레이션 진행 방식

이 문서를 기준으로 Spring 마이그레이션을 진행한다.

순서는 다음과 같다.

1. 공통 transport를 구축한다.
2. Spring DTO와 mapper를 만든다.
3. `Spring...Repository`를 구현한다.
4. 현재 feature-local entrypoint를 전역 DI 경계로 흡수한다.
5. 화면 조합이 복잡한 영역은 Query/Assembler로 분리한다.
6. Hook이 직접 mock/Firebase/Spring transport를 아는 경로를 제거한다.

### 7.1 작업 단위 기준

한 feature를 옮길 때 권장 단위는 다음과 같다.

1. DTO / mapper 추가
2. `Spring...Repository` 또는 `...Query` 추가
3. `RepositoryProvider` / `RepositoryContext` / `useRepository` 경계 반영
4. 기존 hook import 교체
5. 기존 local entrypoint 제거 또는 얇은 adapter로 축소

즉, feature 하나를 건드릴 때
“서버 연결”과
“주입 구조 수렴”
둘을 같은 변경 단위로 묶는 것이 기본 전략이다.

---

## 8. 의사결정 체크리스트

새로운 데이터 접근 코드를 만들 때는 아래 순서로 판단한다.

1. 이 로직이 도메인 CRUD/구독인가?
   - 맞으면 Domain Repository에 둔다.
2. 여러 Repository 결과를 합쳐 화면용 read model을 만드는가?
   - 맞으면 Query/Assembler에 둔다.
3. 단순 loading/error/search/filter 상태인가?
   - 맞으면 Hook에 둔다.
4. 서버 DTO를 그대로 화면에 노출하려고 하는가?
   - 그렇다면 Mapper 또는 Domain Model 경계가 빠진 것이다.
5. 화면 문구/뱃지/label을 Repository에서 만들고 있는가?
   - 그렇다면 Query 또는 Hook으로 이동해야 한다.

### 8.1 다른 에이전트를 위한 실행 체크리스트

다른 AI 에이전트 또는 후속 작업자는 아래 규칙을 기본값으로 따른다.

- 먼저 전체 앱 DI를 전면 리팩터링하려고 하지 않는다.
- Phase A 공통 transport는 독립 작업으로 바로 진행한다.
- Spring API를 연결하는 feature는 같은 작업에서 DI 중앙화까지 함께 처리한다.
- 새로운 feature-local repository entrypoint를 늘리지 않는다.
- 새 데이터 접근 코드는 가능하면 `RepositoryProvider` 기준으로 등록한다.
- 화면 조합이 복잡하면 Repository가 아니라 Query/Assembler/Facade로 분리한다.
- 서버 DTO를 hook/screen으로 직접 올리지 않는다.
- touched feature에 남아 있는 mock 직접 import는 같이 제거한다.

---

## 9. 요약

- Repository는 도메인 경계로 유지한다.
- 복잡한 화면 조합은 Query/Assembler/Facade로 분리한다.
- 화면은 도메인 모델과 화면용 read model을 소비하되, 서버 DTO를 직접 알지 않는다.
- 중앙집중식 DI를 기본 규칙으로 삼고, 마이그레이션도 그 기준으로 진행한다.
- 단, 전면 선리팩터링은 하지 않고 feature별 Spring 연결과 중앙화를 함께 진행한다.
