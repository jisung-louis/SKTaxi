# 마이그레이션 현재 상태

이 문서는 점진적 리팩터링 동안 현재 기준선을 짧게 기록하는 운영 문서다.  
다음 AI는 작업 시작 전에 이 문서를 먼저 확인하고, phase 경계가 바뀌거나 source of truth가 전환되면 내용을 갱신해야 한다.

## 현재 기준선

- 브랜치: `skuri-refactoring`
- 현재 기준 commit: `ba49768`
- 현재 상태: `Phase 0 완료 + 선행 cleanup 커밋 완료`
- 다음 작업 시작점: `Phase 1`

## source of truth 상태

아직 feature 단위 migration이 시작되지 않았으므로, 현재는 모든 feature의 source of truth가 legacy 경로에 있다.

- `auth`: legacy
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

## 운영 규칙

- feature migration을 시작하면 해당 feature의 source of truth를 즉시 `src/features/<feature>` 로 바꾼다.
- source of truth가 전환된 feature의 legacy 대응 파일에는 새 로직을 추가하지 않는다.
- 전환 이후 legacy 대응 파일은 shim, import 정리, 삭제만 허용한다.
- 이 문서의 상태와 실제 코드가 다르면, 다음 AI는 작업 전에 먼저 이 문서를 갱신한다.
