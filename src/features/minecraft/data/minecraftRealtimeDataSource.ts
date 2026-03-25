import type { MinecraftEdition } from '../model/types';

interface MinecraftRealtimeValueCallbacks<T> {
  onData: (value: T | null) => void;
  onError: (error: Error) => void;
}

type ListenerEntry = {
  onData: (value: unknown) => void;
  onError: (error: Error) => void;
};

const listeners = new Map<string, Set<ListenerEntry>>();

const mockRealtimeState = {
  serverStatus: {
    online: true,
    maxPlayers: 30,
    currentPlayers: 4,
    version: '1.20.4',
    serverUrl: 'play.mock.skuri.kr',
    mapUri: 'https://map.mock.skuri.kr',
    updatedAt: Date.now(),
    players: [
      { username: '스쿠리관리자', uuid: 'mock-admin' },
      { username: '김성결', uuid: 'leader-1' },
    ],
  },
  whitelist: {
    players: {
      'je:mock-admin': {
        nickname: 'MockAdmin',
        edition: 'JE',
        addedBy: 'mock-admin',
        addedAt: Date.now() - 1000 * 60 * 60,
      },
    } as Record<string, any>,
    BEPlayers: {} as Record<string, any>,
  },
};

const getValueByPath = (path: string): unknown => {
  const segments = path.split('/').filter(Boolean);
  let current: any = mockRealtimeState;

  for (const segment of segments) {
    if (current == null || typeof current !== 'object') {
      return null;
    }
    current = current[segment];
  }

  return current ?? null;
};

const notifyPath = (path: string) => {
  const value = getValueByPath(path);
  listeners.get(path)?.forEach(listener => {
    listener.onData(value);
  });
};

export const getMockMinecraftWhitelistValue = (path: 'whitelist/players' | 'whitelist/BEPlayers') => {
  return getValueByPath(path) as Record<string, any> | null;
};

export const upsertMockMinecraftWhitelistEntry = ({
  uuid,
  nickname,
  storedName,
  edition,
  addedBy,
}: {
  uuid: string;
  nickname: string;
  storedName?: string;
  edition: MinecraftEdition;
  addedBy: string;
}) => {
  const baseRecord = {
    nickname,
    edition,
    addedBy,
    addedAt: Date.now(),
  };

  if (edition === 'BE' && storedName) {
    mockRealtimeState.whitelist.BEPlayers[storedName] = {
      ...baseRecord,
      username: nickname,
    };
    notifyPath('whitelist/BEPlayers');
    return;
  }

  mockRealtimeState.whitelist.players[uuid] = baseRecord;
  notifyPath('whitelist/players');
};

export const removeMockMinecraftWhitelistEntry = (
  uuid: string,
  storedName?: string,
) => {
  delete mockRealtimeState.whitelist.players[uuid];
  notifyPath('whitelist/players');

  if (storedName) {
    delete mockRealtimeState.whitelist.BEPlayers[storedName];
    notifyPath('whitelist/BEPlayers');
  }
};

export const subscribeToMinecraftRealtimeValue = <T>(
  path: string,
  { onData, onError }: MinecraftRealtimeValueCallbacks<T>,
) => {
  const bucket = listeners.get(path) ?? new Set();
  const listener: ListenerEntry = {
    onData: value => onData((value as T) ?? null),
    onError,
  };
  bucket.add(listener);
  listeners.set(path, bucket);

  try {
    onData((getValueByPath(path) as T) ?? null);
  } catch (error) {
    onData(null);
    onError(error as Error);
  }

  return () => {
    listeners.get(path)?.delete(listener);
  };
};
