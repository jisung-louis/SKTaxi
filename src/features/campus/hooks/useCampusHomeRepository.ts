import type { ICampusHomeRepository } from '../data/repositories/ICampusHomeRepository';
import { mockCampusHomeRepository } from '../mocks/MockCampusHomeRepository';

export const useCampusHomeRepository = (): ICampusHomeRepository => {
  return mockCampusHomeRepository;
};
