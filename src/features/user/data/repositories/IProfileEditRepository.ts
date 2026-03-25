import type {
  ProfileEditDraft,
  ProfileEditSource,
} from '../../model/profileEditSource';

export interface IProfileEditRepository {
  getProfileEdit(): Promise<ProfileEditSource>;
  saveProfileEdit(draft: ProfileEditDraft): Promise<ProfileEditSource>;
}
