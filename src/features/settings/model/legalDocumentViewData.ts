import type {LegalDocumentKey} from './legalDocumentSource';

export interface LegalDocumentBannerLineViewData {
  color: string;
  text: string;
}

export interface LegalDocumentBannerViewData {
  backgroundColor: string;
  iconColor: string;
  iconName: string;
  lines: LegalDocumentBannerLineViewData[];
  title: string;
  titleColor: string;
}

export interface LegalDocumentSectionViewData {
  id: string;
  paragraphs: string[];
  title: string;
}

export interface LegalDocumentScreenViewData {
  banner: LegalDocumentBannerViewData;
  footerLines: string[];
  id: LegalDocumentKey;
  sections: LegalDocumentSectionViewData[];
  title: string;
}
