// SKTaxi: Inquiry Repository 인터페이스 - 문의 관련 데이터 접근 추상화

/**
 * 문의 타입
 */
export type InquiryType = 'bug' | 'feature' | 'account' | 'etc';

/**
 * 문의 데이터
 */
export interface Inquiry {
  id: string;
  userId: string;
  userEmail: string;
  type: InquiryType;
  title: string;
  content: string;
  deviceInfo?: string;
  appVersion?: string;
  createdAt: Date;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
}

/**
 * 문의 생성 데이터
 */
export interface CreateInquiryData {
  userId: string;
  userEmail: string;
  type: InquiryType;
  title: string;
  content: string;
  deviceInfo?: string;
  appVersion?: string;
}

/**
 * Inquiry Repository 인터페이스
 */
export interface IInquiryRepository {
  /**
   * 문의 제출
   * @param data - 문의 데이터
   * @returns 생성된 문의 ID
   */
  submitInquiry(data: CreateInquiryData): Promise<string>;

  /**
   * 사용자의 문의 목록 조회
   * @param userId - 사용자 ID
   * @returns 문의 목록
   */
  getInquiriesByUser(userId: string): Promise<Inquiry[]>;

  /**
   * 특정 문의 조회
   * @param inquiryId - 문의 ID
   * @returns 문의 데이터 또는 null
   */
  getInquiry(inquiryId: string): Promise<Inquiry | null>;
}
