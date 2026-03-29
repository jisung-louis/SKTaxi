import { Platform } from 'react-native';

import type { VersionModalConfig } from '@/shared/types/version';

import { appConfigRepository } from '../data/composition/settingsRuntime';

export type { VersionModalConfig } from '@/shared/types/version';

export type VersionCheckResult =
  | {
      status: 'success';
      needsUpdate: boolean;
      forceUpdate: boolean;
      minimumVersion: string;
      modalConfig?: VersionModalConfig;
    }
  | {
      status: 'error';
    };

export function getCurrentAppVersion(): string {
  try {
    try {
      const DeviceInfo = require('react-native-device-info');
      if (DeviceInfo && DeviceInfo.getVersion) {
        return DeviceInfo.getVersion();
      }
    } catch {
      // ignore optional dependency lookup failure
    }

    const packageJson = require('../../../../package.json');
    const fallbackVersion = packageJson.version || '0.0.1';

    console.warn(
      '⚠️ react-native-device-info가 설치되지 않아 package.json 버전을 사용합니다.\n' +
        `현재 버전: ${fallbackVersion}\n` +
        '실제 앱 버전을 가져오려면: npm install react-native-device-info',
    );

    return fallbackVersion;
  } catch (error) {
    console.warn('버전 정보를 가져올 수 없습니다:', error);
    return '0.0.1';
  }
}

function parseVersion(version: string): number[] {
  return version.split('.').map(Number).filter(n => !Number.isNaN(n));
}

function isVersionLessThan(v1: string, v2: string): boolean {
  const v1Parts = parseVersion(v1);
  const v2Parts = parseVersion(v2);
  const maxLength = Math.max(v1Parts.length, v2Parts.length);

  for (let index = 0; index < maxLength; index += 1) {
    const v1Part = v1Parts[index] || 0;
    const v2Part = v2Parts[index] || 0;

    if (v1Part < v2Part) {
      return true;
    }
    if (v1Part > v2Part) {
      return false;
    }
  }

  return false;
}

export async function getMinimumRequiredVersion(): Promise<{
  version: string;
  forceUpdate: boolean;
  modalConfig?: VersionModalConfig;
} | null> {
  const platform = Platform.OS as 'ios' | 'android';
  const versionInfo = await appConfigRepository.getMinimumRequiredVersion(platform);

  if (!versionInfo) {
    return null;
  }

  return {
    version: versionInfo.minimumVersion,
    forceUpdate: versionInfo.forceUpdate,
    modalConfig: versionInfo.modalConfig,
  };
}

export async function checkVersionUpdate(): Promise<VersionCheckResult> {
  try {
    const currentVersion = getCurrentAppVersion();
    const versionInfo = await getMinimumRequiredVersion();

    if (!versionInfo) {
      return {
        status: 'success',
        needsUpdate: false,
        forceUpdate: false,
        minimumVersion: currentVersion,
      };
    }

    const needsUpdate = isVersionLessThan(currentVersion, versionInfo.version);

    return {
      status: 'success',
      needsUpdate,
      forceUpdate: versionInfo.forceUpdate && needsUpdate,
      minimumVersion: versionInfo.version,
      modalConfig: versionInfo.modalConfig,
    };
  } catch (error) {
    console.error('버전 체크 중 오류:', error);
    return {status: 'error'};
  }
}
