import type { IAppConfigRepository } from './IAppConfigRepository';
import type { AppVersionInfo } from '@/shared/types/version';

const versionInfoByPlatform: Record<'ios' | 'android', AppVersionInfo> = {
  ios: {
    minimumVersion: '0.0.1',
    forceUpdate: false,
  },
  android: {
    minimumVersion: '0.0.1',
    forceUpdate: false,
  },
};

export class MockAppConfigRepository implements IAppConfigRepository {
  async getMinimumRequiredVersion(
    platform: 'ios' | 'android',
  ): Promise<AppVersionInfo | null> {
    return versionInfoByPlatform[platform];
  }
}
