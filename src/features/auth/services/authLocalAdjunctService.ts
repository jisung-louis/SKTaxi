import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthLocalAdjunct {
  permissionsComplete: boolean;
}

const AUTH_LOCAL_ADJUNCT_STORAGE_KEY_PREFIX = '@skuri/auth/local-adjunct';

const buildAuthLocalAdjunctStorageKey = (userId: string) =>
  `${AUTH_LOCAL_ADJUNCT_STORAGE_KEY_PREFIX}/${userId}`;

const createDefaultAuthLocalAdjunct = (): AuthLocalAdjunct => ({
  permissionsComplete: false,
});

export const loadAuthLocalAdjunct = async (
  userId: string,
): Promise<AuthLocalAdjunct> => {
  try {
    const stored = await AsyncStorage.getItem(
      buildAuthLocalAdjunctStorageKey(userId),
    );

    if (!stored) {
      return createDefaultAuthLocalAdjunct();
    }

    const parsed = JSON.parse(stored);

    return {
      permissionsComplete: Boolean(parsed?.permissionsComplete),
    };
  } catch (error) {
    console.warn('auth local adjunct 로드 실패:', error);
    return createDefaultAuthLocalAdjunct();
  }
};

export const saveAuthLocalAdjunct = async (
  userId: string,
  adjunct: AuthLocalAdjunct,
): Promise<AuthLocalAdjunct> => {
  const normalizedAdjunct: AuthLocalAdjunct = {
    permissionsComplete: Boolean(adjunct.permissionsComplete),
  };

  await AsyncStorage.setItem(
    buildAuthLocalAdjunctStorageKey(userId),
    JSON.stringify(normalizedAdjunct),
  );

  return normalizedAdjunct;
};
