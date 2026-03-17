import {MockInquiryFormRepository} from './MockInquiryFormRepository';

import type {IInquiryFormRepository} from './IInquiryFormRepository';

export const inquiryFormRepository: IInquiryFormRepository =
  new MockInquiryFormRepository();
