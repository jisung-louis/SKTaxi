import {MockProfileEditRepository} from './MockProfileEditRepository';
import type {IProfileEditRepository} from './IProfileEditRepository';

export const profileEditRepository: IProfileEditRepository =
  new MockProfileEditRepository();
