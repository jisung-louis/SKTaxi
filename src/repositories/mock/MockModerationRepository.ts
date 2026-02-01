// SKTaxi: Moderation Repository Mock 구현체 (테스트용)

import { IModerationRepository, ReportPayload } from '../interfaces/IModerationRepository';

export class MockModerationRepository implements IModerationRepository {
  private blockedUsers: Map<string, Set<string>> = new Map();
  private reports: string[] = [];

  async createReport(_reporterId: string, _payload: ReportPayload): Promise<string> {
    const id = `report-${Date.now()}`;
    this.reports.push(id);
    return id;
  }

  async blockUser(blockerId: string, blockedUserId: string): Promise<void> {
    if (!this.blockedUsers.has(blockerId)) {
      this.blockedUsers.set(blockerId, new Set());
    }
    this.blockedUsers.get(blockerId)!.add(blockedUserId);
  }

  async unblockUser(blockerId: string, blockedUserId: string): Promise<void> {
    this.blockedUsers.get(blockerId)?.delete(blockedUserId);
  }

  async isBlocked(viewerId: string, authorId: string): Promise<boolean> {
    return this.blockedUsers.get(viewerId)?.has(authorId) ?? false;
  }

  async isMutuallyBlocked(viewerId: string, authorId: string): Promise<boolean> {
    const viewerBlocked = this.blockedUsers.get(viewerId)?.has(authorId) ?? false;
    const authorBlocked = this.blockedUsers.get(authorId)?.has(viewerId) ?? false;
    return viewerBlocked || authorBlocked;
  }

  async countOpenReports(): Promise<number> {
    return this.reports.length;
  }
}
