export interface RegisterMemberFcmTokenRequestDto {
  token: string;
  platform: 'ios' | 'android';
}

export interface DeleteMemberFcmTokenRequestDto {
  token: string;
}
