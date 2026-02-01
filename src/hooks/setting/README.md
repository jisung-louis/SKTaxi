# Setting Domain (설정 및 부가 기능)

## 개요
앱 설정, 학사일정, 학식 메뉴, 문의하기, 앱 공지 등 부가 기능.

## Firestore 컬렉션
- `academicSchedules/{scheduleId}` - 학사일정
- `cafeteriaMenus/{date}` - 학식 메뉴
- `appNotices/{noticeId}` - 앱 공지 (운영 공지)
- `inquiries/{inquiryId}` - 문의 내역

## Repository
- `IAcademicRepository` - 학사일정 인터페이스
- `ICafeteriaRepository` - 학식 메뉴 인터페이스
- `IAppNoticeRepository` - 앱 공지 인터페이스
- `IInquiryRepository` - 문의 인터페이스
- Firestore 구현체 각각 존재

## Hooks

| 훅 | 용도 |
|----|------|
| `useAcademicSchedules` | 학사일정 조회 |
| `useCafeteriaMenu` | 학식 메뉴 조회 (날짜별) |
| `useAppNotices` | 앱 공지 목록 구독 |
| `useAppNotice` | 단일 앱 공지 조회 |
| `useSubmitInquiry` | 문의 제출 |

## 사용 화면
- `SettingScreen` - 설정 메인
- `ProfileScreen` - 프로필 관리
- `NotificationSettingScreen` - 알림 설정
- `InquiriesScreen` - 문의 내역
- `AppNoticeScreen` - 앱 공지 목록
- `AppNoticeDetailScreen` - 앱 공지 상세

## Spring 마이그레이션 포인트
- 학사일정/학식: Cloud Functions 크롤러 → Spring Scheduler
- 문의: Firestore → RDB + 관리자 페이지
- `Firestore*Repository` → `Spring*Repository` 구현체 교체
