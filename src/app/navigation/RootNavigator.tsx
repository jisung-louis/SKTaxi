// Phase 1 shell entry point.
// Phase 2: auth/profile/permission gating은 features/auth public API와 app guards로 위임.
// TODO(Phase 4): join request modal 흐름을 features/taxi 쪽으로 이동.
// TODO(Phase 5): foreground notification routing을 navigation 외부 service/public API로 이동.
export { RootNavigator } from '@/navigations/RootNavigator';
