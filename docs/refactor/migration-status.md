# 마이그레이션 현재 상태

이 문서는 점진적 리팩터링 동안 현재 기준선을 짧게 기록하는 운영 문서다.  
다음 AI는 작업 시작 전에 이 문서를 먼저 확인하고, phase 경계가 바뀌거나 source of truth가 전환되면 내용을 갱신해야 한다.

## 현재 기준선

- 브랜치: `skuri-refactoring`
- 현재 기준 commit: `4db19a9`
- 현재 상태: `Phase 2 완료`
- 현재 구조 상태: `app/shared` 기반 위에 `auth` source of truth 전환과 auth gating 분리 완료
- 다음 작업 시작점: `Phase 3`

## source of truth 상태

`auth` migration이 시작되었으므로 auth의 source of truth는 이제 `src/features/auth` 다.  
legacy auth 대응 파일에는 shim, import 정리, 삭제만 허용된다.

- `auth`: `src/features/auth`
- `user`: legacy
- `taxi`: legacy
- `chat`: legacy
- `notice`: legacy
- `board`: legacy
- `timetable`: legacy
- `campus`: legacy
- `settings`: legacy
- `minecraft`: legacy
- `home`: legacy

## Phase 2 완료 메모

- `AuthProvider`, `useAuth`, `useProfileCompletion`, auth screen, auth repository 구현의 실제 로직은 `src/features/auth/*` 로 이동했다.
- `src/hooks/auth/*`, `src/contexts/AuthContext.tsx`, `src/screens/auth/*`, `src/screens/PermissionOnboardingScreen.tsx`, `src/repositories/*Auth*`, `src/hooks/useProfileCompletion.ts` 는 legacy shim 역할만 유지한다.
- `RootNavigator` 는 이제 auth state + guard result만 받아 stack 분기만 수행한다. auth/profile completion/permission onboarding 계산은 `src/app/guards/useAuthEntryGuard.ts` 가 담당한다.
- `CompleteProfileScreen`, `PermissionOnboardingScreen` 의 데이터 쓰기 로직은 각각 `features/auth` hook/service 로 이동했다.
- `useFcmSetup` 의 source of truth는 `src/app/bootstrap/registerPushHandlers.ts` 로 이동했다. legacy `src/navigations/hooks/useFcmSetup.ts` 는 shim만 유지한다.
- non-auth runtime orchestration은 `src/app/bootstrap/AppRuntimeHost.tsx` 가 담당하고, `src/app/navigation/AppNavigation.tsx` 는 `NavigationContainer` + `RootNavigator` shell만 유지한다.

## Phase 3 진입 전 남은 연결 지점

- `features/auth` 는 아직 프로필 생성/수정과 권한 온보딩 완료 저장을 위해 legacy `userRepository` 에 의존한다. `Phase 3` 에서 이 경로를 `features/user` public API로 전환해야 한다.
- `src/app/bootstrap/AppRuntimeHost.tsx` 는 과도기 legacy 연결 규칙에 따라 `useForegroundNotification`, `useJoinRequestModal`, `components/common/*` 를 단일 runtime host에서 임시 재사용한다. 해당 책임의 phase가 시작되면 app bootstrap/service 또는 feature hook/service로 교체해야 한다.
- foreground notification routing은 아직 legacy `src/navigations/hooks/useForegroundNotification.ts` 구현을 재사용한다. taxi/chat/notice notification action은 각각 `Phase 4~6` 에서 feature public API/service 기준으로 치환해야 한다.

## 운영 규칙

- feature migration을 시작하면 해당 feature의 source of truth를 즉시 `src/features/<feature>` 로 바꾼다.
- source of truth가 전환된 feature의 legacy 대응 파일에는 새 로직을 추가하지 않는다.
- 전환 이후 legacy 대응 파일은 shim, import 정리, 삭제만 허용한다.
- 이 문서의 상태와 실제 코드가 다르면, 다음 AI는 작업 전에 먼저 이 문서를 갱신한다.
