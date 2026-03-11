import { FirestoreModerationRepository } from '@/repositories/firestore/FirestoreModerationRepository';
import type {
  BlockedUser,
  ReportCategory,
  ReportDoc,
  ReportPayload,
  ReportStatus,
  ReportTargetType,
} from '@/repositories/interfaces/IModerationRepository';
import { authInstance } from '@/shared/lib/firebase';

export type {
  BlockedUser,
  ReportCategory,
  ReportDoc,
  ReportPayload,
  ReportStatus,
  ReportTargetType,
};

const moderationRepository = new FirestoreModerationRepository();

export async function createReport(payload: ReportPayload): Promise<string> {
  const current = authInstance.currentUser;
  if (!current) {
    throw new Error('Not signed in');
  }

  return moderationRepository.createReport(current.uid, payload);
}

export async function blockUser(blockedUserId: string): Promise<void> {
  const current = authInstance.currentUser;
  if (!current) {
    throw new Error('Not signed in');
  }

  await moderationRepository.blockUser(current.uid, blockedUserId);
}

export async function unblockUser(blockedUserId: string): Promise<void> {
  const current = authInstance.currentUser;
  if (!current) {
    throw new Error('Not signed in');
  }

  await moderationRepository.unblockUser(current.uid, blockedUserId);
}

export async function isBlocked(authorId: string, byUserId?: string): Promise<boolean> {
  const current = authInstance.currentUser;
  const viewerId = byUserId ?? current?.uid;
  if (!viewerId) {
    return false;
  }

  return moderationRepository.isBlocked(viewerId, authorId);
}

export async function isMutuallyBlocked(authorId: string): Promise<boolean> {
  const current = authInstance.currentUser;
  const viewerId = current?.uid;
  if (!viewerId) {
    return false;
  }

  return moderationRepository.isMutuallyBlocked(viewerId, authorId);
}

export async function shouldHideContent(authorId: string): Promise<boolean> {
  return isMutuallyBlocked(authorId);
}

export async function countOpenReports(): Promise<number> {
  return moderationRepository.countOpenReports();
}
