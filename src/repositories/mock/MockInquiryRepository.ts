// SKTaxi: Inquiry Repository Mock 구현체
// 테스트 및 개발용 Mock 데이터 제공

import {
  IInquiryRepository,
  Inquiry,
  CreateInquiryData,
} from '../interfaces/IInquiryRepository';

/**
 * Mock Inquiry Repository 구현체
 */
export class MockInquiryRepository implements IInquiryRepository {
  private inquiries: Map<string, Inquiry> = new Map();

  async submitInquiry(data: CreateInquiryData): Promise<string> {
    const id = `inquiry-${Date.now()}`;
    const inquiry: Inquiry = {
      id,
      userId: data.userId,
      userEmail: data.userEmail,
      type: data.type,
      title: data.title,
      content: data.content,
      deviceInfo: data.deviceInfo,
      appVersion: data.appVersion,
      createdAt: new Date(),
      status: 'pending',
    };
    this.inquiries.set(id, inquiry);
    console.log(`[Mock] 문의 접수 완료: ${id}`);
    return id;
  }

  async getInquiriesByUser(userId: string): Promise<Inquiry[]> {
    return Array.from(this.inquiries.values())
      .filter(inquiry => inquiry.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getInquiry(inquiryId: string): Promise<Inquiry | null> {
    return this.inquiries.get(inquiryId) || null;
  }

  // 테스트용 헬퍼 메서드
  addMockInquiry(inquiry: Inquiry): void {
    this.inquiries.set(inquiry.id, inquiry);
  }

  clearMockData(): void {
    this.inquiries.clear();
  }
}
