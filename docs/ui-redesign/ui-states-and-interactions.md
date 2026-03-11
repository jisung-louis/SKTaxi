# UI States And Interactions

작성일: 2026-03-10

## 1. 목적

이 문서는 상위 화면에서 반복되는 상태 표현과 상호작용 규칙을 정의한다.

## 2. 기본 상태 체계

## 2.1 기본 상태

- `default`
- `selected`
- `active`
- `inactive`
- `disabled`
- `unread`
- `destructive`

React Native 특성상 hover 상태는 기본 기준에서 제외한다.

## 2.2 칩 / 필터 상태

### selected

- 배경: `accent.green`
- 텍스트: white
- border 추가 강조 없음

### default

- 배경: `bg.subtle`
- 텍스트: `text.secondary`

### disabled

- 현재 상위 Figma에서 명시적 예시 없음
- 구현 시 opacity로만 처리하지 말고 명도 차이도 함께 설계해야 함
- 최종 수치는 별도 확정 필요

## 2.3 하단 탭 상태

### active

- 아이콘: green
- 라벨: green

### inactive

- 아이콘: `text.quaternary`
- 라벨: `text.quaternary`

## 2.4 Community 세그먼트 상태

### active

- 텍스트: green
- 하단 보더: `2px` green

### inactive

- 텍스트: `text.quaternary`
- 하단 보더 없음

## 2.5 공지 읽음 상태

### unread

- 좌측 green dot 사용
- 캠퍼스 상단 요약 카드와 공지 리스트의 핵심 상태 표현

### read

- dot 제거
- 제목 weight 또는 메타 강조 완화 가능
- 정확한 read style 차이는 상세 구현 시 확정

## 2.6 배지 상태

### unread count badge

- 배경: green
- 텍스트: white
- 형태: 원형 또는 full pill

### taxi recruit status

- `모집중`
  - soft green background
  - green text

- `마감`
  - neutral background
  - neutral text

## 2.7 파괴적 액션

- 텍스트: red
- 배경은 white 또는 neutral surface 유지
- 예: 로그아웃

## 3. 화면별 상호작용 원칙

## 3.1 Campus

- 요약 섹션은 상세 화면으로 이동시키는 entry point 역할
- 허브는 정보 탐색용이며, 깊은 편집/소비는 전용 화면으로 넘긴다

## 3.2 Taxi

- CTA는 항상 명확해야 한다
- 파티 카드의 전체 영역이 상세/참여 진입점 역할을 맡는다
- 필터 변경은 즉시 리스트에 반영되는 구조가 적합하다

## 3.3 Notice

- 빠른 스캔이 우선
- 리스트 아이템 탭 시 상세로 진입
- 필터칩은 상단 고정 또는 상단에 가까운 위치 유지가 바람직하다

## 3.4 Community

- `게시판 / 채팅` 세그먼트 전환은 탭 전환이 아니라 같은 정보군 내 모드 전환으로 취급
- 게시판만 FAB를 가진다
- 채팅 세그먼트는 FAB 없이 room item 클릭이 핵심 상호작용이다

## 3.5 My

- 카드보다 grouped list 탐색이 핵심
- 모든 item은 우측 chevron을 통해 이동성 표시

## 4. 상태 표현 우선순위

하나의 컴포넌트에 상태가 여러 개 겹칠 때는 아래 순서를 우선한다.

1. destructive
2. unread / 모집중 같은 도메인 상태
3. selected / active
4. default

예를 들어, 안읽은 채팅방은 inactive보다 unread가 먼저 보여야 한다.

## 5. 모션 원칙

상위 Figma 프레임에는 모션 정보가 포함되어 있지 않다. 따라서 현재 문서에서는 수치를 확정하지 않는다.

다만 원칙은 먼저 고정한다.

- 큰 이동보다는 짧고 조용한 전환
- 탭/세그먼트는 즉시 인지 가능한 수준의 최소 모션
- 정보 소비 화면에서는 과한 spring 금지
- badge, filter, tab active state는 빠른 반응 우선

모션 수치와 easing은 별도 확정 전까지 `보류`로 둔다.

## 6. 로딩 / 에러 / 빈 상태

상위 Figma 기준으로는 구체 시안이 없으므로 아래 수준까지만 규정한다.

- 로딩: 정보 구조를 깨지 않는 간단한 대기 상태
- 에러: 한 문장 + 재시도
- 빈 상태: 행동 가능한 다음 액션 제시

세부 문구와 비주얼은 구현 전 별도 확정이 필요하다.

## 7. 접근성 상호작용 원칙

- 아이콘 단독 버튼은 항상 접근성 라벨 필요
- 칩과 세그먼트는 선택 여부를 스크린리더에서 구분 가능해야 함
- unread badge는 숫자만 읽히지 않고 의미가 전달돼야 함
- 터치 영역은 시각 크기보다 넓게 확보해야 함
