import {MockAppSettingRepository} from './MockAppSettingRepository';

import type {IAppSettingRepository} from './IAppSettingRepository';

export const appSettingRepository: IAppSettingRepository =
  new MockAppSettingRepository();
