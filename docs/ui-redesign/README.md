# SKURI UI Redesign Docs

작성일: 2026-03-10

## 목적

이 폴더는 SKURI 상위 화면 UI 리팩터링 전에 먼저 고정해야 할 디자인 시스템, 내비게이션, 공통 컴포넌트, 화면 템플릿 문서를 모아둔 공간이다.
현재 문서는 `SKURI-v2.0` Figma 상위 프레임 기준으로 최신화되어 있다.

모든 문서는 아래 두 원칙을 따른다.

1. Figma 상위 프레임에서 확인 가능한 내용만 확정값으로 기록한다.
2. 아직 결정되지 않은 내용은 별도 보류 문서에 분리한다.

## 문서 목록

- `figma-theme-analysis-and-plan.md`
  - Figma 기반 테마 분석, 현재 코드와의 차이, 상위 계획

- `figma-reference.md`
  - canonical Figma 링크, node id, phase별 참조 기준, 문서와 Figma 충돌 처리 규칙

- `design-system-documentation-checklist.md`
  - 구현 전 문서화 체크리스트

- `ui-foundations.md`
  - 컬러, 타이포, spacing, radius, border, shadow 등 foundation 규칙

- `token-migration-strategy.md`
  - legacy token 유지, v2 token 분리, 전체 전환 후 정리 기준

- `ui-states-and-interactions.md`
  - 선택/비선택, 안읽음, 모집 상태, 세그먼트, 탭, 인터랙션 상태 규칙

- `ui-navigation-and-ia.md`
  - 4탭 구조, 글로벌 MY, Community 구조, Minecraft 보류 정책

- `ui-component-spec.md`
  - 공통 컴포넌트 명세 초안

- `component-ownership.md`
  - legacy 컴포넌트 유지, v2 컴포넌트 신규 작성, 제거 시점 기준

- `screen-acceptance-checklist.md`
  - 상위 화면 공통 완료 기준, 화면별 완료 기준, 사용자 승인 게이트

- `phase-verification-prompt.md`
  - phase 구현 후 별도 Codex 검증 스레드를 시작할 때 사용하는 고정 프롬프트

- `ui-screen-templates.md`
  - Campus / Taxi / Notice / Community / My 상위 화면 템플릿

- `ui-content-rules.md`
  - 날짜, 시간, 금액, 라벨, 말줄임, 숫자 표기 규칙

- `implementation-roadmap.md`
  - 실제 코드 구현을 위한 단계별 로드맵, 산출물, 종료 조건

- `open-questions.md`
  - 아직 확정되지 않은 정책과 후속 의사결정 항목

## 현재 상태

다음은 확정 상태다.

- 라이트 테마 기반 전환
- 4탭 구조: `캠퍼스 / 택시 / 공지 / 커뮤니티`
- 글로벌 MY 별도 운영
- MY 화면은 `bottom tab 미노출 + 좌측 상단 뒤로가기`
- Community 내부 `게시판 / 채팅` 세그먼트 구조
- Minecraft 기능은 메인 IA에서 보류
- 상위 화면부터 점진 구현
- RN/React 등 버전 마이그레이션은 UI 2.0 구현 완료 후 후행

다음은 아직 보류 상태다.

- 글로벌 MY 진입 방식의 완전한 표준화
- 상세 화면 리팩터링 범위와 시점
- 모션 수치의 최종 고정
