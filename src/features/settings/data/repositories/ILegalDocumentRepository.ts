import type {
  LegalDocumentKey,
  LegalDocumentSource,
} from '../../model/legalDocumentSource';

export interface ILegalDocumentRepository {
  getDocument(key: LegalDocumentKey): Promise<LegalDocumentSource>;
}
