// SKTaxi: 공통 훅 통합 내보내기

export {
  useFirestoreSubscription,
  useConditionalSubscription,
} from './useFirestoreSubscription';
export type {
  SubscriptionState,
  SubscribeFn,
} from './useFirestoreSubscription';

export {
  usePagination,
  useRealtimePagination,
} from './usePagination';
export type {
  PaginationState,
  PaginationActions,
  InitialLoadFn,
  LoadMoreFn,
  UsePaginationOptions,
  RealtimePaginationState,
} from './usePagination';

export { useNotifications } from './useNotifications';
export type { UseNotificationsResult } from './useNotifications';

// Notification 타입 re-export
export type { Notification } from '../../repositories/interfaces/INotificationRepository';

export { usePermissionStatus } from './usePermissionStatus';
export type { PermissionStatus } from './usePermissionStatus';

export { useCurrentLocation, requestLocationPermission } from './useCurrentLocation';
export type { Coordinates } from './useCurrentLocation';
