// SKTaxi: 앱 설정 Repository 인터페이스
// 앱 버전 정보, 원격 설정 등을 추상화

import type { AppVersionInfo, VersionModalConfig } from '@/shared/types/version';

export type { AppVersionInfo, VersionModalConfig };

export interface IAppConfigRepository {
  /**
   * 플랫폼별 최소 필수 버전 정보를 가져옵니다
   * @param platform - 플랫폼 ('ios' | 'android')
   */
  getMinimumRequiredVersion(platform: 'ios' | 'android'): Promise<AppVersionInfo | null>;
}
