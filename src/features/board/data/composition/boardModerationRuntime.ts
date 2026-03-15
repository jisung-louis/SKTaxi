import { FirestoreModerationRepository } from '@/shared/lib/firebase';
import { createModerationService } from '@/shared/lib/moderation';

const moderationRepository = new FirestoreModerationRepository();

export const boardModerationRuntime = createModerationService(
  moderationRepository,
);
