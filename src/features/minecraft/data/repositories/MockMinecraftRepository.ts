import type {
  DeleteAccountParams,
  IMinecraftRepository,
  RegisterAccountParams,
  RegisterAccountResult,
  SendMessageParams,
} from './IMinecraftRepository';
import type {
  MinecraftAccountEntry,
  MinecraftEdition,
} from '../../model/types';
import {
  getMockMinecraftWhitelistValue,
  removeMockMinecraftWhitelistEntry,
  upsertMockMinecraftWhitelistEntry,
} from '../minecraftRealtimeDataSource';

const accountsByUser = new Map<string, MinecraftAccountEntry[]>();

const normalizeNickname = (nickname: string) => nickname.trim();
const toStoredName = (nickname: string) => normalizeNickname(nickname).replace(/\s+/g, '_');
const toUuid = (nickname: string, edition: MinecraftEdition) =>
  edition === 'BE'
    ? `be:${toStoredName(nickname)}`
    : `je:${normalizeNickname(nickname).toLowerCase().replace(/\s+/g, '-')}`;

const cloneAccount = (account: MinecraftAccountEntry): MinecraftAccountEntry => ({
  ...account,
});

const MAX_TOTAL_ACCOUNTS = 4;
const MAX_FRIEND_ACCOUNTS = 3;

export class MockMinecraftRepository implements IMinecraftRepository {
  async getUserMinecraftAccounts(uid: string): Promise<MinecraftAccountEntry[]> {
    return (accountsByUser.get(uid) ?? []).map(cloneAccount);
  }

  async registerAccount(
    params: RegisterAccountParams,
  ): Promise<RegisterAccountResult> {
    const nickname = normalizeNickname(params.nickname);
    const whoseFriend = normalizeNickname(params.whoseFriend ?? '') || undefined;
    const storedName = params.edition === 'BE' ? toStoredName(nickname) : undefined;
    const uuid = toUuid(nickname, params.edition);

    const registered = await this.isWhitelistRegistered(uuid, params.edition, storedName);
    if (registered) {
      throw new Error('이미 등록된 마인크래프트 계정입니다.');
    }

    const currentAccounts = accountsByUser.get(params.uid) ?? [];
    const parentAccount =
      currentAccounts.find(account => !account.whoseFriend) ?? null;
    const friendAccounts = currentAccounts.filter(account => !!account.whoseFriend);

    if (currentAccounts.length >= MAX_TOTAL_ACCOUNTS) {
      throw new Error('최대 4개의 계정만 등록할 수 있습니다.');
    }

    if (parentAccount && !whoseFriend) {
      throw new Error('본인 계정은 하나만 등록할 수 있습니다.');
    }

    if (!parentAccount && whoseFriend) {
      throw new Error('본인 계정을 먼저 등록해주세요.');
    }

    if (whoseFriend && parentAccount && whoseFriend !== parentAccount.nickname) {
      throw new Error('친구 계정은 등록된 본인 계정에만 연결할 수 있습니다.');
    }

    if (whoseFriend && friendAccounts.length >= MAX_FRIEND_ACCOUNTS) {
      throw new Error('친구 계정은 최대 3개까지 등록할 수 있습니다.');
    }

    const nextAccount: MinecraftAccountEntry = {
      nickname,
      uuid,
      storedName,
      edition: params.edition,
      linkedAt: Date.now(),
      whoseFriend,
    };
    accountsByUser.set(params.uid, [...currentAccounts, nextAccount]);

    upsertMockMinecraftWhitelistEntry({
      uuid,
      nickname,
      storedName,
      edition: params.edition,
      addedBy: params.uid,
      whoseFriend,
    });

    return {
      uuid,
      nickname,
      storedName,
      whoseFriend,
    };
  }

  async deleteAccount(
    params: DeleteAccountParams,
  ): Promise<RegisterAccountResult> {
    const currentAccounts = accountsByUser.get(params.uid) ?? [];
    const targetAccount = currentAccounts.find(account => account.uuid === params.uuid);

    if (!targetAccount) {
      throw new Error('등록된 계정을 찾을 수 없습니다.');
    }

    if (!targetAccount.whoseFriend) {
      const hasFriendAccounts = currentAccounts.some(
        account => account.whoseFriend === targetAccount.nickname,
      );

      if (hasFriendAccounts) {
        throw new Error(
          '친구 계정이 연결되어 있어 본인 계정을 삭제할 수 없습니다.',
        );
      }
    }

    accountsByUser.set(
      params.uid,
      currentAccounts.filter(account => account.uuid !== params.uuid),
    );
    removeMockMinecraftWhitelistEntry(params.uuid, targetAccount.storedName);

    return {
      uuid: targetAccount.uuid,
      nickname: targetAccount.nickname,
      storedName: targetAccount.storedName,
      whoseFriend: targetAccount.whoseFriend,
    };
  }

  async isWhitelistRegistered(
    uuid: string,
    edition: MinecraftEdition,
    storedName?: string,
  ): Promise<boolean> {
    const javaPlayers = getMockMinecraftWhitelistValue('whitelist/players');
    const bedrockPlayers = getMockMinecraftWhitelistValue('whitelist/BEPlayers');

    if (edition === 'BE') {
      return Boolean(storedName && bedrockPlayers?.[storedName]);
    }

    return Boolean(javaPlayers?.[uuid]);
  }

  async sendMessage(_params: SendMessageParams): Promise<void> {}
}
