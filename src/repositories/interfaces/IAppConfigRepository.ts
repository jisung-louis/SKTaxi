// SKTaxi: 앱 설정 Repository 인터페이스
// 앱 버전 정보, 원격 설정 등을 추상화

export interface VersionModalConfig {
  icon?: string;
  title?: string;
  message?: string;
  showButton?: boolean;
  buttonText?: string;
  buttonUrl?: string;
}

export interface AppVersionInfo {
  minimumVersion: string;
  forceUpdate: boolean;
  modalConfig?: VersionModalConfig;
}

export interface IAppConfigRepository {
  /**
   * 플랫폼별 최소 필수 버전 정보를 가져옵니다
   * @param platform - 플랫폼 ('ios' | 'android')
   */
  getMinimumRequiredVersion(platform: 'ios' | 'android'): Promise<AppVersionInfo | null>;
}
