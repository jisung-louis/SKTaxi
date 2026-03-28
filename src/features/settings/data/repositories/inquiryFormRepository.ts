import {SpringInquiryFormRepository} from './SpringInquiryFormRepository';

import type {IInquiryFormRepository} from './IInquiryFormRepository';

export const inquiryFormRepository: IInquiryFormRepository =
  new SpringInquiryFormRepository();
