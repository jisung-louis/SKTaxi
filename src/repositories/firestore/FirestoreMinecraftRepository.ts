// SKTaxi: Minecraft Repository Firebase 구현체 - v22 Modular API
// Firestore + Realtime Database를 사용한 마인크래프트 기능 구현

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from '@react-native-firebase/firestore';
import {
  getDatabase,
  ref,
  get,
  set,
  push,
  remove,
} from '@react-native-firebase/database';
import {
  IMinecraftRepository,
  RegisterAccountParams,
  RegisterAccountResult,
  DeleteAccountParams,
  SendMessageParams,
} from '../interfaces/IMinecraftRepository';
import { MinecraftAccountEntry, UserMinecraftAccount } from '../../types/minecraft';
import { lookupMinecraftUuid } from '../../lib/minecraft/lookupUuid';

const MAX_ACCOUNTS = 4; // 내 계정 1개 + 친구 계정 3개
const RTDB_WHITELIST_PATH = 'whitelist/players';
const RTDB_BE_WHITELIST_PATH = 'whitelist/BEPlayers';
const MC_MESSAGES_PATH = 'mc_chat/messages';

export class FirestoreMinecraftRepository implements IMinecraftRepository {
  private db = getFirestore();
  private rtdb = getDatabase();

  async getUserMinecraftAccounts(uid: string): Promise<MinecraftAccountEntry[]> {
    const userDocRef = doc(this.db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    const minecraftAccount = (userDoc.data()?.minecraftAccount || { accounts: [] }) as UserMinecraftAccount;
    return Array.isArray(minecraftAccount.accounts) ? minecraftAccount.accounts : [];
  }

  async registerAccount(params: RegisterAccountParams): Promise<RegisterAccountResult> {
    const { uid, nickname, edition } = params;

    if (!uid) {
      throw new Error('로그인이 필요합니다.');
    }

    const lookupResult = await lookupMinecraftUuid(nickname, edition);
    const { uuid, nickname: resolvedNickname, storedName } = lookupResult;

    // Firestore에서 기존 계정 조회
    const userDocRef = doc(this.db, 'users', uid);
    const userSnap = await getDoc(userDocRef);
    const minecraftAccount = (userSnap.data()?.minecraftAccount || { accounts: [] }) as UserMinecraftAccount;
    const existingAccounts = Array.isArray(minecraftAccount.accounts) ? minecraftAccount.accounts : [];

    // 중복 확인
    if (existingAccounts.find((acc: MinecraftAccountEntry) =>
      acc.uuid === uuid || (edition === 'BE' && storedName && acc.storedName === storedName)
    )) {
      throw new Error('이미 등록된 마인크래프트 계정입니다.');
    }

    if (existingAccounts.length >= MAX_ACCOUNTS) {
      throw new Error(`최대 ${MAX_ACCOUNTS}개의 계정만 등록할 수 있습니다. (내 계정 1개 + 친구 계정 3개)`);
    }

    const isFirstAccount = existingAccounts.length === 0;
    const parentAccount = existingAccounts.find((acc: MinecraftAccountEntry) => !acc.whoseFriend);

    if (!isFirstAccount && !parentAccount) {
      throw new Error('먼저 본인의 계정을 등록해주세요.');
    }

    // RTDB 경로 결정
    let playerRef;
    if (edition === 'BE') {
      if (!storedName) {
        throw new Error('BE 계정의 storedName이 생성되지 않았습니다.');
      }
      playerRef = ref(this.rtdb, `${RTDB_BE_WHITELIST_PATH}/${storedName}`);
    } else {
      playerRef = ref(this.rtdb, `${RTDB_WHITELIST_PATH}/${uuid}`);
    }

    // RTDB 중복 확인
    const playerSnap = await get(playerRef);
    if (playerSnap.exists()) {
      throw new Error('이미 화이트리스트에 등록된 계정입니다.');
    }

    const newAccount: MinecraftAccountEntry = {
      nickname: resolvedNickname,
      uuid,
      edition,
      linkedAt: Date.now(),
    };

    if (edition === 'BE' && storedName) {
      newAccount.storedName = storedName;
    }

    if (!isFirstAccount && parentAccount) {
      newAccount.whoseFriend = parentAccount.nickname;
    }

    const updatedAccounts: MinecraftAccountEntry[] = [...existingAccounts, newAccount];

    const rtdbData: any = {
      nickname: resolvedNickname,
      addedBy: uid,
      addedAt: Date.now(),
      edition,
    };

    if (edition === 'BE' && storedName) {
      rtdbData.storedName = storedName;
    }

    if (newAccount.whoseFriend) {
      rtdbData.whoseFriend = newAccount.whoseFriend;
    }

    // RTDB에 저장
    await set(playerRef, rtdbData);

    try {
      // Firestore에 저장
      await setDoc(
        userDocRef,
        { minecraftAccount: { accounts: updatedAccounts } },
        { merge: true }
      );
    } catch (error) {
      // 롤백
      await remove(playerRef).catch(() => {});
      throw error;
    }

    return { uuid, nickname: resolvedNickname, storedName };
  }

  async deleteAccount(params: DeleteAccountParams): Promise<RegisterAccountResult> {
    const { uid, uuid } = params;

    if (!uid) {
      throw new Error('로그인이 필요합니다.');
    }

    const userDocRef = doc(this.db, 'users', uid);
    const userSnap = await getDoc(userDocRef);
    const minecraftAccount = (userSnap.data()?.minecraftAccount || { accounts: [] }) as UserMinecraftAccount;
    const existingAccounts = Array.isArray(minecraftAccount.accounts) ? minecraftAccount.accounts : [];

    const accountToDelete = existingAccounts.find((acc: MinecraftAccountEntry) => acc.uuid === uuid);
    if (!accountToDelete) {
      throw new Error('등록된 계정을 찾을 수 없습니다.');
    }

    const isParentAccount = !accountToDelete.whoseFriend;
    if (isParentAccount) {
      const hasFriendAccounts = existingAccounts.some((acc: MinecraftAccountEntry) => !!acc.whoseFriend);
      if (hasFriendAccounts) {
        throw new Error('친구 계정이 등록되어 있어요. 내 계정을 삭제하려면 먼저 친구 계정들을 삭제해주세요.');
      }
    }

    // RTDB 경로 결정
    let playerRef;
    if (accountToDelete.edition === 'BE') {
      if (!accountToDelete.storedName) {
        throw new Error('BE 계정의 storedName을 찾을 수 없습니다.');
      }
      playerRef = ref(this.rtdb, `${RTDB_BE_WHITELIST_PATH}/${accountToDelete.storedName}`);
    } else {
      playerRef = ref(this.rtdb, `${RTDB_WHITELIST_PATH}/${uuid}`);
    }

    const playerSnap = await get(playerRef);

    if (playerSnap.exists()) {
      const playerData = playerSnap.val();
      if (playerData?.addedBy !== uid) {
        throw new Error('본인이 등록한 계정만 삭제할 수 있습니다.');
      }
      await remove(playerRef);
    }

    const updatedAccounts = existingAccounts.filter((acc: MinecraftAccountEntry) => acc.uuid !== uuid);

    try {
      await setDoc(
        userDocRef,
        { minecraftAccount: { accounts: updatedAccounts } },
        { merge: true }
      );
    } catch (error) {
      // 롤백
      if (playerSnap.exists()) {
        const rtdbData: any = {
          nickname: accountToDelete.nickname,
          addedBy: uid,
          addedAt: accountToDelete.linkedAt,
          edition: accountToDelete.edition,
        };
        if (accountToDelete.edition === 'BE' && accountToDelete.storedName) {
          rtdbData.storedName = accountToDelete.storedName;
        }
        if (accountToDelete.whoseFriend) {
          rtdbData.whoseFriend = accountToDelete.whoseFriend;
        }
        await set(playerRef, rtdbData).catch(() => {});
      }
      throw error;
    }

    return { uuid, nickname: accountToDelete.nickname };
  }

  async isWhitelistRegistered(uuid: string, edition: string, storedName?: string): Promise<boolean> {
    let playerRef;
    if (edition === 'BE' && storedName) {
      playerRef = ref(this.rtdb, `${RTDB_BE_WHITELIST_PATH}/${storedName}`);
    } else {
      playerRef = ref(this.rtdb, `${RTDB_WHITELIST_PATH}/${uuid}`);
    }

    const snap = await get(playerRef);
    return snap.exists();
  }

  async sendMessage(params: SendMessageParams): Promise<void> {
    const { chatRoomId, userId, displayName, text } = params;

    const trimmed = text.trim();
    if (!trimmed) {
      throw new Error('메시지를 입력해주세요.');
    }

    try {
      const messagesRef = ref(this.rtdb, MC_MESSAGES_PATH);
      await push(messagesRef, {
        username: displayName,
        message: trimmed,
        timestamp: Date.now(),
        direction: 'app_to_mc',
        appUserId: userId,
        appUserDisplayName: displayName,
        chatRoomId,
      });

      console.log('✅ 마인크래프트 메시지 전송 완료');
    } catch (error) {
      console.error('마인크래프트 메시지 전송 실패:', error);
      throw error;
    }
  }
}
