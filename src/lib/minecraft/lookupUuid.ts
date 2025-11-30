import axios from 'axios';
import { MinecraftEdition } from '../../types/minecraft';

export type LookupUuidResult = {
  uuid: string;
  nickname: string;
  storedName?: string; // BE 전용: 공백을 _로 치환한 닉네임
  edition: MinecraftEdition;
};

// RTDB 경로에 사용할 수 없는 문자들
const RTDB_FORBIDDEN_CHARS = /[.#$\[\]]/;

export async function lookupMinecraftUuid(nickname: string, edition: MinecraftEdition): Promise<LookupUuidResult> {
  const trimmed = nickname.trim();
  if (!trimmed) {
    throw new Error('닉네임을 입력해주세요.');
  }

  if (edition === 'BE') {
    // RTDB 금지문자 검사
    if (RTDB_FORBIDDEN_CHARS.test(trimmed)) {
      throw new Error('닉네임에 다음 문자를 사용할 수 없습니다: . # $ [ ]');
    }

    // 공백을 _로 치환
    const replacedName = trimmed.replace(/\s+/g, '_');
    // 12글자 이상이면 앞 12글자만 사용
    const storedName = replacedName.length > 12 ? replacedName.slice(0, 12) : replacedName;

    return {
      uuid: `be:${storedName}`, // BE는 UUID 대신 be: 접두사 사용
      nickname: trimmed, // 원본 닉네임 (공백 포함)
      storedName, // 저장용 닉네임 (공백 → _)
      edition,
    };
  }

  try {
    const response = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(trimmed)}`, {
      timeout: 8_000,
    });

    if (!response?.data || !response.data.id) {
      throw new Error('해당 닉네임을 찾을 수 없습니다.');
    }

    const raw = response.data.id;
    const uuid = `${raw.substring(0, 8)}-${raw.substring(8, 12)}-${raw.substring(12, 16)}-${raw.substring(16, 20)}-${raw.substring(20)}`;
    const resolvedName = response.data.name || trimmed;

    return {
      uuid,
      nickname: resolvedName,
      edition,
    };
  } catch (error: any) {
    if (error?.response?.status === 204 || error?.response?.status === 404) {
      throw new Error('해당 닉네임을 찾을 수 없습니다.');
    }
    if (error?.code === 'ECONNABORTED') {
      throw new Error('Mojang 서버 응답이 지연되고 있어요. 잠시 후 다시 시도해주세요.');
    }
    throw new Error('UUID 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
  }
}

