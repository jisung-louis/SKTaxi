export interface ProfileEditSource {
  avatarLabel: string;
  department: string;
  departmentOptions: string[];
  displayName: string;
  gradeLabel: string;
  photoUrl: string | null;
  studentId: string;
}

export interface ProfileEditDraft {
  department: string;
  displayName: string;
  studentId: string;
}

export interface ProfilePhotoUploadInput {
  fileName?: string;
  mimeType?: string;
  uri: string;
}
