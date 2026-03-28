export interface AppVersionResponseDto {
  platform: 'ios' | 'android';
  minimumVersion: string;
  forceUpdate: boolean;
  message?: string | null;
  title?: string | null;
  showButton: boolean;
  buttonText?: string | null;
  buttonUrl?: string | null;
}
