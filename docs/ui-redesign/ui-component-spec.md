# UI Component Spec

작성일: 2026-03-10

## 1. 목적

이 문서는 상위 화면 리팩터링에 공통으로 쓰일 컴포넌트의 명세 초안을 정의한다.

## 2. AppHeader

### 역할

- 화면 제목과 우측 액션 제공
- 상위 화면 공통 헤더

### 규칙

- 높이: 실질 영역 `56`
- 배경: white
- 하단 border: `border.default`
- 제목 스타일: `title.screen`
- 우측 액션 버튼은 32 컨테이너 기준

### 변형

- `title only`
- `title + single action`
- `title + double action`
- `title + back`
- `brand + profile`는 Campus 전용 헤더로 별도 파생 가능

## 3. SectionHeader

### 역할

- 섹션 제목과 우측 텍스트 액션 연결

### 규칙

- 좌측: `title.section`
- 우측: `body.medium` 또는 `meta.medium`
- 기본 높이: `24` 또는 2줄형 `42`

## 4. FilterChip

### 역할

- 공지 카테고리, 택시 필터, 기타 상단 필터

### 규칙

- 높이: `36`
- 좌우 padding: `16`
- radius: full
- selected: green fill
- default: subtle fill

## 5. CategoryTag

### 역할

- 학사, 장학, 취업, 시설 같은 카테고리 라벨

### 규칙

- 높이: `20` 기본
- padding: `8 x 2`
- radius: `4`
- small meta text 사용

### 상태

- `academic`
- `scholarship`
- `career`
- `facility`
- `event`

`event`의 정확한 색 토큰은 후속 확정이 필요하다.

## 6. StatusBadge

### 역할

- 택시 모집 상태
- unread count
- 기타 상태 표시

### 변형

- `pill`
  - 모집중, 마감
- `count circle`
  - unread count

### 규칙

- 택시 pill: 높이 `28`
- count badge: `20 x 20`

## 7. ElevatedCard

### 역할

- 대부분의 기본 카드 컨테이너

### 규칙

- 배경: white
- radius: `16`
- shadow: `shadow.card`
- 내부 padding 기본: `16`

## 8. GroupedList

### 역할

- MY > 활동, MY > 설정 같은 묶음형 메뉴

### 규칙

- 외곽 카드: white + radius `16`
- 각 item 높이: `72~73`
- 내부 divider: subtle border
- 좌측 icon box: `40 x 40`, subtle background
- 우측 chevron 고정

## 9. StatsCard

### 역할

- MY 통계 카드

### 규칙

- 높이: `84`
- radius: `12`
- 중앙 정렬
- 상단 숫자, 하단 라벨

## 10. FeedCard

### 역할

- 게시글 피드 카드

### 변형

- `featured`
  - 인기 게시글용
  - gradient 또는 soft tinted background

- `default`
  - 일반 게시글 목록용

### 규칙

- featured는 상단 강조 전용
- default는 white 카드
- 제목 1줄
- 본문 1~2줄
- 하단 메타 바 존재

## 11. ChatRoomListItem

### 역할

- Community > Chat 목록 item

### 구조

- 좌측 48 원형/soft 아이콘
- 중앙 텍스트 묶음
  - 방 이름
  - 마지막 메시지
  - 인원 수
- 우측 메타 묶음
  - 시간
  - unread badge

### 규칙

- 높이: `96`
- radius: `16`
- shadow: `shadow.card`
- 마지막 메시지는 1줄 고정

## 12. TaxiPartyCard

### 역할

- Taxi 리스트 핵심 카드

### 구조

- 상단: 출발 시간 + 상태
- 중단: 출발지 -> 목적지
- 하단: 파티장, 인원 수, 예상 요금

### 규칙

- radius: `16`
- 내부 패딩: `17` 수준
- 요금은 우측 정렬, bold

## 13. NoticeListItem

### 역할

- 공지 리스트 item

### 구조

- unread dot
- category tag
- date
- title
- chevron

### 규칙

- 공지 소비 효율 우선
- title은 1줄 우선
- Notice 메인용은 grouped list row, Campus용은 preview row로 분리하되 정보 위계는 동일 계열을 유지한다.

## 14. FloatingActionButton

### 역할

- Community 게시판에서 글쓰기 액션

### 규칙

- 크기: `56`
- 배경: green
- 그림자: `shadow.fab`
- 위치: 우하단

### 주의

- Community > Chat에서는 사용하지 않는다.

## 15. QuickMenuItem

### 역할

- Campus 하단 빠른 메뉴

### 구조

- 상단 아이콘 컨테이너 `56`
- 하단 라벨 `12`

### 규칙

- 메뉴별 배경 톤만 다르고 구조는 동일해야 한다.

## 16. CampusBrandHeader

### 역할

- Campus 상단의 브랜드 워드마크와 프로필 진입 제공

### 구조

- 좌측 `SKURI` 워드마크
- 우측 36 원형 프로필 버튼

### 규칙

- 일반 `AppHeader`와 높이 리듬은 공유하되 title typography는 공유하지 않는다.
- 워드마크는 일반 bold text가 아니라 brand treatment로 취급한다.
- 워드마크 컬러는 `brand.wordmark`를 사용한다.
- 구현은 텍스트 렌더링이 아니라 SVG/이미지 자산 사용을 기본값으로 한다.
- 좌측 영역은 추후 로고/앱 아이콘 조합을 수용할 수 있게 확장 여지를 둔다.

## 17. UnreadNoticeBanner

### 역할

- Notice 메인 상단의 unread 상태 요약

### 구조

- 좌측 bell icon + 제목/보조 문구
- 우측 `보기` CTA

### 규칙

- soft green surface 사용
- 일반 카드와 분리된 상태성 컴포넌트로 관리

## 18. TopSegmentTabs

### 역할

- Community 내부 `게시판 / 채팅` 전환

### 규칙

- 높이: `54`
- active: green text + `2px` 하단 보더
- inactive: tertiary text
- header 바로 아래 붙는 구조를 기본값으로 한다.

## 19. CompactTaxiPreviewItem

### 역할

- Campus 안의 `모집 중인 택시` preview item

### 구조

- 좌측 route label
- 중앙 출발 시간
- 우측 인원 수 / chevron

### 규칙

- Taxi 메인 카드보다 정보 밀도를 낮춘다.
- Campus 안에서는 카드가 아니라 1줄 preview 반복을 우선한다.

## 20. 구현 우선순위

아래 순서로 만들면 효율이 좋다.

1. AppHeader
2. CampusBrandHeader / TopSegmentTabs
3. ElevatedCard
4. FilterChip
5. CategoryTag / StatusBadge
6. GroupedList / UnreadNoticeBanner
7. NoticeListItem / TaxiPartyCard / CompactTaxiPreviewItem / FeedCard / ChatRoomListItem
8. FAB / QuickMenuItem
