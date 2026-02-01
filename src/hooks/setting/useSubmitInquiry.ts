// SKTaxi: 문의사항 제출 훅 (Repository 패턴 적용)
// DIP 준수: IInquiryRepository를 통한 데이터 접근

import { useState, useCallback } from 'react';
import { useAuth } from '../auth';
import { useInquiryRepository } from '../../di/useRepository';
import { InquiryType } from '../../repositories/interfaces/IInquiryRepository';

export interface InquiryData {
  type: string;
  subject: string;
  content: string;
}

export interface UseSubmitInquiryResult {
  /** 제출 중 상태 */
  submitting: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 문의사항 제출 함수 */
  submitInquiry: (data: InquiryData) => Promise<void>;
}

/**
 * 문의사항 제출 훅
 * 
 * DIP 준수: IInquiryRepository를 통해 데이터 접근
 * Spring 마이그레이션 시 Repository 구현체만 교체하면 됨
 */
export function useSubmitInquiry(): UseSubmitInquiryResult {
  const { user } = useAuth();
  const inquiryRepository = useInquiryRepository();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitInquiry = useCallback(async (data: InquiryData) => {
    try {
      setSubmitting(true);
      setError(null);

      // type 매핑: 문자열 -> InquiryType
      const typeMap: Record<string, InquiryType> = {
        'bug': 'bug',
        'feature': 'feature',
        'account': 'account',
        'etc': 'etc',
      };
      const inquiryType: InquiryType = typeMap[data.type] || 'etc';

      await inquiryRepository.submitInquiry({
        type: inquiryType,
        title: data.subject.trim(),
        content: data.content.trim(),
        userId: user?.uid || '',
        userEmail: user?.email || '',
      });
    } catch (err: any) {
      console.error('문의 접수 실패:', err);
      const message = err?.message && typeof err.message === 'string'
        ? err.message
        : '문의사항 접수에 실패했습니다.';
      setError(message);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [user, inquiryRepository]);

  return {
    submitting,
    error,
    submitInquiry,
  };
}
