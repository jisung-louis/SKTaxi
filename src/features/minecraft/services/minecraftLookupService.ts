import axios from 'axios';

import type { MinecraftEdition } from '../model/types';

export type LookupUuidResult = {
  uuid: string;
  nickname: string;
  storedName?: string;
  edition: MinecraftEdition;
};

const RTDB_FORBIDDEN_CHARS = /[.#$\[\]]/;

export async function lookupMinecraftUuid(
  nickname: string,
  edition: MinecraftEdition,
): Promise<LookupUuidResult> {
  const trimmed = nickname.trim();

  if (!trimmed) {
    throw new Error('닉네임을 입력해주세요.');
  }

  if (edition === 'BE') {
    if (RTDB_FORBIDDEN_CHARS.test(trimmed)) {
      throw new Error('닉네임에 다음 문자를 사용할 수 없습니다: . # $ [ ]');
    }

    const replacedName = trimmed.replace(/\s+/g, '_');
    const storedName =
      replacedName.length > 12 ? replacedName.slice(0, 12) : replacedName;

    return {
      uuid: `be:${storedName}`,
      nickname: trimmed,
      storedName,
      edition,
    };
  }

  try {
    const response = await axios.get(
      `https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(trimmed)}`,
      {
        timeout: 8_000,
      },
    );

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
      throw new Error(
        'Mojang 서버 응답이 지연되고 있어요. 잠시 후 다시 시도해주세요.',
      );
    }

    throw new Error('UUID 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
  }
}
