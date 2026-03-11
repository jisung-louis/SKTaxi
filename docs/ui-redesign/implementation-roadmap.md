# SKURI UI 2.0 구현 로드맵

> 최종 수정일: 2026-03-10
> 관련 문서: [README](./README.md) | [Figma Reference](./figma-reference.md) | [Figma 테마 분석 및 계획](./figma-theme-analysis-and-plan.md) | [UI Foundations](./ui-foundations.md) | [토큰 마이그레이션 전략](./token-migration-strategy.md) | [상태/인터랙션 규칙](./ui-states-and-interactions.md) | [내비게이션/IA](./ui-navigation-and-ia.md) | [공통 컴포넌트 명세](./ui-component-spec.md) | [컴포넌트 소유권 정책](./component-ownership.md) | [화면 템플릿](./ui-screen-templates.md) | [화면 완료 체크리스트](./screen-acceptance-checklist.md) | [콘텐츠 규칙](./ui-content-rules.md) | [오픈 이슈](./open-questions.md)

---

## 1. 현재 상태


| 항목          | 상태                                                                                            |
| ----------- | --------------------------------------------------------------------------------------------- |
| 모바일 스택      | React Native 0.79.2 / React 19 / TypeScript 5                                                 |
| 현재 코드 기준 UI | 다크 테마 + 5탭 구조(`홈 / 택시 / 공지 / 게시판 / 채팅`)                                                       |
| 목표 UI       | 라이트 테마 + 4탭 구조(`캠퍼스 / 택시 / 공지 / 커뮤니티`) + 글로벌 `MY`                                             |
| 디자인 소스      | Figma 상위 프레임 7종 분석 완료 (`Campus`, `Taxi`, `Notice`, `Community-Board`, `Community-Chat`, `My`) |
| 문서화 상태      | Foundations / Token 전략 / IA / 컴포넌트 / 소유권 정책 / 화면 템플릿 / 완료 체크리스트 / 콘텐츠 규칙 / 보류 이슈 문서화 완료 |
| 코드 구현 상태    | UI 2.0 코드 구현 미착수                                                                              |
| 확정 정책       | 라이트 테마 전환, 4탭 구조, Community 내부 `게시판/채팅` 세그먼트, Minecraft 메인 IA 보류, 상위 화면 우선 구현, MY 화면 `bottom tab 미노출 + 좌측 상단 뒤로가기`, Campus 워드마크 SVG/이미지 자산 사용, 버전 마이그레이션 후행 |
| 보류 정책       | 글로벌 MY 진입 표준, 상세 화면 확장 시점, 모션 수치, 배지 상한 표기, 일부 상태 화면 시각 규칙, Campus 브랜드 영역의 추후 로고 조합 방식 |


### 현재 구현 전제

- 현재 `main` 기준 코드는 UI 2.0 이전 상태다.
- 이번 로드맵은 `기존 다크 UI를 부분 수정`하는 문서가 아니라, `새 foundation과 IA 기준으로 단계적으로 갈아타는 문서`다.
- 상위 화면 구현은 곧바로 진행할 수 있지만, foundation과 앱 shell을 먼저 고정하지 않으면 재작업이 커진다.
- RN/React를 포함한 버전 마이그레이션은 지금 하지 않는다.
- 의존성/플랫폼 업그레이드는 UI 2.0 상위/하위 화면 개편이 완료된 뒤 별도 마이그레이션 작업으로 분리한다.

---

## 2. 구현 순서 총괄

```text
Phase 0: 실행 가드레일 및 기준선 고정
    ↓
Phase 1: UI Foundation Token 구축
    ↓
Phase 2: 공통 UI Primitive 구축
    ↓
Phase 3: Navigation / App Shell 개편
    ↓
Phase 4: 상위 화면 Shell 정렬
    ↓
Phase 5: Notice 상위 화면
    ↓
Phase 6: Community 상위 화면 (게시판 + 채팅)
    ↓
Phase 7: My 상위 화면
    ↓
Phase 8: Taxi 상위 화면
    ↓
Phase 9: Campus 상위 화면
    ↓
Phase 10: 하위 화면(Depth 2+) 확장
    ↓
Phase 11: 안정화 / 검증 / 정리
```

### 상위 화면 구현 순서 고정

상위 화면 구현 순서는 아래로 고정한다.

1. `Notice`
2. `Community`
3. `My`
4. `Taxi`
5. `Campus`

이 순서는 변경하지 않는 것을 기본값으로 한다.  
`Campus`는 여러 모듈을 조합하는 허브이므로 항상 마지막에 구현한다.

---

## 3. Phase 상세

---

### Phase 0: 실행 가드레일 및 기준선 고정

> UI 2.0 코드를 건드리기 전에, 구현자가 임의 해석 없이 같은 기준으로 움직이게 만드는 단계다.

#### 0-1. 범위

- 현재 구조와 목표 구조의 차이 고정
- 라우트 전환 기준 고정
- 문서 우선순위 고정
- 미정 사항 처리 원칙 고정
- 상위 화면 acceptance 기준 초안 고정

#### 0-2. 구현 항목


| #   | 항목                | 설명                                                             |
| --- | ----------------- | -------------------------------------------------------------- |
| 1   | 현재/목표 라우트 매핑표     | `홈 -> 캠퍼스`, `게시판+채팅 -> 커뮤니티`, `Profile/Setting -> MY` 전환 기준 명시 |
| 2   | 토큰 마이그레이션 원칙      | legacy token 유지, v2 token 분리, 전체 전환 후 정리 기준 고정                   |
| 3   | 컴포넌트 ownership 분류 | 기존 컴포넌트는 legacy 유지, v2 컴포넌트는 신규 작성, 전체 전환 후 제거 기준 정리               |
| 4   | 화면별 완료 기준 초안      | 공통 완료 기준 + 화면별 완료 기준 + 사용자 승인 게이트 작성                           |
| 5   | 문서 우선순위 규칙        | Codex가 어떤 문서를 어떤 순서로 읽을지 고정                                    |


#### 0-3. 산출물

- 실행 가능한 UI 2.0 로드맵
- 문서 우선순위 규칙
- Phase별 out-of-scope 기준
- token migration strategy
- component ownership policy
- screen acceptance checklist

#### 0-4. 완료 기준

- 구현자가 `지금 바꿔도 되는 것`과 `지금 바꾸면 안 되는 것`을 구분할 수 있어야 한다.
- Minecraft 보류 정책, 4탭 구조, Community 통합 구조가 더 이상 흔들리지 않아야 한다.
- 상위 화면 우선 구현 정책이 문서상 명확해야 한다.

#### 0-5. 비범위

- 실제 화면 스타일 변경
- 내비게이션 코드 수정
- 컴포넌트 구현

#### 0-6. 참고 문서

- [README](./README.md)
- [내비게이션/IA](./ui-navigation-and-ia.md)
- [토큰 마이그레이션 전략](./token-migration-strategy.md)
- [컴포넌트 소유권 정책](./component-ownership.md)
- [화면 완료 체크리스트](./screen-acceptance-checklist.md)
- [오픈 이슈](./open-questions.md)

---

### Phase 1: UI Foundation Token 구축

> 모든 상위 화면이 같은 시각 언어를 공유하도록 foundation을 먼저 코드에 박는 단계다.

#### 1-1. 범위

- semantic color token
- typography scale
- spacing / radius / border / shadow
- foundation export 구조

#### 1-2. 구현 항목


| #   | 항목                   | 설명                                                                           |
| --- | -------------------- | ---------------------------------------------------------------------------- |
| 1   | 색상 토큰 재정의            | `bg`, `text`, `border`, `accent`, `status` 계층으로 정리                           |
| 2   | 타이포 토큰 재정의           | `screenTitle`, `sectionTitle`, `cardTitle`, `body`, `meta`, `tabLabel` 계층 정리 |
| 3   | spacing scale 정의     | `4 / 8 / 12 / 16 / 24 / 32` 기준                                               |
| 4   | radius scale 정의      | `4 / 8 / 12 / 16 / full`                                                     |
| 5   | border/shadow 규칙 코드화 | 헤더, 카드, grouped list, FAB 규칙 반영                                              |
| 6   | foundation 사용 규칙 정리  | 기존 다크 토큰 직접 참조 금지 방향 설정                                                      |


#### 1-3. 산출물

- 새 foundation token 파일 세트
- 라이트 테마 기준 semantic token 체계

#### 1-4. 완료 기준

- 상위 화면 5종을 ad-hoc color/style 없이 조립 가능한 수준이어야 한다.
- 기존 다크 테마 hard-coded color를 새 token으로 치환할 준비가 되어 있어야 한다.
- `ui-foundations.md`와 코드 token 구조가 크게 충돌하지 않아야 한다.

#### 1-5. 비범위

- 화면 완성
- 공통 컴포넌트 구현
- 라우트 개편

#### 1-6. 참고 문서

- [UI Foundations](./ui-foundations.md)
- [콘텐츠 규칙](./ui-content-rules.md)
- [컴포넌트 소유권 정책](./component-ownership.md)

---

### Phase 2: 공통 UI Primitive 구축

> 상위 화면 구현 전에 반복 패턴을 프리미티브로 고정하는 단계다.

#### 2-1. 범위

- 헤더, 카드, 칩, 배지, grouped list, FAB 등 공통 UI

#### 2-2. 구현 항목


| #   | 항목                     | 설명                     |
| --- | ---------------------- | ---------------------- |
| 1   | `AppHeader`            | 화면 타이틀 + 우측 액션         |
| 2   | `SectionHeader`        | 섹션 제목 + 우측 액션          |
| 3   | `FilterChip`           | selected/default 상태 포함 |
| 4   | `CategoryTag`          | 학사/장학/취업 등 라벨          |
| 5   | `StatusBadge`          | 모집중/마감/unread count    |
| 6   | `ElevatedCard`         | 기본 white card wrapper  |
| 7   | `GroupedList`          | MY용 묶음 리스트 패턴          |
| 8   | `FloatingActionButton` | Community 게시판용 FAB     |


#### 2-3. 산출물

- 최소 공통 primitive 세트
- 화면에서 직접 조합 가능한 카드/칩/배지 패턴

#### 2-4. 완료 기준

- Notice / Community / My / Taxi / Campus에서 공통으로 재사용할 수 있어야 한다.
- `ui-component-spec.md`에 있는 핵심 컴포넌트 대부분을 코드로 대표 구현한 상태여야 한다.
- 같은 역할의 컴포넌트를 화면마다 따로 만들 필요가 없어야 한다.

#### 2-5. 비범위

- 실제 상위 화면 완성
- 탭 구조 개편
- 실데이터 연결

#### 2-6. 참고 문서

- [공통 컴포넌트 명세](./ui-component-spec.md)
- [상태/인터랙션 규칙](./ui-states-and-interactions.md)
- [컴포넌트 소유권 정책](./component-ownership.md)

---

### Phase 3: Navigation / App Shell 개편

> 앱의 최상위 IA를 새 구조로 먼저 맞추는 단계다.

#### 3-1. 범위

- 하단 탭 구조 개편
- 상위 라우트 이름 정리
- Community 진입 구조 통합
- 글로벌 MY 진입 임시 적용

#### 3-2. 구현 항목


| #   | 항목           | 설명                                    |
| --- | ------------ | ------------------------------------- |
| 1   | 4탭 구조 반영     | `캠퍼스 / 택시 / 공지 / 커뮤니티`                |
| 2   | 탭 라벨 정리      | `홈` 제거, `캠퍼스` 도입                      |
| 3   | Community 통합 | `게시판 + 채팅` 개별 탭 제거                    |
| 4   | 하단 탭바 스타일 개편 | white background + green active state |
| 5   | 글로벌 MY 임시 진입 | 상위 화면에서 일관된 진입 가능 상태 확보               |
| 6   | 탭 숨김 규칙 재정의  | depth 2+에서 숨김 처리 정책 정렬                |


#### 3-3. 산출물

- 새 `MainNavigator`
- 새 `types.ts`
- 새 탭바 외형과 route skeleton

#### 3-4. 완료 기준

- 앱 실행 시 최상위 탭 구조가 Figma IA와 일치해야 한다.
- 각 상위 화면 route가 skeleton 상태로라도 모두 연결되어야 한다.
- `ui-navigation-and-ia.md`와 실제 route 구조가 어긋나지 않아야 한다.

#### 3-5. 비범위

- 상위 화면 상세 구현
- 하위 화면 리디자인
- Community 내부 세그먼트 완성도 작업

#### 3-6. 참고 문서

- [내비게이션/IA](./ui-navigation-and-ia.md)
- [화면 템플릿](./ui-screen-templates.md)

---

### Phase 4: 상위 화면 Shell 정렬

> 상위 화면들을 먼저 같은 제품군처럼 보이게 만드는 단계다. 이 단계에서는 구조와 분위기가 우선이고, 실데이터 완성도가 우선순위가 아니다.

#### 4-1. 범위

- Campus / Taxi / Notice / Community / My의 레이아웃 shell
- 헤더 구조
- 섹션 간격
- 기본 배경, 스크롤, 공통 패딩 정렬

#### 4-2. 구현 항목


| #   | 항목              | 설명                                          |
| --- | --------------- | ------------------------------------------- |
| 1   | Campus shell    | brand header + section stack                |
| 2   | Taxi shell      | hero + chip row + CTA + card list skeleton  |
| 3   | Notice shell    | unread banner + filter row + list structure |
| 4   | Community shell | header + segment + board/chat shell         |
| 5   | My shell        | profile + stats + grouped sections          |


#### 4-3. 산출물

- 구조가 정리된 상위 화면 skeleton
- 공통 패턴 위에 올라간 상위 화면 틀

#### 4-4. 완료 기준

- 모든 상위 화면이 동일한 foundation 위에 올라가 있어야 한다.
- 아직 데이터가 덜 붙어도 Figma와 구조/위계는 거의 맞아야 한다.
- 화면 간 헤더, 배경, padding, 카드 체계가 일관돼야 한다.

#### 4-5. 비범위

- 각 화면의 세부 상태 처리 완성
- 실제 데이터 정합성 최종화
- 상세 화면 리디자인

#### 4-6. 참고 문서

- [화면 템플릿](./ui-screen-templates.md)
- [공통 컴포넌트 명세](./ui-component-spec.md)

---

### Phase 5: Notice 상위 화면

> 공지 소비 경험을 먼저 고도화해, 리스트/칩/배지 패턴을 검증하는 단계다.

#### 5-1. 범위

- Notice 메인 상위 화면
- unread banner
- category chip row
- notice list item 패턴

#### 5-2. 구현 항목


| #   | 항목                | 설명                                         |
| --- | ----------------- | ------------------------------------------ |
| 1   | Header 적용         | 타이틀 + 우측 액션 정렬                             |
| 2   | unread banner 구현  | soft green banner + CTA                    |
| 3   | category chips 구현 | selected/default 상태 반영                     |
| 4   | list item 재구성     | unread dot, category, date, title, chevron |
| 5   | 목록 밀도 정리          | 기존보다 빠르게 스캔 가능한 구조로 수정                     |


#### 5-3. 완료 기준

- 한 화면에서 공지 리스트를 빠르게 스캔할 수 있어야 한다.
- unread 상태와 category 정보가 즉시 구분되어야 한다.
- Figma Notice 프레임과 구조/밀도가 크게 다르지 않아야 한다.

#### 5-4. 비범위

- 공지 상세 화면
- 웹뷰 상세 화면
- 학생회/동아리/AI 공지 확장 기능

#### 5-5. 참고 문서

- [화면 템플릿](./ui-screen-templates.md)
- [콘텐츠 규칙](./ui-content-rules.md)

---

### Phase 6: Community 상위 화면

> 게시판과 채팅을 하나의 정보군으로 통합하되, 상호작용은 명확히 분리하는 단계다.

#### 6-1. 범위

- Community 메인 상위 화면
- `게시판 / 채팅` 세그먼트
- 게시글 피드
- 채팅방 리스트
- 게시판 FAB

#### 6-2. 구현 항목


| #   | 항목                  | 설명                  |
| --- | ------------------- | ------------------- |
| 1   | Community header 적용 | 타이틀 + 액션 정리         |
| 2   | 세그먼트 구현             | 게시판/채팅 active state |
| 3   | 인기 게시글 카드 구현        | board featured card |
| 4   | 일반 게시글 피드 구현        | feed card 패턴        |
| 5   | 채팅방 리스트 구현          | room item 패턴        |
| 6   | FAB 적용              | 게시판 세그먼트에만 노출       |


#### 6-3. 완료 기준

- `게시판`과 `채팅`이 같은 제품군처럼 보이면서도, 정보 구조는 분리되어야 한다.
- 채팅 세그먼트는 room list 중심 구조를 가져야 한다.
- 게시판은 featured + feed 구조, 채팅은 room list 구조로 명확히 구분되어야 한다.

#### 6-4. 비범위

- 게시글 상세 / 작성 / 수정
- 실제 채팅방 상세 UI
- 실시간 메시지 동기화 UX 고도화

#### 6-5. 참고 문서

- [내비게이션/IA](./ui-navigation-and-ia.md)
- [화면 템플릿](./ui-screen-templates.md)
- [공통 컴포넌트 명세](./ui-component-spec.md)

---

### Phase 7: My 상위 화면

> 글로벌 목적지로서의 `MY`를 정리하는 단계다.

#### 7-1. 범위

- My 메인 상위 화면
- 프로필 요약
- stats card
- grouped list
- 로그아웃 CTA

#### 7-2. 구현 항목


| #   | 항목                   | 설명                     |
| --- | -------------------- | ---------------------- |
| 1   | 프로필 hero 구현          | 아바타, 이름, 학과/학년, 프로필 수정 |
| 2   | stats card 3종 구현     | 작성 글 / 북마크 / 택시 이용     |
| 3   | 내 활동 grouped list 구현 | 내가 쓴 글, 북마크, 택시 이용 내역  |
| 4   | 설정 grouped list 구현   | 알림 설정, 계좌 관리, 앱 설정     |
| 5   | 로그아웃 CTA 적용          | destructive tone       |


#### 7-3. 완료 기준

- My 화면이 현재 상세 프로필 페이지보다 `글로벌 목적지형 정보 구조`를 가져야 한다.
- grouped list와 stats card 패턴이 공통 컴포넌트 기반으로 구현돼야 한다.
- Figma My 프레임과 위계가 유사해야 한다.

#### 7-4. 비범위

- 계좌 관리 상세
- 알림 설정 상세
- 프로필 편집 상세

#### 7-5. 참고 문서

- [화면 템플릿](./ui-screen-templates.md)
- [공통 컴포넌트 명세](./ui-component-spec.md)

---

### Phase 8: Taxi 상위 화면

> 행동 중심 UI를 가장 강하게 드러내는 상위 화면 단계다.

#### 8-1. 범위

- Taxi 메인 상위 화면
- 지도/검색 hero
- 위치 필터칩
- 메인 CTA
- 파티 카드 리스트

#### 8-2. 구현 항목


| #   | 항목                 | 설명                 |
| --- | ------------------ | ------------------ |
| 1   | Header 정렬          | 타이틀 + 우측 액션        |
| 2   | hero 영역 구현         | 지도/검색 입력/배경 구조     |
| 3   | filter chip row 구현 | 전체/안양역/범계역 등       |
| 4   | primary CTA 구현     | 새 파티 만들기           |
| 5   | taxi party card 구현 | 시간, 상태, 경로, 인원, 요금 |


#### 8-3. 완료 기준

- CTA가 즉시 인지돼야 한다.
- 카드에서 `출발 시간 / 상태 / 경로 / 인원 / 요금`의 위계가 명확해야 한다.
- 기존 TaxiScreen보다 행동 중심성이 강화되어야 한다.

#### 8-4. 비범위

- 모집 화면
- 참여 대기 화면
- 파티 채팅
- 정산 / 종료 상태 화면

#### 8-5. 참고 문서

- [화면 템플릿](./ui-screen-templates.md)
- [상태/인터랙션 규칙](./ui-states-and-interactions.md)

---

### Phase 9: Campus 상위 화면

> 여러 모듈을 조합하는 허브 화면을 마지막에 구현하는 단계다.

#### 9-1. 범위

- Campus 메인 상위 화면
- brand header
- unread notice preview
- timetable preview
- taxi preview
- cafeteria preview
- calendar preview
- quick menu

#### 9-2. 구현 항목


| #   | 항목                       | 설명                   |
| --- | ------------------------ | -------------------- |
| 1   | brand header 구현            | `SKURI` 워드마크 + profile 진입 |
| 2   | unread notice preview 구현 | compact preview card |
| 3   | timetable preview 구현     | 오늘 시간표 요약            |
| 4   | taxi preview 구현          | 모집 중인 택시 요약          |
| 5   | cafeteria preview 구현     | 오늘의 학식 카드            |
| 6   | calendar preview 구현      | 다가오는 일정              |
| 7   | quick menu 구현            | 4개 기능 진입 아이콘         |


#### 9-3. 완료 기준

- Campus가 기능 나열형 페이지가 아니라 요약 허브처럼 보여야 한다.
- 모듈 간 중요도 차이가 위계로 드러나야 한다.
- Minecraft는 이 화면에 포함되지 않아야 한다.

#### 9-4. 비범위

- Minecraft 재배치
- 시간표/학식/학사일정 상세 화면
- 부가 기능 추가 확장

#### 9-5. 참고 문서

- [화면 템플릿](./ui-screen-templates.md)
- [Figma 테마 분석 및 계획](./figma-theme-analysis-and-plan.md)

---

### Phase 10: 하위 화면(Depth 2+) 확장

> 상위 화면에서 진입하는 2뎁스 이상 화면을 새 시스템으로 전파하는 단계다.

#### 10-1. 범위

- 공지 상세
- 게시글 상세 / 글쓰기 / 수정
- 채팅방 상세
- 택시 상세 플로우
- 시간표 상세
- 설정/기타 depth 2+ 화면

#### 10-2. 구현 순서


| 우선순위 | 항목                |
| ---- | ----------------- |
| 1    | 공지 상세             |
| 2    | 게시글 상세 / 글쓰기 / 수정 |
| 3    | 채팅방 상세            |
| 4    | 택시 상세 플로우         |
| 5    | 시간표 상세            |
| 6    | 기타 설정/서브 화면       |


#### 10-3. 완료 기준

- 상위에서 하위로 들어갔을 때 톤이 갑자기 바뀌지 않아야 한다.
- 새 foundation과 공통 컴포넌트를 재사용하고 있어야 한다.
- 상위 화면에서 확정한 패턴을 하위 화면이 깨지 않아야 한다.

#### 10-4. 비범위

- 범위 밖 신규 기능 추가
- Minecraft 재편입
- AI 공지 도우미 실구현

#### 10-5. 참고 문서

- [화면 템플릿](./ui-screen-templates.md)
- [오픈 이슈](./open-questions.md)

---

### Phase 11: 안정화 / 검증 / 정리

> 마지막으로 시각적 회귀, 토큰 혼재, 임시 구현 잔재를 정리하는 단계다.

#### 11-1. 범위

- lint
- Figma 대조
- 중복 스타일 제거
- 임시 호환 코드 제거
- 문서 상태 갱신

#### 11-2. 구현 항목


| #   | 항목              | 설명                     |
| --- | --------------- | ---------------------- |
| 1   | lint 수행         | `yarn lint`            |
| 2   | 상위 화면 Figma 대조  | 구조/위계/컬러/간격 점검         |
| 3   | 다크 토큰 잔재 제거     | 불필요한旧 스타일 정리           |
| 4   | 중복 primitive 정리 | 화면별 ad-hoc 컴포넌트 축소     |
| 5   | 문서 갱신           | Phase 완료 상태 및 오픈 이슈 갱신 |


#### 11-3. 완료 기준

- 주요 진입 흐름이 모두 정상 동작해야 한다.
- foundation과 화면 구현이 문서와 크게 어긋나지 않아야 한다.
- 새 토큰 체계와旧 스타일이 혼재되지 않아야 한다.

#### 11-4. 비범위

- 새로운 기획 추가
- Figma에 없는 화면 정책 임의 확정

#### 11-5. 참고 문서

- [README](./README.md)
- [오픈 이슈](./open-questions.md)

---

## 4. Phase 간 의존 관계

```text
Phase 0
  -> Phase 1
  -> Phase 2

Phase 1
  -> Phase 2
  -> Phase 3
  -> Phase 4~11

Phase 2
  -> Phase 3
  -> Phase 4~11

Phase 3
  -> Phase 4
  -> Phase 5~11

Phase 4
  -> Phase 5
  -> Phase 6
  -> Phase 7
  -> Phase 8
  -> Phase 9

Phase 5, 6, 7, 8
  -> Phase 9

Phase 5~9
  -> Phase 10

Phase 10
  -> Phase 11
```

### 건너뛰면 안 되는 의존 관계

- `Phase 1` 없이 화면 구현 시작 금지
- `Phase 2` 없이 screen-specific primitive 양산 금지
- `Phase 3` 없이 4탭 구조를 전제로 한 상위 화면 구현 금지
- `Phase 9 Campus`는 `Phase 5~8`보다 먼저 구현하지 않는 것을 원칙으로 한다

---

## 5. 각 Phase의 내부 구현 순서 (공통 패턴)

각 Phase는 가능한 아래 순서를 따른다.

1. 관련 Figma 프레임 / companion 문서 재확인
2. 범위 밖 항목이 섞이지 않았는지 확인
3. foundation/primitive 재사용 가능 여부 먼저 확인
4. shell/layout 구현
5. 실제 데이터/상호작용 연결
6. 상태(loading/empty/error/unread/selected) 반영
7. lint 및 Figma 대조
8. 관련 문서 상태 갱신

이 순서를 따르지 않으면, 화면 완성도는 올라가도 재사용성과 일관성이 무너질 가능성이 높다.

---

## 6. Codex 실행 규칙

이 섹션은 다른 스레드의 Codex가 이 문서만 읽고도 같은 기준으로 작업하도록 만드는 실행 규칙이다.

### 6.1 문서 읽기 순서

다른 스레드의 Codex는 UI 2.0 작업 시작 전에 반드시 아래 순서로 문서를 읽는다.

1. `docs/ui-redesign/implementation-roadmap.md`
2. `docs/ui-redesign/ui-navigation-and-ia.md`
3. `docs/ui-redesign/figma-reference.md`
4. `docs/ui-redesign/ui-foundations.md`
5. `docs/ui-redesign/token-migration-strategy.md`
6. `docs/ui-redesign/ui-component-spec.md`
7. `docs/ui-redesign/component-ownership.md`
8. `docs/ui-redesign/ui-screen-templates.md`
9. `docs/ui-redesign/screen-acceptance-checklist.md`
10. `docs/ui-redesign/ui-content-rules.md`
11. `docs/ui-redesign/open-questions.md`
12. 필요 시 `docs/ui-redesign/figma-theme-analysis-and-plan.md`

### 6.2 문서 우선순위

문서 간 충돌이 있으면 아래 우선순위를 따른다.

1. `implementation-roadmap.md`
2. `ui-navigation-and-ia.md`
3. `figma-reference.md`
4. `ui-foundations.md`
5. `token-migration-strategy.md`
6. `ui-component-spec.md`
7. `component-ownership.md`
8. `ui-screen-templates.md`
9. `screen-acceptance-checklist.md`
10. `ui-content-rules.md`
11. `figma-theme-analysis-and-plan.md`
12. `open-questions.md`

`open-questions.md`는 확정 문서가 아니라 보류 문서이므로, 확정값보다 우선하지 않는다.

### 6.3 미정 사항 처리 원칙

- 문서에 없는 정책을 임의로 확정하지 않는다.
- `open-questions.md`에 해당 항목이 있으면 구현 전에 사용자 확인이 필요하다.
- Figma에 보이더라도 문서에서 의도적으로 보류한 항목은 바로 구현하지 않는다.

### 6.4 범위 통제 원칙

- 상위 화면 Phase에서 depth 2+ 화면을 함께 손대지 않는다.
- Minecraft 기능을 새 IA에 임의 편입하지 않는다.
- foundation phase에서 화면 완성을 시도하지 않는다.
- primitive phase에서 screen-specific component를 먼저 만들지 않는다.

### 6.5 Figma 대조 원칙

- canonical 링크와 node 기준은 `figma-reference.md`를 우선 사용한다.
- 모든 상위 화면 구현은 해당 Figma 프레임과 시각적으로 대조해야 한다.
- 대조 포인트는 최소 아래 항목을 포함한다.
  - 구조
  - 간격
  - 컬러 위계
  - 타이포 위계
  - 상태 표현

### 6.6 현재 의존성 버전 기준 라이브러리 확인 원칙

- 외부 라이브러리 API를 새로 사용할 때는 먼저 현재 저장소의 `package.json` 기준 버전을 확인한다.
- 버전 차이에 따라 사용법이 달라질 가능성이 있는 라이브러리는, 구현 전에 Context7 MCP 또는 해당 라이브러리의 공식 문서를 확인한다.
- Context7 MCP를 사용할 때는 가능하면 현재 설치된 major/minor 버전에 맞는 문서를 우선 사용한다.
- 정확한 버전 문서를 찾지 못하면 가장 가까운 공식 문서를 사용하되, 차이가 생길 수 있는 부분은 구현 결과 보고에 가정으로 명시한다.
- 다른 블로그, 예전 예제, 임의의 Stack Overflow 코드보다 현재 저장소 버전과 공식/1차 문서를 우선한다.
- 특히 아래 라이브러리는 버전 mismatch 가능성이 높으므로 확인 없이 API를 추정하지 않는다.
  - `react-native`
  - `react`
  - `@react-navigation/native`
  - `@react-navigation/bottom-tabs`
  - `@react-navigation/native-stack`
  - `react-native-reanimated`
  - `react-native-gesture-handler`
  - `@gorhom/bottom-sheet`
  - `react-native-safe-area-context`
  - `@react-native-firebase/*`
  - `react-native-svg`
  - `react-native-vector-icons`

### 6.7 완료 후 검증 원칙

- 코드 수정 후 `yarn lint`를 기본 검증으로 수행한다.
- 가능하면 변경 화면을 실행 기준으로 점검한다.
- Phase 완료 시 관련 문서 상태를 같이 갱신한다.

---

## 7. 문서 동기화 규칙

UI 2.0 구현 중 문서와 코드가 갈라지지 않게 하기 위한 규칙이다.

### 7.1 foundation 변경 시

다음 문서를 함께 확인/갱신한다.

- `ui-foundations.md`
- `ui-component-spec.md`
- 필요 시 `ui-states-and-interactions.md`

### 7.2 IA 변경 시

다음 문서를 함께 확인/갱신한다.

- `ui-navigation-and-ia.md`
- `ui-screen-templates.md`
- `README.md`

### 7.3 상위 화면 템플릿 변경 시

다음 문서를 함께 확인/갱신한다.

- `ui-screen-templates.md`
- 필요 시 `ui-component-spec.md`

### 7.4 보류 이슈 해소 시

다음 순서로 갱신한다.

1. `open-questions.md`에서 제거 또는 상태 변경
2. 확정 문서 반영
3. `implementation-roadmap.md`에서 Phase/범위 갱신

---

## 8. 단계별 PR 전략

리팩터링은 한 번에 크게 묶지 않는다.  
리뷰 가능한 작은 단위로 분리한다.

### 권장 분리 단위

- PR 1: Phase 1 foundation tokens
- PR 2: Phase 2 공통 UI primitives
- PR 3: Phase 3 navigation / app shell
- PR 4: Phase 4 상위 화면 shell 정렬
- PR 5: Phase 5 Notice 상위 화면
- PR 6: Phase 6 Community 상위 화면
- PR 7: Phase 7 My 상위 화면
- PR 8: Phase 8 Taxi 상위 화면
- PR 9: Phase 9 Campus 상위 화면
- PR 10+: Phase 10 depth 2+ 확장
- 마지막 PR: Phase 11 안정화

각 PR은 한 줄로 목적을 설명할 수 있어야 한다.

---

## 9. 참고 문서

- [README](./README.md)
- [Figma 테마 분석 및 계획](./figma-theme-analysis-and-plan.md)
- [UI Foundations](./ui-foundations.md)
- [상태/인터랙션 규칙](./ui-states-and-interactions.md)
- [내비게이션/IA](./ui-navigation-and-ia.md)
- [공통 컴포넌트 명세](./ui-component-spec.md)
- [화면 템플릿](./ui-screen-templates.md)
- [콘텐츠 규칙](./ui-content-rules.md)
- [오픈 이슈](./open-questions.md)
- [로드맵 작성 계획](./implementation-roadmap-authoring-plan.md)

---

## 10. 이 문서의 사용 방식

이 문서는 UI 2.0 구현의 1차 진입 문서다.

다른 스레드의 Codex는 다음처럼 행동해야 한다.

1. 먼저 이 문서를 읽는다.
2. 현재 자신이 수행할 Phase를 확인한다.
3. 해당 Phase의 companion 문서를 읽는다.
4. out-of-scope를 확인한다.
5. 코드 구현 후 lint와 문서 갱신까지 수행한다.

즉, 이 문서는 `설명 문서`가 아니라 `실행 기준 문서`로 사용한다.
