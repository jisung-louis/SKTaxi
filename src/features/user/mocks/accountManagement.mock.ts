import type {AccountManagementSource} from '../model/accountManagementSource';

export const accountManagementMockData: AccountManagementSource = {
  account: {
    accountHolder: '',
    accountNumber: '',
    bankName: '카카오뱅크',
    hideName: false,
  },
  bankNames: [
    '카카오뱅크',
    '토스뱅크',
    '국민은행',
    '신한은행',
    '하나은행',
    '우리은행',
    '기업은행',
    '농협은행',
    'SC제일은행',
    '씨티은행',
    '대구은행',
    '부산은행',
    '경남은행',
    '광주은행',
    '전북은행',
    '제주은행',
    'SH수협은행',
    '케이뱅크',
  ],
  infoLines: [
    '택시파티 정산 시 사용할 계좌 정보를 입력해주세요.',
    '다른 파티원에게 공유됩니다.',
  ],
};
