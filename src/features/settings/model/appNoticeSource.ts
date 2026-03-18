import type {ImageSourcePropType} from 'react-native';

export interface AppNoticeRecord {
  authorLabel: string;
  bodyParagraphs: string[];
  categoryLabel: string;
  detailPublishedLabel: string;
  feedPublishedLabel: string;
  galleryImages: ImageSourcePropType[];
  id: string;
  important: boolean;
  summary: string;
  title: string;
  viewCountLabel: string;
}
