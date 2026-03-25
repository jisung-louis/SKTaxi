import {withdrawUser} from '../data/withdrawUser';
import type {UserLoginProvider} from '../model/types';

export const DEFAULT_USER_DISPLAY_NAME = '스쿠리 유저';

export const getUserLoginProvider = (
  providerId?: string | null,
): UserLoginProvider => {
  if (providerId === 'google.com') {
    return 'google';
  }

  if (providerId === 'password') {
    return 'email';
  }

  return 'unknown';
};

export const withdrawCurrentUser = async ({
  password,
  userId,
}: {
  password?: string;
  userId: string;
}) => {
  await withdrawUser(userId, password);
};
