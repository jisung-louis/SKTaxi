import type {InquiryFormSource} from '../model/inquiryFormSource';

export const inquiryFormMockData: InquiryFormSource = {
  attachmentHelperLines: ['파일을 첨부하려면 탭하세요', '이미지, PDF 지원'],
  attachmentTitle: '파일 첨부',
  contentMaxLength: 500,
  contentPlaceholder: '문의 내용을 자세히 작성해주세요. (최대 500자)',
  guideLines: [
    '접수된 문의는 검토 후 순차적으로 처리됩니다.',
    '빠른 처리를 위해 내용을 최대한 자세히 작성해주세요.',
  ],
  submitLabel: '문의 접수하기',
  titleMaxLength: 100,
  titlePlaceholder: '문의 제목을 입력해주세요',
  typeOptions: [
    {id: 'feature', label: '기능 제안'},
    {id: 'bug', label: '버그 신고'},
    {id: 'account', label: '계정 문의'},
    {id: 'service', label: '서비스 문의'},
    {id: 'other', label: '기타'},
  ],
};
