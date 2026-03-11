# SKURI UI 2.0 Phase 검증 프롬프트

작성일: 2026-03-10

## 목적

이 문서는 각 phase 구현이 끝난 뒤 별도 Codex 스레드에서 검증만 수행하도록 시작 프롬프트를 고정해두기 위한 문서다.
기본 원칙은 `구현 스레드`와 `검증 스레드`를 분리하는 것이다.

검증 스레드는 아래만 수행한다.

- 문서 기준 충족 여부 점검
- Figma 대조
- phase 범위 위반 여부 점검
- legacy/v2 경계 위반 점검
- 완료 가능 여부 판정

검증 스레드는 기본적으로 새 코드를 작성하지 않는다.

## 권장 프롬프트

아래 프롬프트를 새 스레드 첫 메시지로 그대로 사용한다.

```text
SKURI UI 2.0의 Phase <N> 검증만 진행해줘.

이 스레드는 구현 스레드가 아니라 검증 스레드다.
가능하면 $skuri-ui-verifier 와 $figma 를 사용해.

작업 위치는 /Users/jisung/SKTaxi 이다.
검증 대상은 현재 working tree 변경사항이다. 먼저 git diff와 변경 파일부터 확인해.

작업 전에 반드시 아래를 지켜줘.
1. /Users/jisung/SKTaxi/docs/ui-redesign/implementation-roadmap.md 를 먼저 읽고 현재 phase 범위와 비범위를 확인
2. /Users/jisung/SKTaxi/docs/ui-redesign/figma-reference.md 를 읽고 canonical frame/node를 확인
3. 현재 phase에 필요한 추가 문서는 roadmap와 verifier skill 규칙에 따라 읽기
4. 시각적인 판단이 필요한 항목은 Figma MCP로 직접 확인
5. 구현이 아니라 검증만 수행

반드시 확인할 것:
- 현재 변경이 target phase 범위 안에 있는지
- 다음 phase 작업을 선행 구현하지 않았는지
- open-questions.md에 남은 항목을 임의 확정하지 않았는지
- legacy/v2 분리 원칙을 지켰는지
- phase 관련 문서와 코드가 충돌하지 않는지
- 외부 라이브러리 사용이 있다면 현재 `package.json` 버전 기준 사용법과 크게 어긋나지 않는지
- 해당 phase에서 필요한 lint/test가 수행됐는지, 또는 근거가 충분한지
- 화면 phase라면 screen-acceptance-checklist.md 기준으로 완료 가능 상태인지

출력 형식:
1. findings first
2. 그 다음 open questions / assumptions
3. 그 다음 최종 판정

판정은 아래 중 하나로 내려줘.
- 차단
- 수정 필요
- 사용자 확인 필요
- 다음 phase로 보류 가능
- 승인 가능

중요:
- 시각적 mismatch를 지적할 때는 가능하면 Figma 근거를 같이 제시해.
- 문서와 Figma가 충돌하면 문서 우선순위 규칙과 figma-reference.md의 override 규칙을 따라.
- 문제가 없으면 없다고 명시하고, 그래도 남는 리스크가 있으면 짧게 적어.
```

## Phase 1 검증 예시

지금 바로 사용할 수 있는 Phase 1 검증 프롬프트 예시는 아래와 같다.

```text
SKURI UI 2.0의 Phase 1 검증만 진행해줘.

이 스레드는 구현 스레드가 아니라 검증 스레드다.
가능하면 $skuri-ui-verifier 와 $figma 를 사용해.

작업 위치는 /Users/jisung/SKTaxi 이다.
검증 대상은 현재 working tree 변경사항이다. 먼저 git diff와 변경 파일부터 확인해.

이번 검증 범위는 Phase 1만이다.
즉 아래만 검증해줘.
- v2 color token
- v2 typography token
- v2 spacing token
- v2 radius token
- v2 border/shadow token
- foundation export 구조
- legacy token과 v2 token의 경계

반드시 읽을 문서:
1. /Users/jisung/SKTaxi/docs/ui-redesign/implementation-roadmap.md
2. /Users/jisung/SKTaxi/docs/ui-redesign/figma-reference.md
3. /Users/jisung/SKTaxi/docs/ui-redesign/ui-foundations.md
4. /Users/jisung/SKTaxi/docs/ui-redesign/token-migration-strategy.md
5. /Users/jisung/SKTaxi/docs/ui-redesign/component-ownership.md
6. /Users/jisung/SKTaxi/docs/ui-redesign/open-questions.md
7. 필요하면 /Users/jisung/SKTaxi/docs/ui-redesign/figma-theme-analysis-and-plan.md

반드시 확인할 것:
- 기존 legacy token을 덮어쓰지 않았는지
- v2 token이 별도 계층으로 만들어졌는지
- 새 foundation export 구조가 이후 primitive 단계에서 사용할 수 있게 정리됐는지
- Phase 2 이상의 구현이 섞이지 않았는지
- 색, 간격, radius, shadow가 문서와 Figma에 크게 어긋나지 않는지
- lint 실행 여부와 결과

출력 형식:
1. findings first
2. open questions / assumptions
3. 최종 판정
4. residual risk
```

## Phase 2 검증 예시

Phase 2 공통 primitive 구현 검증에 사용할 수 있는 프롬프트 예시는 아래와 같다.

```text
SKURI UI 2.0의 Phase 2 검증만 진행해줘.

이 스레드는 구현 스레드가 아니라 검증 스레드다.
가능하면 $skuri-ui-verifier 와 $figma 를 사용해.

작업 위치는 /Users/jisung/SKTaxi 이다.
검증 대상은 현재 working tree 변경사항이다. 먼저 git diff와 변경 파일부터 확인해.

이번 검증 범위는 Phase 2만이다.
즉 아래만 검증해줘.
- v2 공통 UI primitive
- primitive export 구조
- v2 token과 primitive 연결
- primitive 상태 규칙 반영
- 이후 screen phase에서 재사용 가능한 최소 조합 단위

검증 대상 primitive 후보:
- AppHeader
- SectionHeader
- FilterChip
- CategoryTag
- StatusBadge
- ElevatedCard
- GroupedList
- FloatingActionButton

반드시 읽을 문서:
1. /Users/jisung/SKTaxi/docs/ui-redesign/implementation-roadmap.md
2. /Users/jisung/SKTaxi/docs/ui-redesign/figma-reference.md
3. /Users/jisung/SKTaxi/docs/ui-redesign/ui-foundations.md
4. /Users/jisung/SKTaxi/docs/ui-redesign/ui-component-spec.md
5. /Users/jisung/SKTaxi/docs/ui-redesign/ui-states-and-interactions.md
6. /Users/jisung/SKTaxi/docs/ui-redesign/component-ownership.md
7. /Users/jisung/SKTaxi/docs/ui-redesign/token-migration-strategy.md
8. /Users/jisung/SKTaxi/docs/ui-redesign/ui-screen-templates.md
9. /Users/jisung/SKTaxi/docs/ui-redesign/screen-acceptance-checklist.md
10. /Users/jisung/SKTaxi/docs/ui-redesign/open-questions.md
11. 필요하면 /Users/jisung/SKTaxi/docs/ui-redesign/figma-theme-analysis-and-plan.md

반드시 확인할 것:
- legacy component를 직접 덮어쓰거나 파괴적으로 수정하지 않았는지
- v2 primitive가 별도 계층으로 분리되어 있는지
- primitive가 token 하드코딩 없이 v2 foundation 위에 서 있는지
- 상태 규칙이 ui-states-and-interactions.md와 맞는지
- primitive가 screen-specific 구현으로 새지 않았는지
- navigation 개편이나 상위 화면 구현이 섞이지 않았는지
- 외부 라이브러리를 썼다면 현재 `package.json` 버전 기준 사용법과 크게 어긋나지 않는지
- Figma 기준으로 header, chip, badge, grouped list, FAB의 시각적 위계가 크게 어긋나지 않는지
- lint 실행 여부와 결과

출력 형식:
1. findings first
2. open questions / assumptions
3. 최종 판정
4. residual risk
```

## Phase 3 검증 예시

Phase 3 navigation / app shell 개편 검증에 사용할 수 있는 프롬프트 예시는 아래와 같다.

```text
SKURI UI 2.0의 Phase 3 검증만 진행해줘.

이 스레드는 구현 스레드가 아니라 검증 스레드다.
가능하면 $skuri-ui-verifier 와 $figma 를 사용해.

작업 위치는 /Users/jisung/SKTaxi 이다.
검증 대상은 현재 working tree 변경사항이다. 먼저 git diff와 변경 파일부터 확인해.

이번 검증 범위는 Phase 3만이다.
즉 아래만 검증해줘.
- 하단 탭 4개 구조 반영: 캠퍼스 / 택시 / 공지 / 커뮤니티
- 기존 홈 탭 제거 및 캠퍼스 탭 도입
- 게시판 + 채팅 탭의 커뮤니티 통합
- MainNavigator / route types / app shell 정리
- 글로벌 MY 진입 임시 구조 반영
- depth 2+에서의 탭 숨김 규칙 정리

반드시 읽을 문서:
1. /Users/jisung/SKTaxi/docs/ui-redesign/implementation-roadmap.md
2. /Users/jisung/SKTaxi/docs/ui-redesign/ui-navigation-and-ia.md
3. /Users/jisung/SKTaxi/docs/ui-redesign/figma-reference.md
4. /Users/jisung/SKTaxi/docs/ui-redesign/ui-screen-templates.md
5. /Users/jisung/SKTaxi/docs/ui-redesign/screen-acceptance-checklist.md
6. /Users/jisung/SKTaxi/docs/ui-redesign/component-ownership.md
7. /Users/jisung/SKTaxi/docs/ui-redesign/open-questions.md
8. 필요하면 /Users/jisung/SKTaxi/docs/ui-redesign/figma-theme-analysis-and-plan.md

반드시 확인할 것:
- 5탭 구조가 4탭 구조로 정확히 전환됐는지
- Community 통합이 라우팅과 탭 구성에 일관되게 반영됐는지
- MY 진입 구조가 현재 문서 정책과 맞는지
- MY 관련 app-level override를 어기지 않았는지
- depth 2+ 탭 숨김 규칙이 문서와 어긋나지 않는지
- 상위 화면 실제 UI 구현이나 하위 화면 리디자인이 섞이지 않았는지
- navigation 관련 외부 라이브러리 사용이 현재 /Users/jisung/SKTaxi/package.json 버전 기준과 크게 어긋나지 않는지
- route/types/navigator naming이 문서와 충돌하지 않는지
- lint 실행 여부와 결과

출력 형식:
1. findings first
2. open questions / assumptions
3. 최종 판정
4. residual risk

판정은 아래 중 하나로 내려줘.
- 차단
- 수정 필요
- 사용자 확인 필요
- 다음 phase로 보류 가능
- 승인 가능
```

## Phase 4 검증 예시

Phase 4 상위 화면 shell 정렬 검증에 사용할 수 있는 프롬프트 예시는 아래와 같다.

```text
SKURI UI 2.0의 Phase 4 검증만 진행해줘.

이 스레드는 구현 스레드가 아니라 검증 스레드다.
가능하면 $skuri-ui-verifier 와 $figma 를 사용해.

작업 위치는 /Users/jisung/SKTaxi 이다.
검증 대상은 현재 working tree 변경사항이다. 먼저 git diff와 변경 파일부터 확인해.

이번 검증 범위는 Phase 4만이다.
즉 아래만 검증해줘.
- Campus / Taxi / Notice / Community / My 상위 화면 shell/layout 정렬
- 헤더 구조 정렬
- 섹션 간격, 공통 패딩, 기본 배경, 스크롤 구조 정렬
- Phase 2 primitive를 활용한 화면 틀 정리
- 데이터가 완전히 붙지 않아도 Figma와 구조/위계가 거의 맞는 skeleton 상태

반드시 읽을 문서:
1. /Users/jisung/SKTaxi/docs/ui-redesign/implementation-roadmap.md
2. /Users/jisung/SKTaxi/docs/ui-redesign/ui-navigation-and-ia.md
3. /Users/jisung/SKTaxi/docs/ui-redesign/figma-reference.md
4. /Users/jisung/SKTaxi/docs/ui-redesign/ui-screen-templates.md
5. /Users/jisung/SKTaxi/docs/ui-redesign/screen-acceptance-checklist.md
6. /Users/jisung/SKTaxi/docs/ui-redesign/ui-component-spec.md
7. /Users/jisung/SKTaxi/docs/ui-redesign/ui-states-and-interactions.md
8. /Users/jisung/SKTaxi/docs/ui-redesign/ui-content-rules.md
9. /Users/jisung/SKTaxi/docs/ui-redesign/component-ownership.md
10. /Users/jisung/SKTaxi/docs/ui-redesign/open-questions.md
11. 필요하면 /Users/jisung/SKTaxi/docs/ui-redesign/figma-theme-analysis-and-plan.md

Figma 기준 프레임:
- Campus `4:1406`
- Campus expanded `4:1776`
- Taxi `4:2219`
- Notice `1:1414`
- Community Board `1:1856`
- Community Chat `4:367`
- My `1:2126`

반드시 확인할 것:
- 상위 화면 5종이 모두 shell 수준으로 정렬되었는지
- 헤더, 배경, 스크롤, 공통 패딩, 섹션 간격이 화면 간 일관적인지
- 각 화면이 Figma의 구조/위계와 크게 어긋나지 않는지
- Phase 2 primitive를 적절히 재사용하고 있는지
- 실제 상세 UI 완성이나 depth 2+ 하위 화면 리디자인이 섞이지 않았는지
- 실데이터 정합성 최종화나 screen-specific 상세 로직이 섞이지 않았는지
- MY 관련 app-level override를 어기지 않았는지
- 외부 라이브러리 사용이 있다면 현재 /Users/jisung/SKTaxi/package.json 버전 기준 사용법과 크게 어긋나지 않는지
- lint 실행 여부와 결과

출력 형식:
1. findings first
2. open questions / assumptions
3. 최종 판정
4. residual risk

판정은 아래 중 하나로 내려줘.
- 차단
- 수정 필요
- 사용자 확인 필요
- 다음 phase로 보류 가능
- 승인 가능
```

## Phase 5 검증 예시

Phase 5 Notice 상위 화면 구현 검증에 사용할 수 있는 프롬프트 예시는 아래와 같다.

```text
SKURI UI 2.0의 Phase 5 검증만 진행해줘.

이 스레드는 구현 스레드가 아니라 검증 스레드다.
가능하면 $skuri-ui-verifier 와 $figma 를 사용해.

작업 위치는 /Users/jisung/SKTaxi 이다.
검증 대상은 현재 working tree 변경사항이다. 먼저 git diff와 변경 파일부터 확인해.

이번 검증 범위는 Phase 5만이다.
즉 아래만 검증해줘.
- Notice 메인 상위 화면 실제 구현
- unread banner 구현
- category chip row 구현
- notice list item 패턴 구현
- 목록 밀도와 정보 위계 정리
- Phase 2 primitive와 v2 token을 사용한 Notice 화면 완성

반드시 읽을 문서:
1. /Users/jisung/SKTaxi/docs/ui-redesign/implementation-roadmap.md
2. /Users/jisung/SKTaxi/docs/ui-redesign/ui-navigation-and-ia.md
3. /Users/jisung/SKTaxi/docs/ui-redesign/figma-reference.md
4. /Users/jisung/SKTaxi/docs/ui-redesign/ui-screen-templates.md
5. /Users/jisung/SKTaxi/docs/ui-redesign/screen-acceptance-checklist.md
6. /Users/jisung/SKTaxi/docs/ui-redesign/ui-component-spec.md
7. /Users/jisung/SKTaxi/docs/ui-redesign/ui-states-and-interactions.md
8. /Users/jisung/SKTaxi/docs/ui-redesign/ui-content-rules.md
9. /Users/jisung/SKTaxi/docs/ui-redesign/component-ownership.md
10. /Users/jisung/SKTaxi/docs/ui-redesign/open-questions.md
11. 필요하면 /Users/jisung/SKTaxi/docs/ui-redesign/figma-theme-analysis-and-plan.md

Figma 기준 프레임:
- Notice `1:1414`

반드시 확인할 것:
- Notice 상위 화면만 Phase 5 범위 안에서 구현되었는지
- unread banner가 Figma와 문서 기준에 맞게 구현되었는지
- category chip row의 상태와 위계가 맞는지
- list item에서 unread, category, date, title, chevron 정보가 빠르게 스캔되는지
- 목록 밀도와 spacing이 Figma와 크게 어긋나지 않는지
- 기존 데이터 소스/훅 재사용이 무리 없이 이뤄졌는지
- Notice 상세 화면, 웹뷰, 확장 기능, 다른 상위 화면 작업이 섞이지 않았는지
- 외부 라이브러리 사용이 있다면 현재 /Users/jisung/SKTaxi/package.json 버전 기준 사용법과 크게 어긋나지 않는지
- lint 실행 여부와 결과

출력 형식:
1. findings first
2. open questions / assumptions
3. 최종 판정
4. residual risk

판정은 아래 중 하나로 내려줘.
- 차단
- 수정 필요
- 사용자 확인 필요
- 다음 phase로 보류 가능
- 승인 가능
```
