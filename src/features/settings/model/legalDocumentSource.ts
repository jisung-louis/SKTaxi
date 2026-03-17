export type LegalDocumentKey = 'termsOfUse' | 'privacyPolicy';

export type LegalDocumentBannerIconKey = 'document' | 'shield';
export type LegalDocumentBannerTone = 'green' | 'blue';
export type LegalDocumentBannerLineTone = 'primary' | 'secondary';

export interface LegalDocumentBannerLineSource {
  text: string;
  tone: LegalDocumentBannerLineTone;
}

export interface LegalDocumentSectionSource {
  id: string;
  paragraphs: string[];
  title: string;
}

export interface LegalDocumentSource {
  banner: {
    iconKey: LegalDocumentBannerIconKey;
    lines: LegalDocumentBannerLineSource[];
    title: string;
    tone: LegalDocumentBannerTone;
  };
  footerLines: string[];
  id: LegalDocumentKey;
  sections: LegalDocumentSectionSource[];
  title: string;
}
