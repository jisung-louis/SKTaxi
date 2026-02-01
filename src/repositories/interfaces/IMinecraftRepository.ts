// SKTaxi: 마인크래프트 Repository 인터페이스
// Firestore + Realtime Database 접근을 추상화

import { MinecraftAccountEntry, MinecraftEdition, UserMinecraftAccount } from '../../types/minecraft';

export interface RegisterAccountParams {
  uid: string;
  nickname: string;
  edition: MinecraftEdition;
}

export interface RegisterAccountResult {
  uuid: string;
  nickname: string;
  storedName?: string;
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
  /**
   * 사용자의 마인크래프트 계정 목록을 가져옵니다
   * @param uid - 사용자 ID
   */
  getUserMinecraftAccounts(uid: string): Promise<MinecraftAccountEntry[]>;

  /**
   * 마인크래프트 계정을 등록합니다
   * - Firestore: users/{uid}/minecraftAccount
   * - RTDB: whitelist/players/{uuid} 또는 whitelist/BEPlayers/{storedName}
   */
  registerAccount(params: RegisterAccountParams): Promise<RegisterAccountResult>;

  /**
   * 마인크래프트 계정을 삭제합니다
   */
  deleteAccount(params: DeleteAccountParams): Promise<RegisterAccountResult>;

  /**
   * RTDB 화이트리스트에서 플레이어가 이미 등록되어 있는지 확인합니다
   * @param uuid - 플레이어 UUID
   * @param edition - 에디션 (JE | BE)
   * @param storedName - BE 에디션용 저장 이름
   */
  isWhitelistRegistered(uuid: string, edition: MinecraftEdition, storedName?: string): Promise<boolean>;

  /**
   * 마인크래프트 채팅 메시지를 전송합니다
   */
  sendMessage(params: SendMessageParams): Promise<void>;
}
