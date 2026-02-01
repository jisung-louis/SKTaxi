# Timetable Domain (시간표)

## 개요
사용자 개인 시간표 관리 기능.

## Firestore 컬렉션
- `timetables/{userId}` - 사용자 시간표
- `courses/{courseId}` - 강좌 정보 (공용)

## Repository
- `ITimetableRepository` - 시간표 CRUD 인터페이스
- `ICourseRepository` - 강좌 검색 인터페이스
- Firestore 구현체 각각 존재

## Hooks

| 훅 | 용도 |
|----|------|
| `useTimetable` | 시간표 구독/관리 |

## useTimetable 상세

```typescript
const {
  timetable,       // 시간표 데이터
  courses,         // 등록된 강좌 상세 정보
  loading,         // 로딩 상태
  addCourse,       // 강좌 추가
  removeCourse,    // 강좌 제거
  clearTimetable,  // 시간표 초기화
} = useTimetable();
```

## 사용 화면
- `HomeScreen` - 시간표 섹션 (미리보기)
- `TimetableSection` - 시간표 컴포넌트

## Spring 마이그레이션 포인트
- `FirestoreTimetableRepository` → `SpringTimetableRepository` 구현체 교체
- 강좌 데이터: Firestore → RDB (courses 테이블)
