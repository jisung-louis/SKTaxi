import {httpClient, type ApiSuccessResponse} from '@/shared/api';

import type {
  DeleteMemberFcmTokenRequestDto,
  RegisterMemberFcmTokenRequestDto,
} from '../dto/fcmTokenDto';
import type {MemberResponseDto} from '../dto/memberDto';
import type {UpdateMemberBankAccountRequestDto} from '../dto/updateMemberBankAccountDto';
import type {UpdateMemberNotificationSettingsRequestDto} from '../dto/updateMemberNotificationSettingsDto';
import type {UpdateMemberProfileRequestDto} from '../dto/updateMemberProfileDto';

export class MemberApiClient {
  createMember() {
    return httpClient.post<ApiSuccessResponse<MemberResponseDto>>(
      '/v1/members',
    );
  }

  getMyMemberProfile() {
    return httpClient.get<ApiSuccessResponse<MemberResponseDto>>(
      '/v1/members/me',
    );
  }

  updateMyProfile(data: UpdateMemberProfileRequestDto) {
    return httpClient.patch<
      ApiSuccessResponse<MemberResponseDto>,
      UpdateMemberProfileRequestDto
    >('/v1/members/me', data);
  }

  updateMyBankAccount(data: UpdateMemberBankAccountRequestDto) {
    return httpClient.put<
      ApiSuccessResponse<MemberResponseDto>,
      UpdateMemberBankAccountRequestDto
    >('/v1/members/me/bank-account', data);
  }

  updateMyNotificationSettings(
    data: UpdateMemberNotificationSettingsRequestDto,
  ) {
    return httpClient.patch<
      ApiSuccessResponse<MemberResponseDto>,
      UpdateMemberNotificationSettingsRequestDto
    >('/v1/members/me/notification-settings', data);
  }

  registerFcmToken(data: RegisterMemberFcmTokenRequestDto) {
    return httpClient.post<
      ApiSuccessResponse<null>,
      RegisterMemberFcmTokenRequestDto
    >('/v1/members/me/fcm-tokens', data);
  }

  deleteFcmToken(data: DeleteMemberFcmTokenRequestDto) {
    return httpClient.request<
      ApiSuccessResponse<null>,
      DeleteMemberFcmTokenRequestDto
    >({
      method: 'DELETE',
      url: '/v1/members/me/fcm-tokens',
      data,
    });
  }
}

export const memberApiClient = new MemberApiClient();
