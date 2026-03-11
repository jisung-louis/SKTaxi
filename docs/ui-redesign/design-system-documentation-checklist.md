# SKURI 구현 전 문서화 체크리스트

작성일: 2026-03-10

## 1. 목적

이 문서는 상위 화면 리팩터링에 들어가기 전에 어떤 기준을 먼저 문서화해야 하는지 정리한 체크리스트다.

핵심 목표는 다음과 같다.

- 화면마다 스타일이 조금씩 달라지는 문제 방지
- 공통 컴포넌트 설계 기준 선확정
- 구현 전에 의사결정 비용 축소

## 2. 우선 문서화할 묶음

## 2.1 Foundation

가장 먼저 정리해야 한다.

- 컬러 팔레트
- 시맨틱 컬러 토큰
- 타이포그래피 스케일
- spacing scale
- radius scale
- border 규칙
- shadow/elevation 규칙
- opacity 규칙

## 2.2 Interaction

상태 표현과 전환 기준을 먼저 잡아야 한다.

- 선택/비선택
- 활성/비활성
- 안읽음/읽음
- 모집중/마감/대기
- 로딩/에러/빈 상태
- pressed/focused/disabled state
- 세그먼트 전환 규칙
- 탭 전환 규칙

## 2.3 Layout

화면 구조를 반복 가능하게 만들어야 한다.

- 헤더 높이/패딩
- 본문 기본 패딩
- 섹션 간 간격
- 카드 내부 패딩
- 리스트 item 높이 규칙
- FAB 위치 규칙
- 하단 탭바 높이/여백 기준
- safe area 처리 기준

## 2.4 Components

공통 컴포넌트는 구현 전에 설계명세가 있으면 좋다.

- AppHeader
- SectionHeader
- FilterChip
- CategoryTag
- StatusBadge
- ElevatedCard
- GroupedList / GroupedListItem
- FeedCard
- ChatRoomListItem
- FloatingActionButton
- StatsCard
- EmptyState
- ErrorState

## 2.5 Screen Templates

상위 화면별 반복 패턴을 문서화하면 구현 속도가 빨라진다.

- Campus module template
- Taxi party card template
- Notice list item template
- Community post card template
- Community chat room item template
- My grouped section template

## 2.6 Content Rules

디자인이 아니라 실제 데이터 표현 기준이다.

- 날짜 포맷
- 시간 포맷
- 인원 수 표기
- 금액 표기
- 말줄임 규칙
- 라벨 길이 제한
- 빈 데이터 대체 문구
- 배지 숫자 최대 표기 규칙

## 2.7 Accessibility

나중에 붙이면 비용이 커진다.

- 최소 터치 영역
- 텍스트 대비 기준
- 아이콘 단독 버튼 라벨링
- 스크린리더 label 규칙
- Dynamic Type 대응 범위

## 2.8 Navigation & IA

화면 구현 전 반드시 고정해야 할 값들이다.

- 4탭 구조 정의
- 글로벌 MY 진입 규칙
- Community 내부 세그먼트 구조
- 상위 화면과 상세 화면의 책임 분리
- Minecraft 기능 보류 정책

## 3. 추천 문서 세트

실제로는 아래 6개 문서 정도로 나누면 관리가 쉽다.

1. `ui-foundations.md`
   - color, typography, spacing, radius, shadow

2. `ui-states-and-interactions.md`
   - 상태, 인터랙션, 모션

3. `ui-navigation-and-ia.md`
   - 탭 구조, 글로벌 MY, 상위/하위 화면 책임

4. `ui-component-spec.md`
   - 공통 컴포넌트 정의와 props 개념

5. `ui-screen-templates.md`
   - Campus/Taxi/Notice/Community/My 템플릿

6. `ui-content-rules.md`
   - 날짜/시간/금액/문구/말줄임 규칙

## 4. 구현 전 최소 확정 세트

시간이 부족하면 아래 항목만 먼저 확정해도 된다.

1. 시맨틱 컬러 토큰
2. 타이포그래피 스케일
3. spacing/radius/shadow
4. AppHeader / Chip / Card / Badge / FAB 명세
5. 4탭 구조와 글로벌 MY 진입 규칙
6. Notice / Community / ChatRoom / TaxiCard 템플릿

## 5. 이 문서의 활용 방식

구현 전에는 아래 순서로 진행하는 것이 좋다.

1. Foundation 문서 확정
2. 공통 컴포넌트 명세 확정
3. 상위 화면 템플릿 확정
4. 실제 화면 구현 시작

이 순서를 지키면 화면 구현 중 토큰과 컴포넌트가 뒤집히는 일을 줄일 수 있다.
