import type {ILegalDocumentRepository} from './ILegalDocumentRepository';
import type {LegalDocumentKey} from '../../model/legalDocumentSource';
import {getLegalDocumentMock} from '../../mocks/legalDocuments.mock';

const MOCK_DELAY_MS = 120;

export class MockLegalDocumentRepository implements ILegalDocumentRepository {
  async getDocument(key: LegalDocumentKey) {
    await new Promise(resolve => {
      setTimeout(resolve, MOCK_DELAY_MS);
    });

    return getLegalDocumentMock(key);
  }
}
