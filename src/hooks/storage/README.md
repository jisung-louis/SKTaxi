# Storage Domain (파일 저장)

## 개요
이미지 업로드 및 파일 저장 기능.

## Firebase 서비스
- Firebase Storage - 파일 저장

## Repository
- `IStorageRepository` - 파일 업로드 인터페이스
- `FirestoreStorageRepository` - Firebase Storage 구현체

## Hooks

| 훅 | 용도 |
|----|------|
| `useImageUpload` | 이미지 선택/업로드/관리 |

## useImageUpload 상세

```typescript
const {
  images,           // 선택된 이미지 목록
  uploading,        // 업로드 중 여부
  pickImage,        // 갤러리에서 선택
  takePhoto,        // 카메라로 촬영
  removeImage,      // 이미지 제거
  reorderImages,    // 순서 변경
  uploadImages,     // 서버에 업로드
} = useImageUpload();
```

## 사용 화면
- `BoardWriteScreen` - 게시글 작성 시 이미지 첨부
- `BoardEditScreen` - 게시글 수정 시 이미지 관리

## Spring 마이그레이션 포인트
- `FirestoreStorageRepository` → `SpringStorageRepository` 구현체 교체
- Firebase Storage → S3/MinIO 등 Object Storage
- 업로드 URL: Firebase Storage URL → Spring 서버 엔드포인트
