import type {InquiryFormTypeKey} from '../model/inquiryFormSource';

export interface InquiryTypeOptionConfig {
  id: InquiryFormTypeKey;
  label: string;
}

export const INQUIRY_FORM_TITLE_MAX_LENGTH = 100;
export const INQUIRY_FORM_CONTENT_MAX_LENGTH = 500;

export const INQUIRY_FORM_TYPE_OPTIONS: InquiryTypeOptionConfig[] = [
  {id: 'feature', label: '기능 제안'},
  {id: 'bug', label: '버그 신고'},
  {id: 'account', label: '계정 문의'},
  {id: 'service', label: '서비스 문의'},
  {id: 'other', label: '기타'},
];

export const INQUIRY_FORM_PLACEHOLDERS = {
  content: '문의 내용을 자세히 작성해주세요. (최대 500자)',
  title: '문의 제목을 입력해주세요',
} as const;

export const INQUIRY_FORM_ATTACHMENT = {
  helperLines: ['파일을 첨부하려면 탭하세요', '이미지, PDF 지원'] as [
    string,
    string,
  ],
  title: '파일 첨부',
} as const;

export const INQUIRY_FORM_GUIDE_LINES = [
  '접수된 문의는 검토 후 순차적으로 처리됩니다.',
  '빠른 처리를 위해 내용을 최대한 자세히 작성해주세요.',
] as [string, string];

export const INQUIRY_FORM_SUBMIT_LABEL = '문의 접수하기';
