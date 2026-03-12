import type {
  DeleteAccountParams,
  RegisterAccountParams,
} from '../data/repositories/IMinecraftRepository';
import { minecraftRepository } from '../data/composition/minecraftRuntime';

export const registerMinecraftAccount = async (
  params: RegisterAccountParams,
) => {
  return minecraftRepository.registerAccount(params);
};

export const deleteMinecraftAccount = async (
  params: DeleteAccountParams,
) => {
  return minecraftRepository.deleteAccount(params);
};
