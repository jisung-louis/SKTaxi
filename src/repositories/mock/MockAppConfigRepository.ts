// SKTaxi: App Config Repository Mock 구현체 (테스트용)

import { IAppConfigRepository, AppVersionInfo } from '../interfaces/IAppConfigRepository';

export class MockAppConfigRepository implements IAppConfigRepository {
  async getMinimumRequiredVersion(_platform: 'ios' | 'android'): Promise<AppVersionInfo | null> {
    return {
      minimumVersion: '1.0.0',
      forceUpdate: false,
      modalConfig: {
        title: '업데이트 안내',
        message: '새로운 버전이 있습니다.',
        showButton: true,
        buttonText: '업데이트',
      },
    };
  }
}
