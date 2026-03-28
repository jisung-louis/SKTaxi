import React from 'react';
import {
  ReportReasonModal,
  type ReportReasonModalProps,
} from '@/shared/ui/ReportReasonModal';

type BoardReportModalProps = ReportReasonModalProps;

export const BoardReportModal = (props: BoardReportModalProps) => (
  <ReportReasonModal {...props} />
);
