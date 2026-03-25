export interface ProfileEditSource {
  avatarLabel: string;
  department: string;
  departmentOptions: string[];
  displayName: string;
  gradeLabel: string;
  studentId: string;
}

export interface ProfileEditDraft {
  department: string;
  displayName: string;
  studentId: string;
}
