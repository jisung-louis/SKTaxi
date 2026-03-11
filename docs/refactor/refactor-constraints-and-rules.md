# 리팩터링 제약 조건 및 의존성 규칙

이 문서는 리팩터링 중 반드시 지켜야 할 계약이다.  
리팩터링 AI는 이 규칙을 위반하는 구조를 만들면 안 된다.

## 1. 최상위 의존성 규칙

### 허용되는 방향

```text
app -> features -> shared
app -> shared
feature -> same feature
feature -> shared
```

### 금지되는 방향

```text
shared -> feature
shared -> app
feature A -> feature B internal path
screen -> Firebase SDK direct
screen -> repository implementation direct
navigation -> feature internal path
```

## 2. import 규칙

### `app/*`

허용:

- `shared/*`
- `features/*/index.ts`
- `app/*`

금지:

- `features/*/internal-path`
- Firebase SDK direct
- repository implementation direct

### `shared/*`

허용:

- `shared/*`

금지:

- `app/*`
- `features/*`

### `features/<feature>/*`

허용:

- 같은 feature 내부
- `shared/*`
- 다른 feature의 `index.ts` public API

금지:

- 다른 feature의 내부 파일 deep import
- `app/*`

## 3. feature 내부 계층 규칙

### `screens`

허용:

- 같은 feature의 `components`
- 같은 feature의 `hooks`
- 같은 feature의 `services`
- 같은 feature의 `model`
- `shared/ui`
- `shared/hooks`
- `shared/constants`

금지:

- Firebase SDK direct
- repository implementation direct
- 다른 feature 내부 경로 import

### `components`

허용:

- 같은 feature의 `hooks`
- 같은 feature의 `model`
- `shared/ui`
- `shared/constants`

권장:

- component는 가능한 한 presentational하게 유지

금지:

- Firebase SDK direct
- repository direct
- cross-feature business logic

### `hooks`

허용:

- 같은 feature의 `services`
- 같은 feature의 `model`
- 같은 feature의 `providers`
- `shared/*`

금지:

- raw Firebase SDK direct
- 다른 feature의 internal path

### `services`

허용:

- 같은 feature의 `data`
- 같은 feature의 `model`
- `shared/*`
- 다른 feature public API

금지:

- React component import
- navigation component import

### `data/repositories`

허용:

- 같은 feature의 `data/datasources`
- 같은 feature의 `model`
- `shared/lib/firebase`
- `shared/lib/errors`

금지:

- screen/component import
- navigation import

### `model`

허용:

- `shared/types`
- `shared/constants`
- pure utility only

금지:

- React import
- Firebase import
- navigation import

## 4. Firebase 접근 규칙

### 허용 위치

Firebase SDK import는 아래 위치에서만 허용한다.

- `src/shared/lib/firebase/*`
- `src/features/*/data/*`

### 금지 위치

- `screens`
- `components`
- `app/navigation`
- `shared/ui`
- root-level util/helper

## 5. Repository 생성 규칙

### 허용

repository 구현체 생성은 아래 위치에서만 허용한다.

- feature 내부 `data/composition`
- feature provider
- app provider 조합 지점

### 금지

- `lib/*.ts` 에서 `new FirestoreXRepository()`
- `utils/*.ts` 에서 `new FirestoreXRepository()`
- `screen` 내부 직접 생성

## 6. Navigation 규칙

navigation은 앱 조립 레이어다.  
navigation은 아래만 해야 한다.

- stack/tab route 구성
- app-level guard 적용
- feature screen 조립

navigation이 하면 안 되는 것:

- unread 계산
- Firestore 구독
- 권한 상태 장기 관리
- business branching
- modal business logic

### route naming 규칙

최종 구조에서는 route key를 English stable key로 통일한다.

예시:

- `HomeTab`
- `TaxiTab`
- `NoticeTab`
- `BoardTab`
- `ChatTab`
- `NoticeDetail`
- `BoardWrite`

탭 라벨의 한국어 표시는 route key가 아니라 UI label에서 처리한다.

## 7. Shared 규칙

shared는 "진짜 공용"만 가진다.

shared로 올릴 수 있는 것:

- button, input, dropdown 같은 UI primitive
- analytics helper
- date formatting helper
- error class
- firebase client accessor

shared로 올리면 안 되는 것:

- notice 전용 html renderer
- taxi 전용 파티 상태 계산
- board 전용 moderation action
- chat unread 도메인 계산

이런 코드는 각 feature 또는 cross-feature service로 둔다.

## 8. Home feature 규칙

home은 composition feature다.

허용:

- 다른 feature public API 조합
- dashboard section 렌더링
- 요약 데이터 orchestration

금지:

- home 전용 repository 추가
- 다른 feature 데이터 구조 복제
- taxi/notice/timetable/minecraft 도메인 로직 재구현

## 9. 금지 패턴

아래 패턴은 최종 구조에서 금지한다.

- `src/lib/*.ts` 가 repository 구현체를 직접 생성
- `src/utils/*.ts` 가 Firebase SDK를 직접 import
- `screen` 이 Firestore query를 직접 실행
- `feature A` 가 `feature B` 내부 경로를 직접 import
- `shared` 가 feature 코드를 import
- `navigation` 이 domain logic을 수행
- feature public API 없이 deep import 난립

## 10. export 규칙

각 feature는 반드시 public `index.ts` 를 가진다.

허용:

- `import {TaxiScreen} from '@/features/taxi';`

금지:

- `import {useParties} from '@/features/taxi/hooks/useParties';`
- `import {FirestorePartyRepository} from '@/features/taxi/data/repositories/FirestorePartyRepository';`

단, 같은 feature 내부에서는 내부 경로 import가 가능하다.

## 11. 파일 크기 가이드

새 구조에서는 아래를 목표로 한다.

- screen: 300줄 이하 권장
- hook/service: 250줄 이하 권장
- repository: 300줄 이하 권장

예외는 허용되지만, 400줄을 넘으면 분할 검토가 필수다.

## 12. 상태 관리 규칙

### app/global 상태

app에 둘 수 있는 상태는 다음뿐이다.

- provider composition
- navigation gate에 필요한 최소 상태

### feature 상태

feature 내부 상태는 해당 feature provider/hook이 소유한다.

예시:

- auth session: `features/auth`
- join request count: `features/taxi`
- course search cache: `features/timetable`
- user notification preferences: `features/user`

## 13. migration 규칙

리팩터링은 반드시 아래 순서를 따른다.

1. 구조 생성
2. 파일 이동
3. import 갱신
4. public API 정리
5. business logic 이동
6. 레거시 shim 제거

한 단계에서 구조 이동과 대규모 기능 변경을 동시에 하지 않는다.

### source of truth 규칙

점진적 마이그레이션 동안에는 feature마다 source of truth가 반드시 하나만 있어야 한다.

- 아직 migration을 시작하지 않은 feature는 legacy 경로가 source of truth다.
- migration을 시작한 feature는 즉시 `src/features/<feature>` 가 source of truth가 된다.
- source of truth가 `src/features/<feature>` 로 전환된 뒤에는 legacy 대응 파일에 새 로직을 추가하지 않는다.
- 전환 이후 legacy 대응 파일에는 re-export shim, import 정리, 삭제 작업만 허용한다.
- 같은 feature의 old/new 구조를 동시에 수정해서 로직을 분산시키면 안 된다.
- phase 경계가 바뀌거나 source of truth가 전환되면 `docs/refactor/migration-status.md` 를 함께 갱신한다.

## 14. 최종 완료 판정 체크리스트

아래 항목이 모두 충족되어야 최종 완료로 본다.

- `src` 아래 최상위가 `app`, `shared`, `features` 중심으로 정리되었다.
- `src/screens`, `src/components`, `src/hooks`, `src/repositories`, `src/contexts`, `src/lib`, `src/utils` 가 제거되었다.
- direct Firebase import가 허용 레이어 밖에서 사라졌다.
- `new Firestore*Repository()` 가 `lib/utils/screens` 에서 사라졌다.
- navigation은 feature public API만 사용한다.
- feature 간 deep import가 없다.
- shared는 feature/app를 import하지 않는다.
- 기존 기능 동작은 유지된다.
