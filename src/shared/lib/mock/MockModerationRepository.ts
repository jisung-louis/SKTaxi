import type {
  IModerationRepository,
  ReportDoc,
  ReportPayload,
} from '@/shared/lib/moderation';

const reports = new Map<string, ReportDoc>();
const blocks = new Map<string, Set<string>>();

const makeReportId = () => `mock-report-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export class MockModerationRepository implements IModerationRepository {
  async createReport(
    reporterId: string,
    payload: ReportPayload,
  ): Promise<string> {
    const id = makeReportId();
    const now = new Date().toISOString();

    reports.set(id, {
      ...payload,
      reporterId,
      status: 'open',
      createdAt: now,
      updatedAt: now,
    });

    return id;
  }

  async blockUser(blockerId: string, blockedUserId: string): Promise<void> {
    const blockedUsers = blocks.get(blockerId) ?? new Set<string>();
    blockedUsers.add(blockedUserId);
    blocks.set(blockerId, blockedUsers);
  }

  async unblockUser(blockerId: string, blockedUserId: string): Promise<void> {
    blocks.get(blockerId)?.delete(blockedUserId);
  }

  async isBlocked(viewerId: string, authorId: string): Promise<boolean> {
    return blocks.get(viewerId)?.has(authorId) ?? false;
  }

  async isMutuallyBlocked(viewerId: string, authorId: string): Promise<boolean> {
    return (
      (blocks.get(viewerId)?.has(authorId) ?? false) ||
      (blocks.get(authorId)?.has(viewerId) ?? false)
    );
  }

  async countOpenReports(): Promise<number> {
    return Array.from(reports.values()).filter(report => report.status === 'open').length;
  }
}
