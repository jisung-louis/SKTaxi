// SKTaxi: 마인크래프트 계정 등록/삭제 유틸리티
// IMinecraftRepository를 사용하여 Firebase 직접 의존 제거

import { FirestoreMinecraftRepository } from '../../repositories/firestore/FirestoreMinecraftRepository';
import { MinecraftEdition } from '../../types/minecraft';

// 싱글톤 Repository 인스턴스 (DI Provider 외부에서 사용하기 위함)
const minecraftRepository = new FirestoreMinecraftRepository();

type RegisterParams = {
  uid: string;
  nickname: string;
  edition: MinecraftEdition;
};

export async function registerMinecraftAccount({ uid, nickname, edition }: RegisterParams) {
  return minecraftRepository.registerAccount({ uid, nickname, edition });
}

export async function deleteMinecraftAccount({ uid, uuid }: { uid: string; uuid: string }) {
  return minecraftRepository.deleteAccount({ uid, uuid });
}
