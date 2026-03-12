# 마이그레이션 현재 상태

이 문서는 점진적 리팩터링 동안 현재 기준선을 짧게 기록하는 운영 문서다.
다음 AI는 작업 시작 전에 이 문서를 먼저 확인하고, phase 경계가 바뀌거나 source of truth가 전환되면 내용을 갱신해야 한다.

## 현재 기준선

- 브랜치: `skuri-refactoring`
- 현재 기준 runtime commit: `3332986`
- 현재 상태: `Phase 8 verifier 5차 후속 수정 완료`
- 현재 구조 상태: `app/shared` 기반 위에 모든 feature source of truth 전환 완료
- 다음 작업 시작점: `별도 검증 스레드의 Phase 8 최종 재검증`

## source of truth 상태

`auth` migration이 시작되었으므로 auth의 source of truth는 이제 `src/features/auth` 다.
legacy auth 대응 파일에는 shim, import 정리, 삭제만 허용된다.

- `auth`: `src/features/auth`
- `user`: `src/features/user`
- `taxi`: `src/features/taxi`
- `chat`: `src/features/chat`
- `notice`: `src/features/notice`
- `board`: `src/features/board`
- `timetable`: `src/features/timetable`
- `campus`: `src/features/campus`
- `settings`: `src/features/settings`
- `minecraft`: `src/features/minecraft`
- `home`: `src/features/home`

`user` migration이 시작되었으므로 user의 source of truth는 이제 `src/features/user` 다.
legacy user 대응 파일에는 shim, import 정리, 삭제만 허용된다.

`taxi` migration이 시작되었으므로 taxi의 source of truth는 이제 `src/features/taxi` 다.
legacy taxi 대응 파일에는 shim, import 정리, 삭제만 허용된다.

`chat` migration이 시작되었으므로 chat의 source of truth는 이제 `src/features/chat` 다.
legacy chat 대응 파일에는 shim, import 정리, 삭제만 허용된다.

`notice` migration이 시작되었으므로 notice의 source of truth는 이제 `src/features/notice` 다.
legacy notice 대응 파일에는 shim, import 정리, 삭제만 허용된다.

`board` migration이 시작되었으므로 board의 source of truth는 이제 `src/features/board` 다.
legacy board 대응 파일에는 shim, import 정리, 삭제만 허용된다.

## Phase 3 완료 메모

- `AuthProvider`, `useAuth`, `useProfileCompletion`, auth screen, auth repository 구현의 실제 로직은 `src/features/auth/*` 로 이동했다.
- `src/hooks/auth/*`, `src/contexts/AuthContext.tsx`, `src/screens/auth/*`, `src/screens/PermissionOnboardingScreen.tsx`, `src/repositories/*Auth*`, `src/hooks/useProfileCompletion.ts` 는 legacy shim 역할만 유지한다.
- `RootNavigator` 는 이제 auth state + guard result만 받아 stack 분기만 수행한다. auth/profile completion/permission onboarding 계산은 `src/app/guards/useAuthEntryGuard.ts` 가 담당한다.
- `CompleteProfileScreen`, `PermissionOnboardingScreen` 의 데이터 쓰기 로직은 각각 `features/auth` hook/service 로 이동했다.
- `useFcmSetup` 의 source of truth는 `src/app/bootstrap/registerPushHandlers.ts` 로 이동했다. legacy `src/navigations/hooks/useFcmSetup.ts` 는 shim만 유지한다.
- non-auth runtime orchestration은 `src/app/bootstrap/AppRuntimeHost.tsx` 가 담당하고, `src/app/navigation/AppNavigation.tsx` 는 `NavigationContainer` + `RootNavigator` shell만 유지한다.
- `src/features/user/*` 가 이제 profile, account, notification settings, bookmarks, display name lookup, user repository 구현의 실제 source of truth다.
- `src/hooks/user/*`, `src/screens/HomeTab/ProfileScreen.tsx`, `src/screens/HomeTab/SettingScreen/ProfileEditScreen.tsx`, `src/screens/HomeTab/SettingScreen/AccountModificationScreen.tsx`, `src/screens/HomeTab/SettingScreen/NofiticationSettingScreen.tsx`, `src/repositories/interfaces/IUserRepository.ts`, `src/repositories/firestore/FirestoreUserRepository.ts` 는 user legacy shim 역할만 유지한다.
- `RepositoryProvider` 의 user repository 바인딩은 이제 `src/features/user/data/repositories/FirebaseUserRepository.ts` 를 사용한다.
- `features/auth` 의 프로필 생성/수정, 권한 온보딩 완료 저장, 로그인 후 사용자 메타 동기화는 이제 legacy userRepository 직접 경로 대신 `features/user` public API를 통해 수행한다.
- user service가 사용하던 학과 채팅방 탈퇴, 회원탈퇴용 Firebase side effect 구현은 root util이 아니라 `src/features/user/data/*` 아래에서 관리한다.
- home/settings/taxi/chat/notice 쪽 user display name/profile/account 연결 지점은 user legacy hook 또는 raw repository write 대신 `features/user` public API를 사용하도록 정리되었다.

## Phase 4 완료 메모

- `src/features/taxi/*` 가 이제 taxi/party/join request/settlement/party chat의 실제 source of truth다.
- `src/screens/TaxiScreen.tsx`, `src/screens/TaxiTab/*`, `src/hooks/party/*`, `src/contexts/JoinRequestContext.tsx`, `src/repositories/interfaces/IPartyRepository.ts`, `src/repositories/firestore/FirestorePartyRepository.ts`, `src/utils/partyMessageUtils.ts`, `src/navigations/hooks/useJoinRequestModal.ts` 는 taxi legacy shim 또는 삭제 대상으로 전환되었다.
- taxi 관련 화면, presenter, feature-local component, repository 구현, join request provider, message/creation/settlement service는 `src/features/taxi/*` 로 이동했다.
- `RepositoryProvider` 의 party repository 바인딩은 이제 `src/features/taxi/data/repositories/FirebasePartyRepository.ts` 를 사용한다.
- `MainNavigator`, `AppRuntimeHost`, 홈 `TaxiSection`, `src/hooks/chat/index.ts`, `src/hooks/party/index.ts` 는 taxi legacy 내부 경로 대신 `features/taxi` public API를 소비하도록 정리되었다.
- `AppRuntimeHost` 의 join request modal orchestration은 이제 `src/features/taxi/hooks/useJoinRequestModal.ts` 와 taxi service를 사용한다.
- in-chat join request 승인/거절, 파티 생성 초기 시스템 메시지, 파티 채팅 메시지/계좌/도착/종료 메시지 전송, 정산 초기 상태 계산 로직은 taxi feature service로 이동했다.
- legacy `src/lib/notifications.ts` 의 taxi join request 액션 export는 제거되었고, taxi join request business logic의 callable source of truth는 `src/features/taxi/services/joinRequestService.ts` 로만 유지된다.
- map/location permission 접근은 `src/shared/hooks/useCurrentLocation.ts` + `src/features/taxi/hooks/useTaxiLocation.ts` 조합으로 정리되었고, taxi 화면/컴포넌트는 legacy common location hook을 직접 import하지 않는다.

## Phase 5 완료 메모

- `src/features/chat/*` 가 이제 공개 채팅 room/list/detail/unread/notification 설정의 실제 source of truth다.
- `src/screens/ChatListScreen.tsx`, `src/screens/ChatTab/*`, `src/hooks/chat/*` 의 공개 채팅 구현, `src/repositories/interfaces/IChatRepository.ts`, `src/repositories/firestore/FirestoreChatRepository.ts`, `src/utils/chatUtils.ts` 는 chat legacy shim 또는 삭제 대상으로 전환되었다.
- 공개 채팅 관련 화면, component, presenter, repository 구현, unread service, foreground notification payload 해석 로직은 `src/features/chat/*` 로 이동했다.
- `features/taxi` 는 계속 파티 채팅만 소유한다. 공개 채팅 책임은 다시 taxi로 가져오지 않는다.
- `RepositoryProvider` 의 chat repository 바인딩은 이제 `src/features/chat/data/repositories/FirebaseChatRepository.ts` 를 사용한다.
- `MainNavigator` 의 공개 채팅 unread 계산/room state 구독 책임은 `src/features/chat/hooks/useChatTabUnreadIndicator.ts` 뒤로 이동했다.
- `src/navigations/hooks/useForegroundNotification.ts` 의 공개 채팅 room lookup/foreground banner payload/ChatDetail 이동 로직은 `features/chat` public API를 통해 처리한다.
- `ChatDetailScreen` 의 공개 채팅 메시지 전송은 `src/features/chat/*` 가 소유하고, Minecraft game chat bridge/RTDB server status 접근은 `src/features/minecraft/index.ts` public API를 chat 내부 adapter가 감싼 형태로 분리되었다. active chat 경로는 더 이상 root legacy `src/lib/minecraftChat.ts` 에 직접 의존하지 않는다.
- `src/features/chat/data/composition/chatRuntime.ts` 는 user feature internal path deep import를 제거하고 `src/features/user/index.ts` public API만 사용한다.
- `ChatStackParamList` 는 `src/features/chat/model/navigation.ts` 로 이동했고, `src/app/navigation/types.ts` 는 chat feature public API를 소비한다. active chat feature는 더 이상 app/navigation 타입에 직접 결합되지 않는다.

## Phase 6 완료 메모

- `src/features/notice/*` 가 이제 학교 공지 list/detail/html rendering/read-status/foreground notice 라우팅의 실제 source of truth다.
- `src/screens/NoticeScreen.tsx`, `src/screens/NoticeTab/*`, `src/hooks/notice/*`, `src/repositories/interfaces/INoticeRepository.ts`, `src/repositories/firestore/FirestoreNoticeRepository.ts`, `src/repositories/mock/MockNoticeRepository.ts`, `src/components/htmlRender/*`, `src/lib/noticeViews.ts`, `src/utils/linkConverter.ts`, `src/types/comment.ts` 는 notice legacy shim 또는 삭제 대상으로 전환되었다.
- notice 전용 html renderer와 이미지/table 렌더링은 `src/features/notice/components/*` 로 이동했고, detail screen은 더 이상 root `components/htmlRender` / `lib/noticeViews` / `utils/linkConverter` 구현을 source of truth로 사용하지 않는다.
- notice read status, unread banner 판단, joinedAt 기반 auto-read 처리, detail view count 증가는 `src/features/notice/model/*`, `src/features/notice/hooks/useNoticeReadState.ts`, `src/features/notice/services/noticeReadStateService.ts` 로 정리되었다.
- `RepositoryProvider` 의 notice repository 바인딩은 이제 `src/features/notice/data/repositories/FirebaseNoticeRepository.ts` 를 사용한다.
- `src/app/navigation/types.ts`, `src/navigations/MainNavigator.tsx`, 홈 `NoticeSection`, `src/navigations/hooks/useForegroundNotification.ts` 의 학교 공지 이동/foreground payload 처리는 notice feature public API를 사용하도록 정리되었다.
- app notice는 이번 phase에서 settings legacy 소유로 유지한다. school notice와 app notice source of truth는 분리된 상태다.

## Phase 7 완료 메모

- `src/features/board/*` 가 이제 게시판 list/detail/write/edit/comment/like/bookmark/moderation 연결의 실제 source of truth다.
- `src/screens/BoardScreen.tsx`, `src/screens/BoardTab/*`, `src/components/board/*`, `src/hooks/board/*`, `src/repositories/interfaces/IBoardRepository.ts`, `src/repositories/firestore/FirestoreBoardRepository.ts`, `src/repositories/mock/MockBoardRepository.ts`, `src/types/board.ts`, `src/constants/board.ts`, `src/utils/boardUtils.ts` 는 board legacy shim 역할만 유지한다.
- `RepositoryProvider` 의 board repository 바인딩은 이제 `src/features/board/data/repositories/FirebaseBoardRepository.ts` 를 사용한다.
- board 화면, hook, repository 구현, model/navigation 타입, post/comment/moderation service는 `src/features/board/*` 로 이동했고 app/navigation 과 notification 진입점은 board feature public API를 통해 detail 이동을 수행한다.
- `src/components/common/UniversalCommentList.tsx` 의 실제 구현은 `src/shared/ui/comments/*` 로 이동했다. shared comment UI는 business-free contract만 가지며, board comment 신고/차단/권한 판단은 `src/features/board/components/BoardCommentList.tsx`, `src/features/board/hooks/useBoardComments.ts`, `src/features/board/services/boardModerationService.ts` 가 소유한다.
- board comment query는 soft-deleted comment placeholder를 유지하도록 feature repository에서 처리한다. 삭제된 부모 댓글과 살아있는 답글 thread를 feature 쪽에서 그대로 복원할 수 있다.
- notice detail도 새 shared comment UI 계약으로 맞췄고, notice image viewer는 board feature public API를 통해 재사용하도록 정리되었다.
- Phase 7 후속 검증 수정으로 board image viewer는 reopen 시 최신 `initialIndex` 를 다시 동기화한다. notice detail이 board image viewer public API를 재사용하므로 동일한 재오픈 인덱스 버그가 함께 정리되었다.
- board write/edit/image selection은 더 이상 root `src/hooks/storage/*` 를 직접 source of truth로 사용하지 않는다. 이미지 선택/업로드 상태는 `src/features/board/hooks/useBoardImageUpload.ts` 와 `src/features/board/model/types.ts` 로 모였고, board repository subscription contract는 `src/shared/types/subscription.ts` 를 사용한다.
- Phase 7 대상 eslint는 현재 0 error 상태다. warning baseline은 남아 있지만 roadmap hard gate 기준인 "수정 파일 대상 eslint" 와 `npm test -- --runInBand` 는 통과했다.

## Phase 8 완료 메모

- `src/features/timetable/*` 가 이제 timetable 화면, course search provider/hook, repository 구현, model/service의 실제 source of truth다.
- `src/hooks/timetable/*`, `src/hooks/useCourseSearch.ts`, `src/contexts/CourseSearchContext.tsx`, `src/components/timetable/*`, `src/screens/HomeTab/TimetableDetailScreen.tsx`, `src/repositories/*Timetable*`, `src/repositories/*Course*`, `src/types/timetable.ts`, `src/utils/timetableUtils.ts` 는 timetable legacy shim 역할만 유지한다.
- `src/features/campus/*` 가 이제 academic calendar, cafeteria hook/component/screen/repository의 실제 source of truth다.
- `src/components/academic/*`, `src/components/cafeteria/*`, `src/hooks/setting/useAcademicSchedules.ts`, `src/hooks/setting/useCafeteriaMenu.ts`, `src/screens/HomeTab/AcademicCalendarDetailScreen.tsx`, `src/screens/HomeTab/CafeteriaDetailScreen.tsx`, `src/repositories/*Academic*`, `src/repositories/*Cafeteria*`, `src/types/academic.ts`, `src/types/cafeteria.ts` 는 campus legacy shim 역할만 유지한다.
- `src/features/settings/*` 가 이제 setting 화면, app notice, inquiries, legal docs, app version check의 실제 source of truth다.
- `src/hooks/setting/useAppNotice.ts`, `src/hooks/setting/useAppNotices.ts`, `src/hooks/setting/useSubmitInquiry.ts`, `src/screens/HomeTab/SettingScreen.tsx`, `src/screens/HomeTab/SettingScreen/*`, `src/lib/versionCheck.ts`, `src/repositories/firestore/FirestoreAppNoticeRepository.ts`, `src/repositories/interfaces/IAppNoticeRepository.ts`, `src/repositories/firestore/FirestoreInquiryRepository.ts`, `src/repositories/interfaces/IInquiryRepository.ts`, `src/repositories/firestore/FirestoreAppConfigRepository.ts`, `src/repositories/interfaces/IAppConfigRepository.ts`, `src/screens/components/TermsOfUseContent.tsx` 는 runtime/active 경로 기준 settings legacy shim 역할만 유지한다. settings 관련 mock 구현 보존 범위는 `src/repositories/mock/MockAppConfigRepository.ts`, `src/repositories/mock/MockInquiryRepository.ts` 로 한정한다.
- `src/app/bootstrap/versionCheck.ts` 는 settings version check service를 app composition에 연결하는 active `app/bootstrap` adapter다. legacy shim으로 취급하지 않는다.
- app notice foreground/navigation 책임은 이제 `src/features/settings/services/appNoticeNavigationService.ts` 가 소유한다. school notice와 app notice source of truth는 다시 섞지 않는다.
- `src/features/user/*` 가 이제 in-app notification center hook/screen/repository contract의 실제 source of truth다.
- `src/hooks/common/useNotifications.ts`, `src/screens/HomeTab/NotificationScreen.tsx`, `src/repositories/interfaces/INotificationRepository.ts`, `src/repositories/firestore/FirestoreNotificationRepository.ts`, `src/repositories/mock/MockNotificationRepository.ts` 는 notification center legacy shim 역할만 유지한다. 홈 `HomeScreen` 과 `MainNavigator` 는 더 이상 이 경로들을 active source of truth로 직접 사용하지 않는다.
- `src/features/minecraft/*` 가 이제 Minecraft RTDB bridge, whitelist registration, screen/component, repository/service/hook의 실제 source of truth다.
- `src/lib/minecraft/*`, `src/lib/minecraftChat.ts`, `src/screens/HomeTab/MinecraftDetailScreen.tsx`, `src/screens/HomeTab/MinecraftMapDetailScreen.tsx`, `src/repositories/firestore/FirestoreMinecraftRepository.ts`, `src/repositories/interfaces/IMinecraftRepository.ts`, `src/types/minecraft.ts`, `src/components/home/MinecraftSection.tsx` 는 runtime/active 경로 기준 minecraft legacy shim 역할만 유지한다. `src/repositories/mock/MockMinecraftRepository.ts` 는 제외한다.
- Minecraft RTDB 연결은 `src/features/minecraft/data/*` 와 `src/features/minecraft/services/*` 안으로 닫혔고, chat feature는 계속 `src/features/minecraft/index.ts` public API 경계를 통해서만 Minecraft game chat/server info를 사용한다.
- `src/features/home/*` 가 이제 홈 screen/section 조합의 실제 source of truth다.
- home은 composition-only를 유지한다. `src/features/home/components/TaxiSection.tsx` 는 taxi-owned section public API만 조합하고, `src/features/taxi/components/TaxiHomeSection.tsx` 가 홈 택시 section의 taxi-specific orchestration을 소유한다. `NoticeSection` 은 notice feature public API만 조합하고, timetable/campus/minecraft 데이터 책임을 다시 home으로 끌어오지 않는다.
- `src/screens/HomeScreen.tsx`, `src/components/home/TaxiSection.tsx`, `src/components/home/NoticeSection.tsx`, `src/components/home/index.ts` 는 home legacy shim 역할만 유지한다.
- `MainNavigator` 와 홈 stack은 timetable/campus/settings/minecraft/home feature public API를 기준으로 필요한 화면만 연결한다. Phase 9 전에는 legacy 대량 삭제를 하지 않는다.
- Phase 8 후속 회귀 수정으로 `CourseSearchProvider` 는 test/runtime에서 repository context fallback을 지원하고, `TimetableDetailScreen` 의 누락된 layout/helper import를 보정했다.
- Phase 8 verifier 후속 수정으로 `MonthCalendar`, `WeekCalendar`, `CafeteriaDetailScreen`, `TimetableShareModal`, `useCourseSearch` 의 scoped eslint error를 제거했다.
- Phase 8 verifier 2차 후속 수정으로 campus/timetable verifier 범위 unused-var error를 제거했고, auth legal-doc active import는 settings public API로 정리했다. verifier 범위 기준 scoped eslint는 다시 `0 errors` 상태다.
- Phase 8 verifier 3차 후속 수정으로 `src/features/auth/services/authSessionService.ts` 는 더 이상 `@/app/bootstrap` 에서 앱 버전을 읽지 않고 `features/settings` public API를 사용한다. active feature의 `auth -> app/*` 역참조는 이 범위에서 제거되었다.
- Phase 8 verifier 4차 후속 수정으로 `src/navigations/MainNavigator.tsx` 는 더 이상 `@react-native-firebase/messaging` 와 `AppState` 를 직접 소유하지 않는다. push permission check/request/recheck 는 `src/app/bootstrap/useNotificationPermissionBubble.ts` 와 `src/shared/lib/firebase/notificationPermission.ts` 로 이동했고, navigator 는 bubble 렌더링만 유지한다.
- Phase 8 verifier 4차 후속 수정으로 `src/features/settings/screens/SettingScreen.tsx` 의 Crashlytics direct import가 제거되었다. 수동 crash test는 `src/features/settings/services/settingsDiagnosticsService.ts` 와 `src/shared/lib/firebase/crashlytics.ts` 를 통해서만 호출한다.
- Phase 8 verifier 4차 후속 수정으로 `src/features/home/screens/HomeScreen.tsx`, `src/features/home/components/NoticeSection.tsx`, `src/features/minecraft/components/MinecraftSection.tsx`, `src/features/taxi/components/TaxiHomeSection.tsx` 는 더 이상 `src/navigations/types.ts` shim을 app navigation 타입 source로 사용하지 않는다. 홈 composition layer가 section navigation callback을 내려주고, active feature section은 callback prop만 소비한다.
- Phase 8 verifier 5차 후속 수정으로 push runtime active 경로는 root legacy `src/lib/notifications.ts`, `src/lib/fcm.ts` 에서 분리되었다. foreground/background/opened-app/initial-notification routing의 source of truth는 `src/app/bootstrap/pushNotificationRuntime.ts` 이고, Firebase Messaging SDK direct import는 `src/shared/lib/firebase/messaging.ts` 로 이동했다.
- Phase 8 verifier 5차 후속 수정으로 FCM token save/refresh/clear orchestration은 `src/features/user/services/fcmTokenService.ts` 와 `src/features/user/data/repositories/FirebaseUserRepository.ts` 가 소유한다. `src/app/bootstrap/registerPushHandlers.ts`, `src/features/auth/services/permissionOnboardingService.ts`, `src/features/auth/services/authSessionService.ts` 는 더 이상 root `src/lib/fcm.ts` 를 active source로 사용하지 않는다.
- `src/lib/notifications.ts`, `src/lib/fcm.ts` 는 이제 legacy shim만 유지한다. root lib에는 Firebase Messaging/Auth SDK direct import나 `new FirestoreFcmRepository()` runtime path를 남기지 않는다.
- Phase 8 verifier 5차 후속 수정으로 taxi navigation contract의 source of truth는 `src/features/taxi/model/navigation.ts` 로 이동했다. `src/app/navigation/types.ts` 와 `src/navigations/MainNavigator.tsx` 는 taxi feature public API를 소비하고, active taxi screen/hook/component는 더 이상 `@/app/navigation/types` 또는 `@/navigations/types` 를 타입 source로 사용하지 않는다.
- active DI 그래프는 이제 `src/di/repositoryContracts.ts` 를 통해 feature public API 기반 repository contract를 사용한다. `RepositoryContext`, `useRepository`, `RepositoryProvider` 는 source of truth가 전환된 contract에 대해 legacy `src/repositories/interfaces/*` 를 직접 타입 source로 보지 않는다.

## Phase 9 진입 전 남은 blocker

- `Phase 9` 로 바로 넘어가면 안 된다. 별도 검증 스레드에서 `Phase 8 최종 재검증` 을 다시 받아야 한다.
- `MainNavigator` 와 홈/설정 stack shell에는 아직 legacy warning baseline과 composition 잔여물이 남아 있다. route shell cleanup은 재검증 후 Phase 9 범위다.
- timetable/campus/settings/minecraft/home 포함 전체 feature의 legacy shim 파일 대량 삭제는 아직 하지 않았다. Phase 9에서 실제 import graph를 다시 확인한 뒤 제거해야 한다.
- route key와 UI label 완전 분리, 오타 파일명 정리, dead code 대량 삭제, 전역 lint warning 정리는 아직 남아 있다.

## 운영 규칙

- feature migration을 시작하면 해당 feature의 source of truth를 즉시 `src/features/<feature>` 로 바꾼다.
- source of truth가 전환된 feature의 legacy 대응 파일에는 새 로직을 추가하지 않는다.
- 전환 이후 legacy 대응 파일은 shim, import 정리, 삭제만 허용한다.
- 이 문서의 상태와 실제 코드가 다르면, 다음 AI는 작업 전에 먼저 이 문서를 갱신한다.
