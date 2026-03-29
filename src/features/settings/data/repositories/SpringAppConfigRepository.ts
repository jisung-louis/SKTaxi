import type {AppVersionInfo, IAppConfigRepository, VersionModalConfig} from './IAppConfigRepository';

import {
  appVersionApiClient,
  AppVersionApiClient,
} from '../api/appVersionApiClient';

export class SpringAppConfigRepository implements IAppConfigRepository {
  constructor(
    private readonly apiClient: AppVersionApiClient = appVersionApiClient,
  ) {}

  async getMinimumRequiredVersion(
    platform: 'ios' | 'android',
  ): Promise<AppVersionInfo | null> {
    const response = await this.apiClient.getAppVersion(platform);
    const data = response.data;
    const modalConfig: VersionModalConfig = {};

    if (data.title) {
      modalConfig.title = data.title;
    }

    if (data.message) {
      modalConfig.message = data.message;
    }

    modalConfig.showButton = data.showButton;

    if (data.buttonText) {
      modalConfig.buttonText = data.buttonText;
    }

    if (data.buttonUrl) {
      modalConfig.buttonUrl = data.buttonUrl;
    }

    return {
      minimumVersion: data.minimumVersion,
      forceUpdate: data.forceUpdate,
      modalConfig:
        Object.keys(modalConfig).length > 0 ? modalConfig : undefined,
    };
  }
}
