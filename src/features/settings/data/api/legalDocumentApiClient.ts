import {httpClient, type ApiSuccessResponse} from '@/shared/api';

import type {LegalDocumentKey} from '../../model/legalDocumentSource';
import type {LegalDocumentResponseDto} from '../dto/legalDocumentDto';

export class LegalDocumentApiClient {
  getLegalDocument(documentKey: LegalDocumentKey) {
    return httpClient.get<ApiSuccessResponse<LegalDocumentResponseDto>>(
      `/v1/legal-documents/${documentKey}`,
      {
        requiresAuth: false,
      },
    );
  }
}

export const legalDocumentApiClient = new LegalDocumentApiClient();
