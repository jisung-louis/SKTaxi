import type {
  ProfileEditDraft,
  ProfilePhotoUploadInput,
  ProfileEditSource,
} from '../../model/profileEditSource';

export interface IProfileEditRepository {
  getProfileEdit(): Promise<ProfileEditSource>;
  saveProfileEdit(draft: ProfileEditDraft): Promise<ProfileEditSource>;
  uploadProfilePhoto(image: ProfilePhotoUploadInput): Promise<ProfileEditSource>;
  removeProfilePhoto(): Promise<ProfileEditSource>;
}
