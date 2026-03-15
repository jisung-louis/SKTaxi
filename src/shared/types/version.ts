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
