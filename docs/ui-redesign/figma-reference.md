# Figma Reference

작성일: 2026-03-10

## 1. 목적

이 문서는 SKURI UI 2.0 작업에서 참조해야 하는 canonical Figma 링크를 한 곳에 모아둔다.

새 스레드의 Codex는 상위 화면 UI 작업 전 이 문서를 먼저 확인하고, 반드시 Figma MCP로 해당 node를 직접 읽어야 한다.

## 2. 기본 원칙

- 문서는 정책과 범위를 고정한다.
- Figma는 실제 시각 기준과 세부 레이아웃을 확인한다.
- UI 구현은 `문서 + Figma`를 함께 기준으로 삼는다.

## 3. 파일 기준

- Figma file: [SKURI-v2.0](https://www.figma.com/design/5m9UUvNqIM8zRCgUWV5yMg/SKURI-v2.0)
- fileKey: `5m9UUvNqIM8zRCgUWV5yMg`

## 4. Canonical 상위 프레임

### 4.1 Campus

- 목적: 상위 허브 화면 기준
- nodeId: `4:1406`
- 링크: [Campus](https://www.figma.com/design/5m9UUvNqIM8zRCgUWV5yMg/SKURI-v2.0?node-id=4-1406&m=dev)
- 주요 확인 포인트:
  - `SKURI` 브랜드 헤더
  - 읽지 않은 공지 preview
  - 시간표 기본 상태
  - compact taxi preview
  - 빠른 메뉴 4종

### 4.2 Campus NightCourseOpen

- 목적: 시간표 확장 상태 기준
- nodeId: `4:1776`
- 링크: [Campus NightCourseOpen](https://www.figma.com/design/5m9UUvNqIM8zRCgUWV5yMg/SKURI-v2.0?node-id=4-1776&m=dev)
- 주요 확인 포인트:
  - 시간표 확장 상태
  - 야간 수업이 있는 경우의 높이 변화
  - `야간수업 펼치기`와 반대 상태의 시각 차이

### 4.3 Taxi

- 목적: Taxi 상위 화면 기준
- nodeId: `4:2219`
- 링크: [Taxi](https://www.figma.com/design/5m9UUvNqIM8zRCgUWV5yMg/SKURI-v2.0?node-id=4-2219&m=dev)
- 주요 확인 포인트:
  - soft green hero
  - 출발지 검색 field
  - 필터칩
  - primary CTA
  - Taxi party card 위계

### 4.4 Notice

- 목적: Notice 상위 화면 기준
- nodeId: `1:1414`
- 링크: [Notice](https://www.figma.com/design/5m9UUvNqIM8zRCgUWV5yMg/SKURI-v2.0?node-id=1-1414&m=dev)
- 주요 확인 포인트:
  - unread banner
  - filter chip row
  - grouped list형 공지 목록
  - `search + profile` header action

### 4.5 Community Board

- 목적: Community > 게시판 상위 화면 기준
- nodeId: `1:1856`
- 링크: [Community Board](https://www.figma.com/design/5m9UUvNqIM8zRCgUWV5yMg/SKURI-v2.0?node-id=1-1856&m=dev)
- 주요 확인 포인트:
  - top segment
  - featured card
  - board feed card
  - FAB

### 4.6 Community Chat

- 목적: Community > 채팅 상위 화면 기준
- nodeId: `4:367`
- 링크: [Community Chat](https://www.figma.com/design/5m9UUvNqIM8zRCgUWV5yMg/SKURI-v2.0?node-id=4-367&m=dev)
- 주요 확인 포인트:
  - top segment
  - room list item
  - unread badge
  - 색상별 soft avatar background

### 4.7 My

- 목적: MY 상위 화면 기준
- nodeId: `1:2126`
- 링크: [My](https://www.figma.com/design/5m9UUvNqIM8zRCgUWV5yMg/SKURI-v2.0?node-id=1-2126&m=dev)
- 주요 확인 포인트:
  - identity block
  - stats card
  - grouped list
  - logout CTA

## 5. Phase별 참조 우선순위

### Phase 1

- 전체 상위 프레임을 가볍게 확인
- 특히 Campus, Taxi, Notice를 우선 본다.

### Phase 2

- Campus, Taxi, Notice, Community Board, Community Chat, My를 모두 직접 대조
- primitive별로 실제 화면에서 어떻게 반복되는지 확인

### Phase 3

- Campus, Taxi, Notice, Community Board, Community Chat, My의 header / tab / segment / shell을 대조

### Phase 4+

- 구현 대상 화면의 exact node를 항상 먼저 읽고 시작

## 6. 문서와 Figma가 충돌할 때

아래 항목은 `의도적으로 문서가 Figma를 보정하는 정책`이다.

- MY 화면은 실제 앱에서 bottom tab를 노출하지 않는다.
- MY 화면 좌측 상단에는 뒤로가기 버튼을 둔다.
- Campus `SKURI` 워드마크는 SVG/이미지 자산으로 구현한다.
- RN/React 등 버전 마이그레이션은 UI 2.0 완료 후 진행한다.

즉, 단순 시각 차이는 Figma를 우선 보되, 위와 같은 정책성 충돌은 문서를 우선한다.

## 7. Codex 실행 규칙

- UI 작업 전 `get_design_context`로 exact node를 먼저 읽는다.
- 가능하면 `get_screenshot`까지 함께 확인한다.
- Figma를 보지 않고 문서만으로 spacing, hierarchy, state를 추정하지 않는다.

