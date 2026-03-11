# UI Foundations

작성일: 2026-03-10  
기준: Figma 상위 프레임 7종

## 1. 톤 앤 무드

SKURI v2의 시각 방향은 아래 키워드로 정리한다.

- light
- clean
- calm
- campus-friendly
- informative
- action-clear

즉, 무거운 다크 UI가 아니라 밝고 가벼운 캠퍼스형 인터페이스를 기본값으로 삼는다.

## 2. 컬러 시스템

## 2.1 Core neutrals

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `bg.app` | `#F9FAFB` | 앱 기본 배경 |
| `bg.surface` | `#FFFFFF` | 카드, 헤더, 탭바 |
| `bg.subtle` | `#F3F4F6` | 비선택 칩, 아이콘 배경, 그룹 배경 |
| `border.default` | `#E5E7EB` | 헤더, 탭바, 그룹 경계 |
| `border.subtle` | `#F3F4F6` | 카드 내부 구분선 |
| `text.primary` | `#111827` | 주요 텍스트 |
| `text.secondary` | `#4B5563` | 본문 보조 텍스트 |
| `text.tertiary` | `#6B7280` | 메타 정보 |
| `text.quaternary` | `#9CA3AF` | 시간, 탭 비활성, 보조 메타 |

## 2.2 Brand / accent colors

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `brand.wordmark` | `#10B981` | Campus `SKURI` 워드마크 |
| `accent.green` | `#22C55E` | 기본 CTA, 활성 탭, 활성 세그먼트 |
| `accent.green.strong` | `#16A34A` | 텍스트형 강조 |
| `accent.green.soft` | `#DCFCE7` | 아이콘 배경, soft state |
| `accent.blue` | `#2563EB` | 학사, 정보성 강조 |
| `accent.blue.soft` | `#DBEAFE` | 블루 아이콘 배경 |
| `accent.blue.surface` | `#EFF6FF` | 블루 라벨 배경 |
| `accent.orange` | `#EA580C` | 취업/행동형 강조 텍스트 |
| `accent.orange.soft` | `#FFF7ED` | 오렌지 라벨 배경 |
| `accent.orange.bar` | `#FB923C` | 시간표 현재 수업 인디케이터 |
| `accent.purple` | `#9333EA` | 장학/보조 분기 |
| `accent.purple.soft` | `#FAF5FF` | 퍼플 라벨 배경 |
| `accent.purple.iconBg` | `#F3E8FF` | 퍼플 아이콘 배경 |
| `accent.red` | `#EF4444` | 파괴적 액션 |

## 2.3 Semantic status mapping

| 도메인 | 기본색 |
| --- | --- |
| 선택 상태 | green |
| 안읽음 표시 | green |
| 학사 | blue |
| 장학 | purple |
| 취업 | orange |
| 시설 | neutral |
| 택시 모집중 | green |
| 택시 마감 | neutral |
| 파괴적 액션 | red |

`행사` 라벨의 정확한 색 조합은 현재 상위 Figma만으로 충분히 고정되지 않았으므로 세부 토큰은 후속 확정이 필요하다.

Campus의 `읽지 않은 공지` preview에서는 카테고리 색보다 unread 강조가 우선한다.  
즉, Notice 메인 리스트의 category tag와 Campus preview tag는 같은 도메인이라도 색 규칙이 다를 수 있다.

## 3. 타이포그래피

## 3.1 Type scale

| 스타일 | 크기 / 줄간격 | 굵기 | 대표 용도 |
| --- | --- | --- | --- |
| `display.brand` | `24 / 32` | regular | Campus `SKURI` 워드마크 |
| `title.screen` | `18 / 28` | bold | 상단 화면 제목 |
| `title.profile` | `20 / 28` | bold | MY 사용자 이름 |
| `title.section` | `16 / 24` | bold | 섹션 제목 |
| `title.card` | `14 / 20` | bold | 공지 제목, 카드 제목 |
| `body.default` | `14 / 20` | regular | 본문, 목록 설명 |
| `body.medium` | `14 / 20` | medium | 버튼, 선택 텍스트 |
| `meta.default` | `12 / 16` | regular | 날짜, 인원, 부가 정보 |
| `meta.medium` | `12 / 16` | medium | 라벨, 보조 버튼 |
| `tab.label` | `10 / 15` | medium | 하단 탭 라벨 |

Campus 워드마크는 일반 타이포 토큰과 분리해 관리하는 것이 맞다.  
구현 방식은 SVG/이미지 자산 사용을 기본값으로 한다.  
추후 로고나 앱 아이콘을 함께 배치할 수 있도록 좌측 헤더 영역은 확장 가능하게 설계한다.

## 3.2 수치형 강조

| 스타일 | 크기 / 줄간격 | 굵기 | 용도 |
| --- | --- | --- | --- |
| `stat.large` | `24 / 32` | bold | MY 통계 카드 숫자 |
| `fare.emphasis` | `14 / 20` | bold | 택시 예상 요금 |

## 4. Spacing scale

기본 그리드는 4pt 단위를 사용한다.

| 토큰 | 값 | 대표 사용처 |
| --- | --- | --- |
| `space.1` | `4` | 미세 간격 |
| `space.2` | `8` | 텍스트-메타 간격 |
| `space.3` | `12` | 카드 내부 행 간격 |
| `space.4` | `16` | 기본 패딩 |
| `space.5` | `20` | 제한적으로 사용 |
| `space.6` | `24` | 섹션 구분 |
| `space.8` | `32` | 대형 요소 내부/상단 여백 |

실제 상위 화면에서는 `12 / 16 / 24`가 가장 자주 사용된다.

## 5. Radius scale

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `radius.sm` | `4` | 카테고리 태그 |
| `radius.md` | `8` | 소형 버튼 |
| `radius.lg` | `12` | grouped icon bg, 작은 카드 |
| `radius.xl` | `16` | 주 카드, 리스트 카드 |
| `radius.full` | `9999` | 칩, 상태 배지, 원형 아바타 |

## 6. Border rules

- 헤더, 탭바, 그룹 리스트 외곽: `1px solid #E5E7EB`
- 카드 내부 구분선: `1px solid #F3F4F6`
- 선택 상태를 border로 강조하는 경우보다 fill과 text 색으로 구분하는 경우가 많다.
- Community 세그먼트는 `2px` 하단 보더로 활성 상태를 표현한다.

## 7. Shadow / elevation

상위 프레임에서 확인되는 그림자는 모두 매우 약하다.

| 레벨 | 값 | 용도 |
| --- | --- | --- |
| `shadow.card` | `0 1 2 rgba(0,0,0,0.05)` | 일반 카드 |
| `shadow.fab` | `0 4 6 -4 rgba(34,197,94,0.4), 0 10 15 -3 rgba(34,197,94,0.4)` | Community FAB |
| `shadow.primaryCta` | `0 4 6 -4 rgba(34,197,94,0.3), 0 10 15 -3 rgba(34,197,94,0.3)` | Taxi 메인 CTA |

기본 원칙은 아래와 같다.

- shadow는 깊이를 과장하지 않는다.
- 대부분의 계층은 배경색 차이와 경계선으로 구분한다.

## 8. 아이콘 기준

| 크기 | 용도 |
| --- | --- |
| `14` | chevron, 미세 아이콘 |
| `20` | 헤더 액션, 탭 아이콘 |
| `24` | 카드 내 대표 아이콘 |
| `32` | 빠른 메뉴 / 큰 액션 아이콘 컨테이너 내부 |

아이콘은 보통 단독으로 쓰지 않고 soft background 위에 놓인다.

## 9. 구현 메모

- 현재 코드의 다크 테마 토큰은 새 foundation과 충돌한다.
- 구현 전 `colors.ts`, `typhograpy.ts`는 라이트 테마 기준으로 재설계해야 한다.
- token 이름은 코드 구현 전 최종 확정이 필요하지만, 의미 계층은 이 문서를 기준으로 유지한다.
