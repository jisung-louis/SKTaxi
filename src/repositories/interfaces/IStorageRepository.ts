// SKTaxi: Storage Repository 인터페이스 - 파일 저장소 접근 추상화

/**
 * 업로드 결과
 */
export interface UploadResult {
  url: string;
  path: string;
  filename: string;
  size: number;
  contentType: string;
}

/**
 * 업로드 진행 콜백
 */
export interface UploadProgressCallback {
  (progress: number): void; // 0-100
}

/**
 * 업로드 옵션
 */
export interface UploadOptions {
  /**
   * 저장 경로 (예: 'profiles/', 'board/images/')
   */
  path: string;
  
  /**
   * 파일 이름 (없으면 자동 생성)
   */
  filename?: string;
  
  /**
   * 진행률 콜백
   */
  onProgress?: UploadProgressCallback;
  
  /**
   * 최대 파일 크기 (bytes)
   */
  maxSize?: number;
  
  /**
   * 이미지 압축 품질 (0-1)
   */
  quality?: number;
  
  /**
   * 이미지 최대 너비 (리사이징)
   */
  maxWidth?: number;
  
  /**
   * 이미지 최대 높이 (리사이징)
   */
  maxHeight?: number;
}

/**
 * Storage Repository 인터페이스
 */
export interface IStorageRepository {
  /**
   * 이미지 업로드
   * @param uri - 로컬 파일 URI
   * @param options - 업로드 옵션
   * @returns 업로드 결과
   */
  uploadImage(uri: string, options: UploadOptions): Promise<UploadResult>;

  /**
   * 파일 업로드
   * @param uri - 로컬 파일 URI
   * @param options - 업로드 옵션
   * @returns 업로드 결과
   */
  uploadFile(uri: string, options: UploadOptions): Promise<UploadResult>;

  /**
   * 파일 삭제
   * @param path - 저장소 경로
   */
  deleteFile(path: string): Promise<void>;

  /**
   * 다운로드 URL 조회
   * @param path - 저장소 경로
   * @returns 다운로드 URL
   */
  getDownloadUrl(path: string): Promise<string>;
}
