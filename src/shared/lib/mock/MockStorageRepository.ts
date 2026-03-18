import type {
  IStorageRepository,
  UploadOptions,
  UploadResult,
} from '@/shared/lib/firebase/storageRepository';

const MOCK_HOST = 'https://mock-storage.skuri.local';

const resolveFilename = (uri: string, filename?: string) => {
  if (filename) {
    return filename;
  }

  const lastSegment = uri.split('/').pop();
  if (lastSegment && lastSegment.trim().length > 0) {
    return lastSegment;
  }

  return `${Date.now()}.jpg`;
};

const buildResult = (uri: string, options: UploadOptions): UploadResult => {
  const filename = resolveFilename(uri, options.filename);
  const path = `${options.path}${filename}`;

  options.onProgress?.(100);

  return {
    url: `${MOCK_HOST}/${path}`,
    path,
    filename,
    size: 1024,
    contentType: 'image/jpeg',
  };
};

export class MockStorageRepository implements IStorageRepository {
  async uploadImage(uri: string, options: UploadOptions): Promise<UploadResult> {
    return buildResult(uri, options);
  }

  async uploadFile(uri: string, options: UploadOptions): Promise<UploadResult> {
    return buildResult(uri, options);
  }

  async deleteFile(_path: string): Promise<void> {}

  async getDownloadUrl(path: string): Promise<string> {
    return `${MOCK_HOST}/${path}`;
  }
}
