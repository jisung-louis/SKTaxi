# UI Screen Templates

작성일: 2026-03-10

## 1. 목적

상위 화면을 구현할 때 반복 가능한 구조를 먼저 정의한다.

## 2. Campus Template

## 2.1 역할

- 오늘 필요한 정보를 빠르게 요약하는 캠퍼스 허브

## 2.2 기본 구조

1. Brand header
2. 읽지 않은 공지
3. 오늘 시간표
4. 모집 중인 택시
5. 오늘의 학식
6. 다가오는 일정
7. 빠른 메뉴
8. Bottom tab

## 2.3 구현 메모

- `Greeting` 섹션은 없다. 상단은 `SKURI` 워드마크가 대신한다.
- 택시는 요약형 모듈만 노출
- 시간표는 기본 접힘 상태와 야간수업 확장 상태를 모두 지원해야 한다.
- Minecraft는 포함하지 않음
- 각 모듈은 상세 진입을 위한 preview 역할만 수행

## 3. Taxi Template

## 3.1 역할

- 탐색과 행동이 가장 빠르게 이뤄져야 하는 화면

## 3.2 기본 구조

1. Header
2. 지도/검색 hero
3. 위치 필터칩
4. 메인 CTA
5. 모집 중인 파티 섹션
6. 파티 카드 리스트
7. Bottom tab

## 3.3 구현 메모

- 지도는 실제 상호작용보다 search hero 역할이 우선이다.
- CTA는 화면 상단부에서 빠르게 인지돼야 함
- 카드 정보 위계는 `시간 > 상태 > 경로 > 인원/요금`

## 4. Notice Template

## 4.1 역할

- 빠른 스캔 중심의 정보 소비 화면

## 4.2 기본 구조

1. Header
2. 읽지 않은 공지 배너
3. 카테고리 필터칩
4. grouped list형 공지 리스트
5. Bottom tab

## 4.3 구현 메모

- 리스트 밀도 우선
- 큰 hero 카드보다는 row 반복 구조 우선
- Campus의 공지 preview와 정보 위계는 공유하지만, 색과 압축 정도는 다르다.

## 5. Community Board Template

## 5.1 역할

- 게시판 피드 탐색

## 5.2 기본 구조

1. Header
2. Segment tabs: 게시판 / 채팅
3. 인기 게시글 섹션
4. 일반 게시글 피드
5. FAB
6. Bottom tab

## 5.3 구현 메모

- 인기 게시글은 featured card
- 일반 피드는 반복 card
- header 아래 top segment가 바로 붙는다.
- FAB는 게시판에서만 노출

## 6. Community Chat Template

## 6.1 역할

- 공개 채팅방 탐색

## 6.2 기본 구조

1. Header
2. Segment tabs: 게시판 / 채팅
3. 채팅방 리스트
4. Bottom tab

## 6.3 구현 메모

- 피드가 아니라 room list 구조
- 채팅방 item은 96 카드 반복
- unread badge와 마지막 메시지가 핵심 정보
- FAB는 없다

## 7. My Template

## 7.1 역할

- 개인 정보, 활동, 설정의 글로벌 목적지

## 7.2 기본 구조

1. Header with back button
2. 프로필 요약
3. 통계 카드 3개
4. `내 활동` grouped section
5. `설정` grouped section
6. 로그아웃 CTA
7. Bottom tab 미노출

## 7.3 구현 메모

- 실제 앱에서는 bottom tab를 보여주지 않는다.
- 좌측 상단 뒤로가기 버튼을 배치한다.
- 상단 프로필 블록은 `80px gradient avatar + 20px 이름 + edit button` 조합을 유지해야 한다.
- grouped section 패턴을 재사용해야 한다

## 8. 상위 화면 공통 규칙

- 배경은 `bg.app`
- 카드/헤더는 `bg.surface`
- 기본 패딩은 `16`
- 섹션 간 간격은 `16` 또는 `24`
- 헤더와 bottom tab는 white 고정

## 9. 상세 화면 정책

현재 문서의 템플릿 범위는 상위 화면까지다.

아래는 후속 단계로 미룬다.

- 공지 상세
- 게시글 상세/작성
- 채팅방 상세
- 택시 상세 플로우
- 시간표 상세
