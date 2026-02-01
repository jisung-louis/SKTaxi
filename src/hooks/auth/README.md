# Auth Domain (인증)

## 개요
사용자 인증 (로그인/로그아웃) 및 인증 상태 관리.

## Firebase 서비스
- Firebase Auth - 인증 처리
- Google Sign-In SDK - 소셜 로그인

## Repository
- `IAuthRepository` - 인증 인터페이스 (로그인, 로그아웃, 재인증)
- `FirestoreAuthRepository` - Firebase Auth 구현체

## Hooks

| 훅 | 용도 |
|----|------|
| `useAuth` | 인증 상태 구독, 로그인/로그아웃 액션 |

## useAuth 상세

```typescript
const {
  user,           // 현재 사용자 (AuthUser | null)
  loading,        // 로딩 상태
  signInWithGoogle,  // Google 로그인
  signInWithEmail,   // 이메일 로그인
  signOut,           // 로그아웃
  updateProfile,     // 프로필 업데이트
} = useAuth();
```

## 인증 흐름
```
App 시작
    ↓
AuthContext (인증 상태 감시)
    ↓
useAuth (인증 액션 제공)
    ↓
IAuthRepository (Firebase Auth 호출)
```

## Context 연동
- `AuthContext` - 전역 인증 상태 제공
- `useAuthContext` - Context 소비 훅

## 사용 화면
- `LoginScreen` - 로그인
- `CompleteProfileScreen` - 프로필 완성
- `PermissionOnboardingScreen` - 권한 온보딩

## Spring 마이그레이션 포인트
- `FirestoreAuthRepository` → `SpringAuthRepository` 구현체 교체
- Google Sign-In: Firebase → Spring OAuth2 + Google
- 토큰 관리: Firebase Auth Token → JWT
