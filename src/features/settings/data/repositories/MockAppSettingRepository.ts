import {getCurrentAppVersion} from '../../services/appVersionService';
import {appSettingMockData} from '../../mocks/appSetting.mock';
import type {AppSettingScreenSource} from '../../model/appSettingSource';

import type {IAppSettingRepository} from './IAppSettingRepository';

const MOCK_DELAY_MS = 120;

export class MockAppSettingRepository implements IAppSettingRepository {
  async getAppSettings(): Promise<AppSettingScreenSource> {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));

    return {
      sections: appSettingMockData.sections.map(section => ({
        ...section,
        items: section.items.map(item =>
          item.actionKey === 'appVersion'
            ? {...item, value: `v${getCurrentAppVersion()}`}
            : {...item},
        ),
      })),
    };
  }
}
