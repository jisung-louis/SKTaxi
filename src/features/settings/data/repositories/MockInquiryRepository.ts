import type {
  CreateInquiryData,
  IInquiryRepository,
  Inquiry,
} from './IInquiryRepository';

const submittedInquiries = new Map<string, Inquiry>();

export class MockInquiryRepository implements IInquiryRepository {
  async submitInquiry(data: CreateInquiryData): Promise<string> {
    const id = `mock-inquiry-${Date.now()}`;
    submittedInquiries.set(id, {
      id,
      ...data,
      createdAt: new Date(),
      status: 'pending',
    });

    return id;
  }

  async getInquiriesByUser(userId: string): Promise<Inquiry[]> {
    return Array.from(submittedInquiries.values()).filter(
      inquiry => inquiry.userId === userId,
    );
  }

  async getInquiry(inquiryId: string): Promise<Inquiry | null> {
    return submittedInquiries.get(inquiryId) ?? null;
  }
}
