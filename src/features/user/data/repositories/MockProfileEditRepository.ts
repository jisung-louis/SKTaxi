import {
  getProfileEditMockData,
  saveProfileEditMockData,
} from '../../mocks/profileEdit.mock';
import type {
  ProfileEditDraft,
  ProfileEditSource,
} from '../../model/profileEditSource';

import type {IProfileEditRepository} from './IProfileEditRepository';

const MOCK_DELAY_MS = 120;

export class MockProfileEditRepository implements IProfileEditRepository {
  async getProfileEdit(): Promise<ProfileEditSource> {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));
    return getProfileEditMockData();
  }

  async saveProfileEdit(draft: ProfileEditDraft): Promise<ProfileEditSource> {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));
    saveProfileEditMockData(draft);
    return getProfileEditMockData();
  }
}
