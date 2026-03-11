# 리팩터링 실행 문서 세트

이 디렉터리는 SKURI 프로젝트를 `feature + app/shared` 구조로 재편하기 위한 기준 문서 세트다.  
리팩터링을 수행하는 AI는 아래 순서대로 읽고 작업해야 한다.

## 범위

- 이 문서 세트의 기본 범위는 **React Native 프론트엔드 코드베이스**다.
- `firebase-cloud-functions/` 이하 Firebase Cloud Functions 리팩터링은 **범위에서 제외**한다.
- 이유: Cloud Functions는 가까운 시점에 Spring 백엔드 서버로 마이그레이션될 예정이기 때문이다.
- 예외: Firebase Auth의 Google 소셜 로그인 기반 ID 토큰 발급과 직접 연결되는 프론트엔드 연동은 프론트엔드 범위에서 계속 다룬다.

## 버전 관리 원칙

- 기본 작업 브랜치는 하나의 장기 브랜치 `codex/refactor-feature-app-shared` 로 한다.
- 기본 전략은 "브랜치 하나 + Phase 단위 커밋 묶음"이다. Phase마다 새 브랜치를 만들지 않는다.
- phase 시작 전 저장소 정리용 `docs/chore` 커밋은 허용한다. 이런 선행 cleanup 커밋은 특정 Phase 번호에 포함하지 않는다.
- 각 Phase는 최소 1개의 독립 커밋으로 끝나야 하며, 가능하면 "구조 생성", "기계적 이동", "책임 분리", "검증 보강"처럼 리뷰 가능한 작은 커밋으로 나눈다.
- 하나의 커밋에는 하나의 목적만 담는다. 서로 다른 feature, 기계적 rename, 로직 변경은 섞지 않는다.
- 한 커밋이 두 개 이상의 Phase를 동시에 넘나들면 안 된다.
- 작업을 중단하거나 다른 에이전트로 넘길 때는 반드시 Phase 경계의 commit 이후 상태에서 넘긴다.

## 읽기 순서

1. `current-architecture-review.md`
2. `target-feature-app-shared-architecture.md`
3. `refactor-constraints-and-rules.md`
4. `refactor-roadmap.md`
5. `migration-status.md`

## 해석 우선순위

문서 간 충돌이 보이면 아래 우선순위를 따른다.

1. `refactor-constraints-and-rules.md`
2. `target-feature-app-shared-architecture.md`
3. `refactor-roadmap.md`
4. `current-architecture-review.md`

즉, `current-architecture-review.md` 는 배경 문서이고, 실제 구조와 실행 규칙은 `target-feature-app-shared-architecture.md`, `refactor-constraints-and-rules.md`, `refactor-roadmap.md` 가 결정한다.

## 문서 역할

- `current-architecture-review.md`
  - 현재 구조가 왜 문제인지 설명한다.
  - 리팩터링 방향의 배경과 진단 결과를 담는다.

- `target-feature-app-shared-architecture.md`
  - 최종 목표 폴더 구조와 각 영역의 책임을 정의한다.
  - 어떤 현재 폴더가 어디로 이동해야 하는지 기준을 제공한다.

- `refactor-constraints-and-rules.md`
  - 리팩터링 중 반드시 지켜야 할 의존성 규칙과 금지 사항을 정의한다.
  - 최종 구조가 달성되었는지 판별하는 체크리스트를 담는다.

- `refactor-roadmap.md`
  - 실제 리팩터링 순서와 단계별 작업 범위, 완료 기준을 정의한다.
  - AI가 한 번에 전체를 뒤집지 않고 안전하게 진행하도록 가이드한다.
  - Cloud Functions 리팩터링은 포함하지 않는다.

- `migration-status.md`
  - 현재 기준선 commit, 현재 phase, source of truth가 전환된 feature를 기록한다.
  - 다음 AI는 작업 시작 전에 반드시 이 문서를 읽고, phase 경계가 바뀌면 내용을 갱신한다.

## 작업 원칙

- 이 문서 세트는 "최종 구조"와 "실행 순서"를 동시에 정의한다.
- 리팩터링 AI는 문서에 없는 임의 구조를 도입하지 않는다.
- 구조 이동과 책임 정리는 반드시 단계적으로 수행한다.
- 각 단계가 끝날 때마다 동작 보존, import 경계, 테스트 가능성을 확인한다.
