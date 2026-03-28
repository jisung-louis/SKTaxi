import {uploadImage} from '@/shared/api/imageUploadClient';

import type {InquiryApiClient} from '../../api/inquiryApiClient';
import {SpringInquiryFormRepository} from '../SpringInquiryFormRepository';

jest.mock('@/shared/api/imageUploadClient', () => ({
  uploadImage: jest.fn(),
}));

const mockedUploadImage = jest.mocked(uploadImage);

describe('SpringInquiryFormRepository', () => {
  beforeEach(() => {
    mockedUploadImage.mockReset();
  });

  it('문의 첨부 이미지를 먼저 업로드한 뒤 생성 API에 메타데이터를 전달한다', async () => {
    const apiClient: InquiryApiClient = {
      createInquiry: jest.fn().mockResolvedValue({
        data: {
          createdAt: '2026-03-28T12:00:00',
          id: 'inquiry-1',
          status: 'PENDING',
        },
      }),
      getMyInquiries: jest.fn(),
    };

    mockedUploadImage.mockResolvedValue({
      height: 600,
      mime: 'image/jpeg',
      size: 245123,
      thumbUrl: 'https://cdn.skuri.app/uploads/inquiries/thumb.jpg',
      url: 'https://cdn.skuri.app/uploads/inquiries/original.jpg',
      width: 800,
    });

    const repository = new SpringInquiryFormRepository(apiClient);

    await expect(
      repository.submitInquiryForm({
        attachments: [
          {
            fileName: 'bug.jpg',
            mimeType: 'image/jpeg',
            uri: 'file:///bug.jpg',
          },
        ],
        content: '내용',
        title: '제목',
        type: 'bug',
      }),
    ).resolves.toEqual({id: 'inquiry-1'});

    expect(mockedUploadImage).toHaveBeenCalledWith({
      context: 'INQUIRY_IMAGE',
      fileName: 'bug.jpg',
      mimeType: 'image/jpeg',
      uri: 'file:///bug.jpg',
    });
    expect(apiClient.createInquiry).toHaveBeenCalledWith({
      attachments: [
        {
          height: 600,
          mime: 'image/jpeg',
          size: 245123,
          thumbUrl: 'https://cdn.skuri.app/uploads/inquiries/thumb.jpg',
          url: 'https://cdn.skuri.app/uploads/inquiries/original.jpg',
          width: 800,
        },
      ],
      content: '내용',
      subject: '제목',
      type: 'BUG',
    });
  });
});
