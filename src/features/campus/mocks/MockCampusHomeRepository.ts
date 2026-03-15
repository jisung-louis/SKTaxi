import type { ICampusHomeRepository } from '../data/repositories/ICampusHomeRepository';
import type { CampusHomeViewData } from '../model/campusHome';
import {
  createCrossBoundaryCampusHomeViewData,
  createDefaultCampusHomeViewData,
  createNoCourseCampusHomeViewData,
} from './campusHomeViewData';

export type MockCampusHomeScenario =
  | 'default'
  | 'cross-boundary'
  | 'no-course';

interface MockCampusHomeRepositoryOptions {
  delayMs?: number;
  scenario?: MockCampusHomeScenario;
}

const wait = (delayMs: number) =>
  new Promise(resolve => {
    setTimeout(resolve, delayMs);
  });

export class MockCampusHomeRepository implements ICampusHomeRepository {
  private readonly delayMs: number;

  private readonly scenario: MockCampusHomeScenario;

  constructor(options: MockCampusHomeRepositoryOptions = {}) {
    this.delayMs = options.delayMs ?? 180;
    this.scenario = options.scenario ?? 'default';
  }

  async getCampusHomeViewData(): Promise<CampusHomeViewData> {
    await wait(this.delayMs);

    if (this.scenario === 'cross-boundary') {
      return createCrossBoundaryCampusHomeViewData();
    }

    if (this.scenario === 'no-course') {
      return createNoCourseCampusHomeViewData();
    }

    return createDefaultCampusHomeViewData();
  }
}

export const mockCampusHomeRepository = new MockCampusHomeRepository();
