import type {IProfileEditRepository} from './IProfileEditRepository';
import {SpringProfileEditRepository} from './SpringProfileEditRepository';

export const profileEditRepository: IProfileEditRepository =
  new SpringProfileEditRepository();
