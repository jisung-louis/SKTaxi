// SKTaxi: Storage Repository Firebase 구현체

import storage from '@react-native-firebase/storage';
import { getApp } from '@react-native-firebase/app';

import {
  IStorageRepository,
  UploadResult,
  UploadOptions,
} from '../interfaces/IStorageRepository';
import { RepositoryError, RepositoryErrorCode } from '../../errors';

/**
 * Firebase Storage 기반 Storage Repository 구현체
 */
export class FirestoreStorageRepository implements IStorageRepository {
  private readonly storageRef = storage(getApp());

  async uploadImage(uri: string, options: UploadOptions): Promise<UploadResult> {
    return this.uploadFile(uri, {
      ...options,
      // 이미지 기본 설정
      maxSize: options.maxSize || 10 * 1024 * 1024, // 10MB
    });
  }

  async uploadFile(uri: string, options: UploadOptions): Promise<UploadResult> {
    const { path, filename, onProgress, maxSize } = options;

    // 파일명 생성
    const finalFilename = filename || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullPath = `${path}${finalFilename}`;

    try {
      const reference = this.storageRef.ref(fullPath);
      const task = reference.putFile(uri);

      // 진행률 콜백
      if (onProgress) {
        task.on('state_changed', (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress);
        });
      }

      // 업로드 완료 대기
      const snapshot = await task;

      // 파일 크기 확인
      if (maxSize && snapshot.totalBytes > maxSize) {
        await reference.delete();
        throw new RepositoryError(
          RepositoryErrorCode.VALIDATION_FAILED,
          `파일 크기가 ${Math.round(maxSize / 1024 / 1024)}MB를 초과합니다.`
        );
      }

      // 다운로드 URL 조회
      const url = await reference.getDownloadURL();

      return {
        url,
        path: fullPath,
        filename: finalFilename,
        size: snapshot.totalBytes,
        contentType: snapshot.metadata?.contentType || 'application/octet-stream',
      };
    } catch (error: any) {
      if (error instanceof RepositoryError) {
        throw error;
      }
      throw RepositoryError.fromFirebaseError(error, { path: fullPath, uri });
    }
  }

  async deleteFile(path: string): Promise<void> {
    try {
      const reference = this.storageRef.ref(path);
      await reference.delete();
    } catch (error: any) {
      // 파일이 이미 없는 경우 무시
      if (error?.code === 'storage/object-not-found') {
        return;
      }
      throw RepositoryError.fromFirebaseError(error, { path });
    }
  }

  async getDownloadUrl(path: string): Promise<string> {
    try {
      const reference = this.storageRef.ref(path);
      return await reference.getDownloadURL();
    } catch (error: any) {
      throw RepositoryError.fromFirebaseError(error, { path });
    }
  }
}
