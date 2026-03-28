export type LegalDocumentKeyDto = 'termsOfUse' | 'privacyPolicy';

export type LegalDocumentBannerIconKeyDto = 'document' | 'shield';
export type LegalDocumentBannerToneDto = 'green' | 'blue';
export type LegalDocumentBannerLineToneDto = 'primary' | 'secondary';

export interface LegalDocumentBannerLineResponseDto {
  text: string;
  tone: LegalDocumentBannerLineToneDto;
}

export interface LegalDocumentBannerResponseDto {
  iconKey: LegalDocumentBannerIconKeyDto;
  lines: LegalDocumentBannerLineResponseDto[];
  title: string;
  tone: LegalDocumentBannerToneDto;
}

export interface LegalDocumentSectionResponseDto {
  id: string;
  paragraphs: string[];
  title: string;
}

export interface LegalDocumentResponseDto {
  banner: LegalDocumentBannerResponseDto;
  footerLines: string[];
  id: LegalDocumentKeyDto;
  sections: LegalDocumentSectionResponseDto[];
  title: string;
}
