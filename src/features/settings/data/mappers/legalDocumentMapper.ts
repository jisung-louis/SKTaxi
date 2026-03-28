import type {LegalDocumentSource} from '../../model/legalDocumentSource';
import type {LegalDocumentResponseDto} from '../dto/legalDocumentDto';

export const mapLegalDocumentResponseDto = (
  document: LegalDocumentResponseDto,
): LegalDocumentSource => {
  return {
    banner: {
      iconKey: document.banner.iconKey,
      lines: document.banner.lines.map(line => ({
        text: line.text,
        tone: line.tone,
      })),
      title: document.banner.title,
      tone: document.banner.tone,
    },
    footerLines: [...document.footerLines],
    id: document.id,
    sections: document.sections.map(section => ({
      id: section.id,
      paragraphs: [...section.paragraphs],
      title: section.title,
    })),
    title: document.title,
  };
};
