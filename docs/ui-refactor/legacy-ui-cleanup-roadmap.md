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

## 진행 예정 단계

### Phase 2. 게시판 레거시 메인 제거

대상:
- `src/features/board/screens/BoardScreen.tsx`
- `src/features/board/components/BoardCommentList.tsx`
- `src/features/board/components/BoardHeader.tsx`
- `src/features/board/components/BoardSearch.tsx`
- `src/features/board/components/PostCard.tsx`
- `src/features/board/hooks/useBoardComments.ts`
- `src/features/board/services/boardCommentService.ts`
- `src/shared/ui/ErrorMessage.tsx`
- `src/shared/ui/LoadingSpinner.tsx`
- `src/shared/ui/comments/UniversalCommentList.tsx`
- `src/shared/ui/comments/index.ts`
- `src/shared/ui/comments/types.ts`

같이 수정할 파일:
- `src/features/board/components/index.ts`
- `src/features/board/hooks/index.ts`
- `src/features/board/index.ts`
- `src/features/board/services/boardNavigationService.ts`

주의:
- `BoardMain` route 자체는 live다.
- `BoardMain` 의 실제 컴포넌트는 `CommunityScreen` 이므로 건드리지 않는다.

### Phase 3. 공지 레거시 목록과 HTML 렌더링 제거

대상:
- `src/features/notice/components/NoticeCategoryBar.tsx`
- `src/features/notice/components/NoticeHtmlContent.tsx`
- `src/features/notice/components/NoticeImageViewer.tsx`
- `src/features/notice/components/NoticeItem.tsx`
- `src/features/notice/components/NoticeList.tsx`
- `src/features/notice/components/UnreadNoticeBanner.tsx`
- `src/features/notice/components/html/*`

### Phase 4. 시간표 레거시 편집 흐름 제거

대상:
- `src/features/timetable/components/CourseCard.tsx`
- `src/features/timetable/components/CourseSearch.tsx`
- `src/features/timetable/components/SemesterDropdown.tsx`
- `src/features/timetable/components/TimetableEditBottomSheet.tsx`
- `src/features/timetable/components/TimetablePreview.tsx`
- `src/features/timetable/components/TimetableShareModal.tsx`
- `src/features/timetable/hooks/useCourseSearch.ts`
- `src/features/timetable/providers/CourseSearchProvider.tsx`

같이 수정할 파일:
- `src/app/providers/AppProviders.tsx`
- `src/features/timetable/index.ts`

주의:
- `CourseSearchProvider` 제거 시 `AppProviders` import/wrapper도 같이 제거해야 한다.

### Phase 5. 택시 레거시 채팅 구성 제거

대상:
- `src/features/taxi/components/chat/*`
- `src/features/taxi/hooks/useChatScreenPresenter.ts`
- `src/features/taxi/hooks/useTaxiScreenPresenter.ts`

### Phase 6. 공용 레거시 UI 정리

후보:
- `src/shared/ui/CommentInput.tsx`
- `src/shared/ui/CustomTooltip.tsx`
- `src/shared/ui/Dropdown.tsx`
- `src/shared/ui/ForceUpdateModal.tsx`
- `src/shared/ui/HashTagText.tsx`
- `src/shared/ui/TimePicker.tsx`
- `src/shared/ui/ToggleButton.tsx`
- `src/shared/ui/Surface.tsx`

조건:
- feature 정리 이후 실제 import 수가 0이 되었는지 재확인 후 삭제

### Phase 7. product 확인 후 제거할 route

재확인 대상:
- `src/features/taxi/screens/MapSearchScreen.tsx`
- `src/features/minecraft/components/MinecraftSection.tsx`
- `src/features/minecraft/screens/MinecraftDetailScreen.tsx`
- `src/features/minecraft/screens/MinecraftMapDetailScreen.tsx`

이 단계는 기술적으로는 고아에 가깝지만, product 관점에서 기능을 완전히 접는지 확인 후 진행한다.

### Phase 8. 레거시 토큰 종결

목표:
- `src/shared/constants/colors.ts` import 0
- `src/shared/constants/typography.ts` import 0
- `@/shared/ui` import를 최소화하거나 제거

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

