import type {LegalDocumentApiClient} from '../../api/legalDocumentApiClient';
import {SpringLegalDocumentRepository} from '../SpringLegalDocumentRepository';

describe('SpringLegalDocumentRepository', () => {
  it('공개 API 응답을 LegalDocumentSource로 매핑한다', async () => {
    const apiClient: LegalDocumentApiClient = {
      getLegalDocument: jest.fn().mockResolvedValue({
        data: {
          id: 'termsOfUse',
          title: '이용약관',
          banner: {
            iconKey: 'document',
            title: 'SKURI 이용약관',
            tone: 'green',
            lines: [
              {
                text: '시행일: 2025년 3월 1일',
                tone: 'primary',
              },
            ],
          },
          sections: [
            {
              id: 'article-01',
              title: '제1조(목적)',
              paragraphs: ['약관 본문'],
            },
          ],
          footerLines: ['문의는', '앱 내 문의하기를 이용해 주세요.'],
        },
      }),
    };

    const repository = new SpringLegalDocumentRepository(apiClient);

    await expect(repository.getDocument('termsOfUse')).resolves.toEqual({
      id: 'termsOfUse',
      title: '이용약관',
      banner: {
        iconKey: 'document',
        title: 'SKURI 이용약관',
        tone: 'green',
        lines: [
          {
            text: '시행일: 2025년 3월 1일',
            tone: 'primary',
          },
        ],
      },
      sections: [
        {
          id: 'article-01',
          title: '제1조(목적)',
          paragraphs: ['약관 본문'],
        },
      ],
      footerLines: ['문의는', '앱 내 문의하기를 이용해 주세요.'],
    });
    expect(apiClient.getLegalDocument).toHaveBeenCalledWith('termsOfUse');
  });
});
