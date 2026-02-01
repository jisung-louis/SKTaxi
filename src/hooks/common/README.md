# Common Domain (공통 유틸리티)

## 개요
여러 도메인에서 공통으로 사용하는 유틸리티 훅.

## Hooks

| 훅 | 용도 |
|----|------|
| `useFirestoreSubscription` | Firestore 실시간 구독 헬퍼 |
| `usePagination` | 페이지네이션 로직 |
| `useNotifications` | 앱 내 알림 처리 |
| `usePermissionStatus` | 디바이스 권한 상태 (위치, 알림) |

## useFirestoreSubscription

Firestore onSnapshot 구독을 추상화한 헬퍼:
```typescript
const { data, loading, error } = useFirestoreSubscription<T>(
  query,
  mapFunction
);
```

## usePagination

무한 스크롤/페이지네이션 로직:
```typescript
const { 
  items, 
  hasMore, 
  loadMore, 
  refresh 
} = usePagination(fetchFunction);
```

## usePermissionStatus

디바이스 권한 확인:
- 위치 권한 (foreground/background)
- 알림 권한

## Spring 마이그레이션 포인트
- `useFirestoreSubscription` → REST API + WebSocket 헬퍼로 교체
- 다른 훅들은 플랫폼 독립적이므로 변경 불필요
