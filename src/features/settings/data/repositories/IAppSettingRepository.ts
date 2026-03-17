import type {AppSettingScreenSource} from '../../model/appSettingSource';

export interface IAppSettingRepository {
  getAppSettings(): Promise<AppSettingScreenSource>;
}
