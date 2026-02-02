# Firebase v22 마이그레이션 문서 가이드

이 폴더에는 React Native Firebase v22 Modular API로 마이그레이션하기 위한 완전한 가이드가 포함되어 있습니다.

## 📚 문서 목록

### 1. `firebase-v22-summary.md` ⭐ **여기서 시작하세요**
- 전체 마이그레이션 요약
- 핵심 변환 패턴
- 빠른 시작 가이드
- **읽는 시간**: 5분

### 2. `firebase-v22-migration-plan.md` 📋 **상세 계획**
- 31개 수정 파일 전체 목록
- Phase별 작업 순서
- 서비스별 API 변환표 (Auth, Firestore, Storage, Messaging, Crashlytics, Database)
- 테스트 계획 및 체크리스트
- **읽는 시간**: 20분

### 3. `firebase-v22-file-by-file-guide.md` 🔧 **실전 가이드**
- 각 파일의 Before/After 코드
- 31개 파일별 구체적인 수정 방법
- 공통 패턴 정리
- **읽는 시간**: 작업하면서 참조

### 4. `firebase-v22-quick-reference.md` ⚡ **빠른 참조**
- 서비스별 Quick Snippet 모음
- 자주 사용하는 패턴
- 디버깅 명령어
- **읽는 시간**: 필요할 때 검색

## 🚀 추천 학습 순서

```
1. firebase-v22-summary.md 읽기 (5분)
   ↓
2. firebase-v22-migration-plan.md의 "서비스별 마이그레이션 가이드" 섹션 읽기 (10분)
   ↓
3. Phase 1 시작 (App.tsx 수정)
   ↓
4. firebase-v22-file-by-file-guide.md 참조하며 작업
   ↓
5. 막힐 때마다 firebase-v22-quick-reference.md 검색
```

## 📊 작업 현황 추적

### 체크리스트
- [ ] 문서 읽기 완료
- [ ] Phase 1 (Core) - 2개 파일
- [ ] Phase 2 (Screens) - 5개 파일
- [ ] Phase 3 (Repositories) - 5개 파일
- [ ] Phase 4 (Hooks) - 3개 파일
- [ ] Phase 5 (Utilities) - 5개 파일
- [ ] Phase 6 (Legacy) - 사용 여부 확인
- [ ] 전체 테스트 및 Warning 0개 확인

### 진행률 확인 명령어
```bash
# 아직 수정 안된 파일 개수
grep -r "import auth from\|import firestore from\|import storage from" src/ App.tsx | wc -l

# Warning 개수 확인 (앱 실행 후)
# Metro bundler 로그에서 "deprecated" 검색
```

## 🆘 도움이 필요한 경우

1. **특정 API 변환 방법을 모르겠다면**
   - `firebase-v22-quick-reference.md`에서 해당 서비스 검색

2. **특정 파일을 어떻게 수정할지 모르겠다면**
   - `firebase-v22-file-by-file-guide.md`에서 해당 파일명 검색

3. **전체적인 흐름을 파악하고 싶다면**
   - `firebase-v22-migration-plan.md`의 "단계별 마이그레이션 계획" 섹션 참조

4. **에러가 발생했다면**
   - `firebase-v22-migration-plan.md`의 "문제 발생 시" 섹션 참조

## 📖 외부 참고 자료

- [공식 마이그레이션 가이드](https://rnfirebase.io/migrating-to-v22)
- [Firebase Web Modular API](https://firebase.google.com/docs/web/modular-upgrade)
- [React Native Firebase 공식 문서](https://rnfirebase.io)

---

**작성일**: 2026-02-02  
**목표**: Deprecated Warning 0개 달성
