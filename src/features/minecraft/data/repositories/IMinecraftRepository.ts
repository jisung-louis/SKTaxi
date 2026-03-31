import type {
  MinecraftAccountEntry,
  MinecraftEdition,
} from '../../model/types';

export interface RegisterAccountParams {
  uid: string;
  nickname: string;
  edition: MinecraftEdition;
  whoseFriend?: string;
}

export interface RegisterAccountResult {
  id: string;
  uuid: string;
  nickname: string;
  normalizedKey?: string;
  storedName?: string;
  whoseFriend?: string;
}

export interface DeleteAccountParams {
  uid: string;
  accountId: string;
}

export interface IMinecraftRepository {
  getUserMinecraftAccounts(uid: string): Promise<MinecraftAccountEntry[]>;

  registerAccount(params: RegisterAccountParams): Promise<RegisterAccountResult>;

  deleteAccount(params: DeleteAccountParams): Promise<RegisterAccountResult>;
}
