import type {
  MinecraftServerInfo,
  MinecraftServerOverview,
  MinecraftServerPlayer,
  MinecraftServerStatus,
  MinecraftWhitelistPlayer,
} from '../model/types';
import { subscribeToMinecraftRealtimeValue } from '../data/minecraftRealtimeDataSource';

interface SubscriptionCallbacks<T> {
  onData: (data: T) => void;
  onError: (error: Error) => void;
}

const EMPTY_SERVER_OVERVIEW: MinecraftServerOverview = {
  serverStatus: null,
  serverUrl: null,
  mapUri: null,
  serverVersion: null,
};

const parseServerPlayers = (
  value: any,
): MinecraftServerStatus['players'] => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((player: any): MinecraftServerPlayer => ({
      username: player.username || player.name || '플레이어',
      uuid: player.uuid,
    }));
  }

  if (typeof value === 'object') {
    return Object.values(value).map((player: any): MinecraftServerPlayer => ({
      username: player.username || player.name || '플레이어',
      uuid: player.uuid,
    }));
  }

  return [];
};

const parseJavaWhitelistPlayers = (value: any): MinecraftWhitelistPlayer[] => {
  if (!value || typeof value !== 'object') {
    return [];
  }

  return Object.entries(value).map(([uuid, data]) => {
    const record = data as any;

    return {
      uuid,
      username: record?.nickname || '플레이어',
      edition: record?.edition || 'JE',
      whoseFriend: record?.whoseFriend,
      addedBy: record?.addedBy || 'unknown',
      addedAt:
        typeof record?.addedAt === 'number' ? record.addedAt : Date.now(),
      lastSeenAt:
        typeof record?.lastSeenAt === 'number' ? record.lastSeenAt : undefined,
    };
  });
};

const parseBedrockWhitelistPlayers = (
  value: any,
): MinecraftWhitelistPlayer[] => {
  if (!value || typeof value !== 'object') {
    return [];
  }

  return Object.entries(value).map(([storedName, data]) => {
    const record = data as any;

    return {
      uuid: `be:${storedName}`,
      username: record?.nickname || record?.username || storedName,
      edition: 'BE',
      whoseFriend: record?.whoseFriend,
      addedBy: record?.addedBy || 'unknown',
      addedAt:
        typeof record?.addedAt === 'number' ? record.addedAt : Date.now(),
      lastSeenAt:
        typeof record?.lastSeenAt === 'number' ? record.lastSeenAt : undefined,
    };
  });
};

const sortWhitelistPlayers = (players: MinecraftWhitelistPlayer[]) => {
  return [...players].sort((a, b) => b.addedAt - a.addedAt);
};

export const subscribeToMinecraftServerOverview = ({
  onData,
  onError,
}: SubscriptionCallbacks<MinecraftServerOverview>) => {
  const currentState: MinecraftServerOverview = { ...EMPTY_SERVER_OVERVIEW };

  const emit = () => {
    onData({ ...currentState });
  };

  const unsubscribeStatus = subscribeToMinecraftRealtimeValue<any>(
    'serverStatus',
    {
      onData: data => {
        if (!data) {
          currentState.serverStatus = null;
          currentState.serverVersion = null;
          emit();
          return;
        }

        const players = parseServerPlayers(data.players) ?? [];
        currentState.serverStatus = {
          online: data.online ?? true,
          maxPlayers: data.maxPlayers ?? players.length,
          currentPlayers:
            data.currentPlayers ?? data.playerCount ?? players.length,
          players,
          updatedAt: data.updatedAt ?? Date.now(),
        };
        currentState.serverVersion =
          typeof data.version === 'string' ? data.version : null;
        emit();
      },
      onError,
    },
  );

  const unsubscribeServerUrl = subscribeToMinecraftRealtimeValue<string>(
    'serverStatus/serverUrl',
    {
      onData: serverUrl => {
        currentState.serverUrl =
          typeof serverUrl === 'string' ? serverUrl : null;
        emit();
      },
      onError,
    },
  );

  const unsubscribeMapUri = subscribeToMinecraftRealtimeValue<string>(
    'serverStatus/mapUri',
    {
      onData: mapUri => {
        currentState.mapUri = typeof mapUri === 'string' ? mapUri : null;
        emit();
      },
      onError,
    },
  );

  return () => {
    unsubscribeStatus();
    unsubscribeServerUrl();
    unsubscribeMapUri();
  };
};

export const subscribeToMinecraftWhitelistPlayers = ({
  onData,
  onError,
}: SubscriptionCallbacks<MinecraftWhitelistPlayer[]>) => {
  let javaPlayers: MinecraftWhitelistPlayer[] = [];
  let bedrockPlayers: MinecraftWhitelistPlayer[] = [];

  const emit = () => {
    onData(sortWhitelistPlayers([...javaPlayers, ...bedrockPlayers]));
  };

  const unsubscribeJavaPlayers = subscribeToMinecraftRealtimeValue<any>(
    'whitelist/players',
    {
      onData: value => {
        javaPlayers = parseJavaWhitelistPlayers(value);
        emit();
      },
      onError,
    },
  );

  const unsubscribeBedrockPlayers = subscribeToMinecraftRealtimeValue<any>(
    'whitelist/BEPlayers',
    {
      onData: value => {
        bedrockPlayers = parseBedrockWhitelistPlayers(value);
        emit();
      },
      onError,
    },
  );

  return () => {
    unsubscribeJavaPlayers();
    unsubscribeBedrockPlayers();
  };
};

export const subscribeToMinecraftServerInfo = ({
  onData,
  onError,
}: SubscriptionCallbacks<MinecraftServerInfo>) => {
  return subscribeToMinecraftServerOverview({
    onData: overview => {
      onData({
        currentPlayers: overview.serverStatus?.currentPlayers ?? null,
        maxPlayers: overview.serverStatus?.maxPlayers ?? null,
        online: overview.serverStatus?.online ?? null,
        serverUrl: overview.serverUrl,
        version: overview.serverVersion,
      });
    },
    onError,
  });
};
