export interface RegisterMemberFcmTokenRequestDto {
  appVersion?: string;
  token: string;
  platform: 'ios' | 'android';
}

export interface DeleteMemberFcmTokenRequestDto {
  token: string;
}
