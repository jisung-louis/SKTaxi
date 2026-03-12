import { getStorage, ref } from '@react-native-firebase/storage';

import {
  RepositoryError,
  RepositoryErrorCode,
} from '@/shared/lib/errors';

export interface UploadResult {
  url: string;
  path: string;
  filename: string;
  size: number;
  contentType: string;
}

export interface UploadProgressCallback {
  (progress: number): void;
}

export interface UploadOptions {
  path: string;
  filename?: string;
  onProgress?: UploadProgressCallback;
  maxSize?: number;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface IStorageRepository {
  uploadImage(uri: string, options: UploadOptions): Promise<UploadResult>;
  uploadFile(uri: string, options: UploadOptions): Promise<UploadResult>;
  deleteFile(path: string): Promise<void>;
  getDownloadUrl(path: string): Promise<string>;
}

export class FirestoreStorageRepository implements IStorageRepository {
  private readonly storage = getStorage();

  async uploadImage(uri: string, options: UploadOptions): Promise<UploadResult> {
    return this.uploadFile(uri, {
      ...options,
      maxSize: options.maxSize || 10 * 1024 * 1024,
    });
  }

  async uploadFile(uri: string, options: UploadOptions): Promise<UploadResult> {
    const { path, filename, onProgress, maxSize } = options;
    const finalFilename =
      filename || `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const fullPath = `${path}${finalFilename}`;

    try {
      const reference = ref(this.storage, fullPath);
      const task = reference.putFile(uri);

      if (onProgress) {
        task.on('state_changed', snapshot => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress);
        });
      }

      const snapshot = await task;

      if (maxSize && snapshot.totalBytes > maxSize) {
        await reference.delete();
        throw new RepositoryError(
          RepositoryErrorCode.VALIDATION_FAILED,
          `파일 크기가 ${Math.round(maxSize / 1024 / 1024)}MB를 초과합니다.`,
        );
      }

      const url = await reference.getDownloadURL();

      return {
        url,
        path: fullPath,
        filename: finalFilename,
        size: snapshot.totalBytes,
        contentType: snapshot.metadata?.contentType || 'application/octet-stream',
      };
    } catch (error) {
      if (error instanceof RepositoryError) {
        throw error;
      }

      throw RepositoryError.fromFirebaseError(error, { path: fullPath, uri });
    }
  }

  async deleteFile(path: string): Promise<void> {
    try {
      const reference = ref(this.storage, path);
      await reference.delete();
    } catch (error: any) {
      if (error?.code === 'storage/object-not-found') {
        return;
      }

      throw RepositoryError.fromFirebaseError(error, { path });
    }
  }

  async getDownloadUrl(path: string): Promise<string> {
    try {
      const reference = ref(this.storage, path);
      return await reference.getDownloadURL();
    } catch (error) {
      throw RepositoryError.fromFirebaseError(error, { path });
    }
  }
}
