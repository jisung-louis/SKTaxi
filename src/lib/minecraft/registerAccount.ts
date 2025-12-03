import firestore from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';
import { lookupMinecraftUuid } from './lookupUuid';
import { MinecraftAccountEntry, MinecraftEdition, UserMinecraftAccount } from '../../types/minecraft';

const MAX_ACCOUNTS = 4; // 내 계정 1개 + 친구 계정 3개
const RTDB_WHITELIST_PATH = 'whitelist/players';
const RTDB_BE_WHITELIST_PATH = 'whitelist/BEPlayers';

type RegisterParams = {
  uid: string;
  nickname: string;
  edition: MinecraftEdition;
};

export async function registerMinecraftAccount({ uid, nickname, edition }: RegisterParams) {
  if (!uid) {
    throw new Error('로그인이 필요합니다.');
  }

  const lookupResult = await lookupMinecraftUuid(nickname, edition);
  const { uuid, nickname: resolvedNickname, storedName } = lookupResult;

  // Firestore 업데이트
  const userDocRef = firestore().collection('users').doc(uid);
  const userSnap = await userDocRef.get();
  const minecraftAccount = (userSnap.data()?.minecraftAccount || { accounts: [] }) as UserMinecraftAccount;
  const existingAccounts = Array.isArray(minecraftAccount.accounts) ? minecraftAccount.accounts : [];

  // 중복 확인 (uuid 또는 storedName 기준)
  if (existingAccounts.find((acc: MinecraftAccountEntry) => 
    acc.uuid === uuid || (edition === 'BE' && storedName && acc.storedName === storedName)
  )) {
    throw new Error('이미 등록된 마인크래프트 계정입니다.');
  }

  if (existingAccounts.length >= MAX_ACCOUNTS) {
    throw new Error(`최대 ${MAX_ACCOUNTS}개의 계정만 등록할 수 있습니다. (내 계정 1개 + 친구 계정 3개)`);
  }

  // 첫 번째 계정인지 확인 (whoseFriend가 없는 계정이 있는지 확인)
  const isFirstAccount = existingAccounts.length === 0;
  const parentAccount = existingAccounts.find((acc: MinecraftAccountEntry) => !acc.whoseFriend);
  
  // 첫 번째 계정이 아니고 부모 계정이 없으면 에러
  if (!isFirstAccount && !parentAccount) {
    throw new Error('먼저 본인의 계정을 등록해주세요.');
  }

  // RTDB 경로 결정
  let playerRef;
  if (edition === 'BE') {
    if (!storedName) {
      throw new Error('BE 계정의 storedName이 생성되지 않았습니다.');
    }
    playerRef = database().ref(`${RTDB_BE_WHITELIST_PATH}/${storedName}`);
  } else {
    playerRef = database().ref(`${RTDB_WHITELIST_PATH}/${uuid}`);
  }

  // RTDB 업데이트 (기존 등록 여부 확인)
  const playerSnap = await playerRef.once('value');
  if (playerSnap.exists()) {
    throw new Error('이미 화이트리스트에 등록된 계정입니다.');
  }

  const newAccount: MinecraftAccountEntry = {
    nickname: resolvedNickname,
    uuid,
    edition,
    linkedAt: Date.now(),
  };

  // BE인 경우 storedName 추가
  if (edition === 'BE' && storedName) {
    newAccount.storedName = storedName;
  }

  // 두 번째 계정부터는 whoseFriend에 첫 번째 계정의 닉네임 설정
  if (!isFirstAccount && parentAccount) {
    newAccount.whoseFriend = parentAccount.nickname;
  }

  const updatedAccounts: MinecraftAccountEntry[] = [
    ...existingAccounts,
    newAccount,
  ];

  const rtdbData: any = {
    nickname: resolvedNickname, // 원본 닉네임 (공백 포함)
    addedBy: uid,
    addedAt: Date.now(),
    edition,
  };

  // BE인 경우 storedName 추가
  if (edition === 'BE' && storedName) {
    rtdbData.storedName = storedName;
  }

  // 친구 계정인 경우 whoseFriend 추가
  if (newAccount.whoseFriend) {
    rtdbData.whoseFriend = newAccount.whoseFriend;
  }

  await playerRef.set(rtdbData);

  try {
    await userDocRef.set(
      {
        minecraftAccount: {
          accounts: updatedAccounts,
        },
      },
      { merge: true }
    );
  } catch (error) {
    await playerRef.remove().catch(() => {});
    throw error;
  }

  return { uuid, nickname: resolvedNickname, storedName };
}

export async function deleteMinecraftAccount({ uid, uuid }: { uid: string; uuid: string }) {
  if (!uid) {
    throw new Error('로그인이 필요합니다.');
  }

  // Firestore에서 계정 제거
  const userDocRef = firestore().collection('users').doc(uid);
  const userSnap = await userDocRef.get();
  const minecraftAccount = (userSnap.data()?.minecraftAccount || { accounts: [] }) as UserMinecraftAccount;
  const existingAccounts = Array.isArray(minecraftAccount.accounts) ? minecraftAccount.accounts : [];

  const accountToDelete = existingAccounts.find((acc: MinecraftAccountEntry) => acc.uuid === uuid);
  if (!accountToDelete) {
    throw new Error('등록된 계정을 찾을 수 없습니다.');
  }

  // 부모 계정(whoseFriend가 없는 계정)에 친구 계정들이 연결되어 있다면 삭제를 막음
  const isParentAccount = !accountToDelete.whoseFriend;
  if (isParentAccount) {
    const hasFriendAccounts = existingAccounts.some(
      (acc: MinecraftAccountEntry) => !!acc.whoseFriend
    );
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
    playerRef = database().ref(`${RTDB_BE_WHITELIST_PATH}/${accountToDelete.storedName}`);
  } else {
    playerRef = database().ref(`${RTDB_WHITELIST_PATH}/${uuid}`);
  }

  const playerSnap = await playerRef.once('value');
  
  // RTDB에 있는 계정이 현재 사용자가 추가한 것인지 확인
  if (playerSnap.exists()) {
    const playerData = playerSnap.val();
    if (playerData?.addedBy !== uid) {
      throw new Error('본인이 등록한 계정만 삭제할 수 있습니다.');
    }
    await playerRef.remove();
  }

  // Firestore에서 계정 제거
  const updatedAccounts = existingAccounts.filter((acc: MinecraftAccountEntry) => acc.uuid !== uuid);
  
  try {
    await userDocRef.set(
      {
        minecraftAccount: {
          accounts: updatedAccounts,
        },
      },
      { merge: true }
    );
  } catch (error) {
    // Firestore 업데이트 실패 시 RTDB 복구 시도
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
      await playerRef.set(rtdbData).catch(() => {});
    }
    throw error;
  }

  return { uuid, nickname: accountToDelete.nickname };
}

