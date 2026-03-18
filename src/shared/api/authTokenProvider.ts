export interface AuthTokenRequestOptions {
  forceRefresh?: boolean;
}

export type AuthTokenResolver = (
  options?: AuthTokenRequestOptions,
) => Promise<string | null>;

let authTokenResolver: AuthTokenResolver | null = null;

export const registerAuthTokenResolver = (
  resolver: AuthTokenResolver,
): (() => void) => {
  authTokenResolver = resolver;

  return () => {
    if (authTokenResolver === resolver) {
      authTokenResolver = null;
    }
  };
};

export const clearAuthTokenResolver = () => {
  authTokenResolver = null;
};

export const hasAuthTokenResolver = () => authTokenResolver !== null;

export const getAuthToken = async (
  options?: AuthTokenRequestOptions,
): Promise<string | null> => {
  if (!authTokenResolver) {
    return null;
  }

  return authTokenResolver(options);
};

export const getAuthorizationHeaderValue = async (
  options?: AuthTokenRequestOptions,
): Promise<string | null> => {
  const token = await getAuthToken(options);

  if (!token) {
    return null;
  }

  return `Bearer ${token}`;
};

