# User Screens Backend API Gaps

`MyScreen`과 `AccountModificationScreen`은 실제 API 연결을 진행한다.
다만 아래 항목은 현재 백엔드 API가 없거나, 프론트 화면 요구사항을 충족하기에 아직 부족해서 mock 상태를 유지한다.

## 1. 공지 북마크 API

현재 확인된 API:

- 커뮤니티 게시글 북마크 목록: `GET /v1/members/me/bookmarks`
- 커뮤니티 게시글 북마크 토글: `POST/DELETE /v1/posts/{postId}/bookmark`

현재 부족한 점:

- 공지사항 북마크 목록 조회 API가 없다.
- 공지사항 북마크 추가/삭제 API가 없다.
- `BookmarksScreen`은 커뮤니티 북마크와 공지 북마크를 함께 보여주므로, 한쪽만 실제 API로 붙이면 화면/통계가 불일치한다.

필요 API 제안:

- `GET /v1/members/me/notice-bookmarks`
  - 설명: 현재 사용자가 북마크한 공지사항 목록 조회
- `POST /v1/notices/{noticeId}/bookmark`
  - 설명: 공지사항 북마크 추가
- `DELETE /v1/notices/{noticeId}/bookmark`
  - 설명: 공지사항 북마크 제거

권장 응답 필드:

- `id`
- `title`
- `category` 또는 `categoryLabel`
- `summary` 또는 `excerpt`
- `createdAt`

추가 메모:

- 제품 정책상 `북마크`를 커뮤니티와 공지로 계속 합산해서 보여줄 계획이면, `MyScreen` 통계에 바로 쓸 수 있는 북마크 총 개수 응답도 있으면 좋다.

## 2. 택시 이용 내역 API

현재 부족한 점:

- `TaxiHistoryScreen`을 구성할 수 있는 API를 아직 찾지 못했다.
- `MyScreen`의 `택시 이용` 통계도 동일한 이유로 실제 API 연결을 하지 못했다.

필요 API 제안:

- `GET /v1/members/me/taxi-history`
  - 설명: 현재 사용자의 택시 이용 내역 목록 조회
- `GET /v1/members/me/taxi-history/summary`
  - 설명: 마이페이지/이용내역 상단 요약 정보 조회

권장 응답 필드:

- 목록
  - `id`
  - `departureLabel`
  - `arrivalLabel`
  - `dateTime`
  - `passengerCount`
  - `paymentAmount`
  - `role` (`LEADER` / `MEMBER`)
  - `status` (`COMPLETED` / `CANCELLED` 등)
- 요약
  - `completedRideCount`
  - `savedFareAmount`

추가 메모:

- 프론트는 현재 목록과 요약을 분리해 쓰고 있으므로, 하나의 API에서 둘 다 내려주거나 별도 summary API를 제공해도 된다.
