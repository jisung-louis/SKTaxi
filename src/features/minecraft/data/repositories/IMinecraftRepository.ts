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
  uuid: string;
  nickname: string;
  storedName?: string;
  whoseFriend?: string;
}

export interface DeleteAccountParams {
  uid: string;
  uuid: string;
}

export interface SendMessageParams {
  chatRoomId: string;
  userId: string;
  displayName: string;
  text: string;
}

export interface IMinecraftRepository {
  getUserMinecraftAccounts(uid: string): Promise<MinecraftAccountEntry[]>;

  registerAccount(params: RegisterAccountParams): Promise<RegisterAccountResult>;

  deleteAccount(params: DeleteAccountParams): Promise<RegisterAccountResult>;

  isWhitelistRegistered(uuid: string, edition: MinecraftEdition, storedName?: string): Promise<boolean>;

  sendMessage(params: SendMessageParams): Promise<void>;
}
