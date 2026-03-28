import type {LegalDocumentKey} from '../../model/legalDocumentSource';
import {
  legalDocumentApiClient,
  LegalDocumentApiClient,
} from '../api/legalDocumentApiClient';
import {mapLegalDocumentResponseDto} from '../mappers/legalDocumentMapper';
import type {ILegalDocumentRepository} from './ILegalDocumentRepository';

export class SpringLegalDocumentRepository implements ILegalDocumentRepository {
  constructor(
    private readonly apiClient: LegalDocumentApiClient = legalDocumentApiClient,
  ) {}

  async getDocument(key: LegalDocumentKey) {
    const response = await this.apiClient.getLegalDocument(key);
    return mapLegalDocumentResponseDto(response.data);
  }
}
