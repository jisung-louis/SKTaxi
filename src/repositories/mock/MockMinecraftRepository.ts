// SKTaxi: Minecraft Repository Mock 구현체 (테스트용)

import {
  IMinecraftRepository,
  RegisterAccountParams,
  RegisterAccountResult,
  DeleteAccountParams,
  SendMessageParams,
} from '../interfaces/IMinecraftRepository';
import { MinecraftAccountEntry, MinecraftEdition } from '../../types/minecraft';

export class MockMinecraftRepository implements IMinecraftRepository {
  private accounts: Map<string, MinecraftAccountEntry[]> = new Map();
  private whitelist: Set<string> = new Set();

  async getUserMinecraftAccounts(uid: string): Promise<MinecraftAccountEntry[]> {
    return this.accounts.get(uid) || [];
  }

  async registerAccount(params: RegisterAccountParams): Promise<RegisterAccountResult> {
    const { uid, nickname, edition } = params;
    const uuid = `mock-uuid-${Date.now()}`;
    const storedName = edition === 'BE' ? nickname.toLowerCase().replace(/\s+/g, '_') : undefined;

    const newAccount: MinecraftAccountEntry = {
      nickname,
      uuid,
      edition,
      linkedAt: Date.now(),
      storedName,
    };

    const existingAccounts = this.accounts.get(uid) || [];
    existingAccounts.push(newAccount);
    this.accounts.set(uid, existingAccounts);

    this.whitelist.add(uuid);

    return { uuid, nickname, storedName };
  }

  async deleteAccount(params: DeleteAccountParams): Promise<RegisterAccountResult> {
    const { uid, uuid } = params;
    const existingAccounts = this.accounts.get(uid) || [];
    const account = existingAccounts.find(a => a.uuid === uuid);

    if (!account) {
      throw new Error('등록된 계정을 찾을 수 없습니다.');
    }

    this.accounts.set(uid, existingAccounts.filter(a => a.uuid !== uuid));
    this.whitelist.delete(uuid);

    return { uuid, nickname: account.nickname };
  }

  async isWhitelistRegistered(uuid: string, _edition: MinecraftEdition, _storedName?: string): Promise<boolean> {
    return this.whitelist.has(uuid);
  }

  async sendMessage(_params: SendMessageParams): Promise<void> {
    // Mock: 메시지 전송 완료
  }
}
