# 마이그레이션 현재 상태

이 문서는 점진적 리팩터링 동안 현재 기준선을 짧게 기록하는 운영 문서다.
다음 AI는 작업 시작 전에 이 문서를 먼저 확인하고, phase 경계가 바뀌거나 source of truth가 전환되면 내용을 갱신해야 한다.

## 현재 기준선

- 브랜치: `skuri-refactoring`
- 현재 기준 runtime commit: `10ffa8b`
- 현재 상태: `Phase 6 완료`
- 현재 구조 상태: `app/shared` 기반 위에 `auth`, `user`, `taxi`, `chat`, `notice` source of truth 전환 완료
- 다음 작업 시작점: `Phase 7`

## source of truth 상태

`auth` migration이 시작되었으므로 auth의 source of truth는 이제 `src/features/auth` 다.
legacy auth 대응 파일에는 shim, import 정리, 삭제만 허용된다.

- `auth`: `src/features/auth`
- `user`: `src/features/user`
- `taxi`: `src/features/taxi`
- `chat`: `src/features/chat`
- `notice`: `src/features/notice`
- `board`: legacy
- `timetable`: legacy
- `campus`: legacy
- `settings`: legacy
- `minecraft`: legacy
- `home`: legacy

`user` migration이 시작되었으므로 user의 source of truth는 이제 `src/features/user` 다.
legacy user 대응 파일에는 shim, import 정리, 삭제만 허용된다.

`taxi` migration이 시작되었으므로 taxi의 source of truth는 이제 `src/features/taxi` 다.
legacy taxi 대응 파일에는 shim, import 정리, 삭제만 허용된다.

`chat` migration이 시작되었으므로 chat의 source of truth는 이제 `src/features/chat` 다.
legacy chat 대응 파일에는 shim, import 정리, 삭제만 허용된다.

`notice` migration이 시작되었으므로 notice의 source of truth는 이제 `src/features/notice` 다.
legacy notice 대응 파일에는 shim, import 정리, 삭제만 허용된다.

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

## Phase 7 진입 전 남은 blocker

- hard blocker는 없다. `Phase 7` board migration은 바로 시작할 수 있다.
- `src/navigations/hooks/useForegroundNotification.ts` 에는 여전히 taxi/app notice 책임이 남아 있다. notice school payload 분기만 분리된 상태이므로 settings phase 전까지 app notice 분기는 건드리지 않는다.
- legacy notice shim 파일들은 이제 shim-only 상태다. 남은 import 정리가 끝나면 삭제 대상으로 취급해야 한다.
- `MainNavigator` 는 공개 채팅/학교 공지 feature public API 소비로 정리되었지만, route shell 자체의 전면 정리는 별도 cleanup 단계로 남아 있다.

## 운영 규칙

- feature migration을 시작하면 해당 feature의 source of truth를 즉시 `src/features/<feature>` 로 바꾼다.
- source of truth가 전환된 feature의 legacy 대응 파일에는 새 로직을 추가하지 않는다.
- 전환 이후 legacy 대응 파일은 shim, import 정리, 삭제만 허용한다.
- 이 문서의 상태와 실제 코드가 다르면, 다음 AI는 작업 전에 먼저 이 문서를 갱신한다.
