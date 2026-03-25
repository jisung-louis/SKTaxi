import { createModerationService } from '@/shared/lib/moderation';
import { MockModerationRepository } from '@/shared/lib/mock/MockModerationRepository';

const moderationRepository = new MockModerationRepository();

export const chatModerationRuntime = createModerationService(
  moderationRepository,
);
