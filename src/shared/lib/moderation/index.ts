import type {
  BlockedUser,
  IModerationRepository,
  ReportCategory,
  ReportDoc,
  ReportPayload,
  ReportStatus,
  ReportTargetType,
} from './contracts';

export type {
  BlockedUser,
  IModerationRepository,
  ReportCategory,
  ReportDoc,
  ReportPayload,
  ReportStatus,
  ReportTargetType,
};

const requireSignedInUserId = (userId?: string | null): string => {
  if (!userId) {
    throw new Error('Not signed in');
  }

  return userId;
};

export const createModerationService = (repository: IModerationRepository) => ({
  createReport(payload: ReportPayload, reporterId?: string | null) {
    return repository.createReport(requireSignedInUserId(reporterId), payload);
  },
  blockUser(blockedUserId: string, blockerId?: string | null) {
    return repository.blockUser(
      requireSignedInUserId(blockerId),
      blockedUserId,
    );
  },
  unblockUser(blockedUserId: string, blockerId?: string | null) {
    return repository.unblockUser(
      requireSignedInUserId(blockerId),
      blockedUserId,
    );
  },
  async isBlocked(authorId: string, viewerId?: string | null) {
    if (!viewerId) {
      return false;
    }

    return repository.isBlocked(viewerId, authorId);
  },
  async isMutuallyBlocked(authorId: string, viewerId?: string | null) {
    if (!viewerId) {
      return false;
    }

    return repository.isMutuallyBlocked(viewerId, authorId);
  },
  async shouldHideContent(authorId: string, viewerId?: string | null) {
    if (!viewerId) {
      return false;
    }

    return repository.isMutuallyBlocked(viewerId, authorId);
  },
  countOpenReports() {
    return repository.countOpenReports();
  },
});
