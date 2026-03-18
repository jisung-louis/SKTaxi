# Legacy UI Cleanup Roadmap

최종 업데이트: 2026-03-18

## 목표

- v2 UI로 이미 교체된 레거시 화면과 공통 UI를 단계적으로 제거한다.
- 삭제와 Spring REST API 연결 작업을 분리해서 리스크를 낮춘다.
- 각 단계는 작은 커밋 단위로 나누고, 단계별로 복구 가능해야 한다.

## 원칙

- 삭제 기준은 `route 미연결 + caller 없음 + v2 대체 존재`를 동시에 만족할 때만 적용한다.
- navigator 등록만 남은 화면은 실제 caller와 product 필요성을 한 번 더 확인한 뒤 삭제한다.
- 런타임 코드와 문서 변경은 가능하면 커밋을 분리한다.
- 각 단계마다 `rg`, `eslint`, 관련 범위 `tsc` 필터링으로 신규 오류를 확인한다.

## 완료된 단계

### Phase 1. 홈 레거시 진입과 앱공지 메인 제거

완료 커밋:
- `0a57e5f` `refactor: 홈 레거시 진입과 앱공지 메인 제거`

정리 내용:
- `src/features/home` 전체 제거
- `src/features/settings/screens/AppNoticeScreen.tsx` 제거
- `CampusStackNavigator` 에서 `AppNotice` route 제거
- `mainTabs` 에서 `AppNotice` 숨김 탭 항목 제거
- `CampusStackParamList` 에서 `AppNotice` 제거
- `settings/index.ts` 의 dead export 제거
- `useAppNotice.ts`, `useAppNotices.ts` 제거

### Phase 2. 게시판 레거시 메인 제거

완료 커밋:
- `6cc1127` `refactor: 게시판 레거시 메인 화면 제거`

정리 내용:
- `BoardScreen` 과 old 메인용 카드/헤더/검색 컴포넌트 제거
- old 댓글 리스트 훅과 댓글 스레드 변환 서비스 제거
- 게시판 old 메인에서만 쓰던 `shared/ui` 에러/로딩/댓글 리스트 제거
- `board/index.ts`, `board/hooks/index.ts`, `board/components/index.ts` export 정리
- dead `navigateToBoardSearch` 제거

### Phase 3. 공지 레거시 목록과 HTML 렌더링 제거

완료 커밋:
- `1fab958` `refactor: 공지 레거시 목록과 html 렌더링 제거`

정리 내용:
- old 공지 카테고리 바, 카드 리스트, HTML 렌더링 서브트리 제거
- `NoticeSettingsPanel` 은 live 이므로 유지
- `notice/index.ts`, `notice/components/index.ts` export 정리

## 진행 예정 단계

### Phase 4. 시간표 레거시 편집 흐름 제거

완료 커밋:
- `2d96dc0` `refactor: 시간표 레거시 편집 흐름 제거`

정리 내용:
- old 시간표 편집/검색/미리보기/공유 컴포넌트 제거
- `useCourseSearch`, `useTimetable`, `CourseSearchProvider` 제거
- `AppProviders` 에서 `CourseSearchProvider` wrapper 제거
- `timetable/index.ts` 의 dead export 정리

### Phase 5. 택시 레거시 채팅 구성 제거

완료 커밋:
- `a4bce61` `refactor: 택시 레거시 채팅 구성 제거`

정리 내용:
- old 택시 채팅 입력/메뉴/메시지 리스트/정산/사이드메뉴 서브트리 제거
- dead `useTaxiScreenPresenter`, `useChatScreenPresenter` 제거
- 마지막 사용처가 사라지는 `shared/ui/Surface.tsx` 제거
- `taxi/index.ts` 의 dead export 정리

대상:
- `src/features/taxi/components/chat/*`
- `src/features/taxi/hooks/useChatScreenPresenter.ts`
- `src/features/taxi/hooks/useTaxiScreenPresenter.ts`

### Phase 6. 공용 레거시 UI 정리

완료 커밋:
- `50a7c00` `refactor: 공용 레거시 ui orphan 파일 제거`

정리 내용:
- `CommentInput`, `CustomTooltip`, `Dropdown`, `HashTagText`, `Text`, `TimePicker`, `ToggleButton` 제거
- feature 정리 이후 import 수가 0인 orphan 파일만 대상으로 정리
- `ForceUpdateModal` 은 `App.tsx` 에서 live 이므로 유지
- `Surface` 는 Phase 5에서 이미 제거 완료

### Phase 7. product 확인 후 제거할 route

완료 커밋:
- `8f32b34` `refactor: 택시 맵 검색 레거시 진입 제거`
- `338f75d` `refactor: 마인크래프트 화면 디자인 토큰 v2 이관`

정리 내용:
- caller 없이 route 등록만 남아 있던 `MapSearchScreen` 과 관련 type/export/navigation 등록 제거
- `MinecraftDetail`, `MinecraftMapDetail`, `MinecraftSection` 은 추후 UI 레퍼런스 용도로 유지
- `Minecraft` 도메인 화면 3개에서 `shared/constants/colors`, `shared/constants/typography` 의존성을 제거하고 v2 기반 도메인 토큰 파일로 이관

비고:
- `Minecraft*` route는 product 요청으로 임시 유지한다.

### Phase 8. 레거시 토큰 종결

진행 중 커밋:
- `3a4e921` `refactor: 공용 UI 디자인 토큰을 v2로 이관`

목표:
- `src/shared/constants/colors.ts` import 0
- `src/shared/constants/typography.ts` import 0
- `@/shared/ui` import를 최소화하거나 제거

현재까지 정리한 내용:
- `shared/ui` live 컴포넌트 `Button`, `PageHeader`, `PermissionBubble`, `ForegroundNotification`, `ForceUpdateModal`, `Dot`, `TabBadge` 를 v2 토큰으로 이관
- `shared/design-system/tokens/typography.ts` 추가
- `shared/ui`, `shared/design-system` 범위에서 legacy `colors`, `typography` import 0 달성

남은 주요 사용처:
- `campus`: `AcademicCalendarSection`, `MonthCalendar`, `WeekCalendar`, `CafeteriaSection`
- `chat`: `ChatListScreen`, `ChatListHeader`, `ChatRoomCard`, `EmptyChatList`, `chatRoomService`
- `taxi`: `PartyList`, `TaxiHomeSection`, `TaxiPermissionPrompt`, `TaxiTimeRemaining`, `JoinRequestModal`
- `notice`: `NoticeDetailWebViewScreen`
- `board`: `ImageViewer`, `selectors`
- dead 후보 재확인: `NotificationSettingItem`, `TermsOfUseContent`

## 현재 live로 판단한 예외

삭제 대상에서 제외:
- `src/features/taxi/screens/AcceptancePendingScreen.tsx`
- `src/features/user/screens/NotificationScreen.tsx`
- `src/features/settings/screens/AppNoticeDetailScreen.tsx`

## 단계별 검증 체크리스트

1. `rg` 로 삭제 파일/심볼 참조가 0인지 확인
2. 수정 파일 기준 `eslint` 실행
3. 전체 `tsc --noEmit` 결과에서 이번 단계 관련 파일명만 필터링해 신규 오류 확인
4. 관련 navigator 진입 경로 수동 점검
