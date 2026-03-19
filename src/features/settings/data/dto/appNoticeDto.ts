export type AppNoticeCategoryDto =
  | 'UPDATE'
  | 'MAINTENANCE'
  | 'EVENT'
  | 'GENERAL';

export type AppNoticePriorityDto = 'HIGH' | 'NORMAL' | 'LOW';

export interface AppNoticeResponseDto {
  actionUrl?: string | null;
  category: AppNoticeCategoryDto;
  content: string;
  createdAt: string;
  id: string;
  imageUrls?: string[] | null;
  priority: AppNoticePriorityDto;
  publishedAt: string;
  title: string;
  updatedAt: string;
}
