// SKTaxi: App Config Repository Firebase 구현체
// 앱 버전 정보 Firebase Firestore 구현

import firestore from '@react-native-firebase/firestore';
import {
  IAppConfigRepository,
  AppVersionInfo,
  VersionModalConfig,
} from '../interfaces/IAppConfigRepository';

export class FirestoreAppConfigRepository implements IAppConfigRepository {
  private db = firestore();

  async getMinimumRequiredVersion(platform: 'ios' | 'android'): Promise<AppVersionInfo | null> {
    try {
      const versionDoc = await this.db
        .collection('appVersion')
        .doc(platform)
        .get();

      if (!versionDoc.exists()) {
        return null;
      }

      const data = versionDoc.data();
      const modalConfig: VersionModalConfig = {};

      if (data?.icon !== undefined) modalConfig.icon = data.icon;
      if (data?.title !== undefined) modalConfig.title = data.title;
      if (data?.message !== undefined) modalConfig.message = data.message;
      if (data?.showButton !== undefined) modalConfig.showButton = data.showButton;
      if (data?.buttonText !== undefined) modalConfig.buttonText = data.buttonText;
      if (data?.buttonUrl !== undefined) modalConfig.buttonUrl = data.buttonUrl;

      return {
        minimumVersion: data?.minimumVersion || '0.0.1',
        forceUpdate: data?.forceUpdate || false,
        modalConfig: Object.keys(modalConfig).length > 0 ? modalConfig : undefined,
      };
    } catch (error) {
      console.error('최소 필수 버전 정보를 가져오는 중 오류:', error);
      return null;
    }
  }
}
