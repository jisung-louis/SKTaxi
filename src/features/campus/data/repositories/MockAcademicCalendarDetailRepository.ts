import {academicCalendarDetailMockEvents} from '../../mocks/academicCalendarDetail.mock';
import type {AcademicCalendarEventSource} from '../../model/academicCalendarDetailSource';

import type {IAcademicCalendarDetailRepository} from './IAcademicCalendarDetailRepository';

const MOCK_DELAY_MS = 120;

export class MockAcademicCalendarDetailRepository
  implements IAcademicCalendarDetailRepository
{
  async listEvents(): Promise<AcademicCalendarEventSource[]> {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));
    return academicCalendarDetailMockEvents;
  }
}
