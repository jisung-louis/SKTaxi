import type {
  SubscriptionCallbacks,
  Unsubscribe,
} from '@/shared/types/subscription';
import {
  createXhrSseStream,
  sseClient,
  type SseStreamConnection,
  type SseStreamEvent,
} from '@/shared/realtime';

import {minecraftApiClient} from '../data/api/minecraftApiClient';
import type {
  MinecraftOverviewResponseDto,
  MinecraftPlayerRemoveResponseDto,
  MinecraftPlayerResponseDto,
  MinecraftPlayersSnapshotResponseDto,
} from '../data/dto/minecraftDto';
import {
  mapMinecraftOverviewDtoToOverview,
  mapMinecraftOverviewToServerInfo,
  mapMinecraftPlayerDtoToWhitelistPlayer,
} from '../data/mappers/minecraftApiMappers';
import type {
  MinecraftServerInfo,
  MinecraftServerOverview,
  MinecraftWhitelistPlayer,
} from '../model/types';

const EMPTY_SERVER_OVERVIEW: MinecraftServerOverview = {
  serverStatus: null,
  serverUrl: null,
  mapUri: null,
  serverVersion: null,
};

interface MinecraftRealtimeState {
  connection: SseStreamConnection | null;
  connectionPromise: Promise<void> | null;
  hasOverview: boolean;
  hasPlayers: boolean;
  lastEventId?: string;
  overview: MinecraftServerOverview;
  overviewLoadPromise: Promise<void> | null;
  overviewSubscribers: Set<SubscriptionCallbacks<MinecraftServerOverview>>;
  players: MinecraftWhitelistPlayer[];
  playersLoadPromise: Promise<void> | null;
  playersSubscribers: Set<SubscriptionCallbacks<MinecraftWhitelistPlayer[]>>;
  reconnectDelayMs: number;
  reconnectTimerId: ReturnType<typeof setTimeout> | null;
}

const realtimeState: MinecraftRealtimeState = {
  connection: null,
  connectionPromise: null,
  hasOverview: false,
  hasPlayers: false,
  overview: {...EMPTY_SERVER_OVERVIEW},
  overviewLoadPromise: null,
  overviewSubscribers: new Set(),
  players: [],
  playersLoadPromise: null,
  playersSubscribers: new Set(),
  reconnectDelayMs: 3000,
  reconnectTimerId: null,
};

const toError = (error: unknown) => {
  if (error instanceof Error) {
    return error;
  }

  return new Error('마인크래프트 데이터를 불러오는 중 오류가 발생했습니다.');
};

const parseJsonPayload = <T>(payload?: string): T | null => {
  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(payload) as T;
  } catch {
    return null;
  }
};

const cloneOverview = (
  overview: MinecraftServerOverview,
): MinecraftServerOverview => ({
  ...overview,
  serverStatus: overview.serverStatus ? {...overview.serverStatus} : null,
});

const clonePlayers = (players: MinecraftWhitelistPlayer[]) =>
  players.map(player => ({...player}));

const sortPlayers = (players: MinecraftWhitelistPlayer[]) =>
  [...players].sort((left, right) => {
    const usernameCompare = left.username.localeCompare(right.username, 'ko');

    if (usernameCompare !== 0) {
      return usernameCompare;
    }

    return left.normalizedKey.localeCompare(right.normalizedKey, 'ko');
  });

const hasSubscribers = () =>
  realtimeState.overviewSubscribers.size > 0 ||
  realtimeState.playersSubscribers.size > 0;

const clearReconnectTimer = () => {
  if (!realtimeState.reconnectTimerId) {
    return;
  }

  clearTimeout(realtimeState.reconnectTimerId);
  realtimeState.reconnectTimerId = null;
};

const notifyOverviewSubscribers = () => {
  const nextOverview = cloneOverview(realtimeState.overview);

  realtimeState.overviewSubscribers.forEach(callbacks => {
    callbacks.onData(nextOverview);
  });
};

const notifyPlayersSubscribers = () => {
  const nextPlayers = clonePlayers(realtimeState.players);

  realtimeState.playersSubscribers.forEach(callbacks => {
    callbacks.onData(nextPlayers);
  });
};

const scheduleReconnect = () => {
  if (
    !hasSubscribers() ||
    realtimeState.reconnectTimerId ||
    realtimeState.connectionPromise ||
    realtimeState.connection
  ) {
    return;
  }

  realtimeState.reconnectTimerId = setTimeout(() => {
    realtimeState.reconnectTimerId = null;
    ensureConnection().catch(() => undefined);
  }, realtimeState.reconnectDelayMs);
};

const disposeIfIdle = () => {
  if (hasSubscribers()) {
    return;
  }

  clearReconnectTimer();

  const currentConnection = realtimeState.connection;
  realtimeState.connection = null;
  currentConnection?.close();
};

const handleRealtimeEvent = (event: SseStreamEvent) => {
  if (event.id) {
    realtimeState.lastEventId = event.id;
  }

  if (typeof event.retry === 'number' && event.retry >= 0) {
    realtimeState.reconnectDelayMs = event.retry;
  }

  switch (event.event) {
    case 'SERVER_STATE_SNAPSHOT':
    case 'SERVER_STATE_UPDATED': {
      const payload =
        parseJsonPayload<MinecraftOverviewResponseDto>(event.data);

      if (!payload) {
        return;
      }

      realtimeState.overview = mapMinecraftOverviewDtoToOverview(payload);
      realtimeState.hasOverview = true;
      notifyOverviewSubscribers();
      return;
    }

    case 'PLAYERS_SNAPSHOT': {
      const payload =
        parseJsonPayload<MinecraftPlayersSnapshotResponseDto>(event.data);

      if (!payload) {
        return;
      }

      realtimeState.players = sortPlayers(
        payload.players.map(mapMinecraftPlayerDtoToWhitelistPlayer),
      );
      realtimeState.hasPlayers = true;
      notifyPlayersSubscribers();
      return;
    }

    case 'PLAYER_UPSERT': {
      const payload =
        parseJsonPayload<MinecraftPlayerResponseDto>(event.data);

      if (!payload) {
        return;
      }

      const nextPlayer = mapMinecraftPlayerDtoToWhitelistPlayer(payload);
      realtimeState.players = sortPlayers(
        realtimeState.players.some(
          player => player.normalizedKey === nextPlayer.normalizedKey,
        )
          ? realtimeState.players.map(player =>
              player.normalizedKey === nextPlayer.normalizedKey
                ? nextPlayer
                : player,
            )
          : [...realtimeState.players, nextPlayer],
      );
      realtimeState.hasPlayers = true;
      notifyPlayersSubscribers();
      return;
    }

    case 'PLAYER_REMOVE': {
      const payload =
        parseJsonPayload<MinecraftPlayerRemoveResponseDto>(event.data);

      if (!payload) {
        return;
      }

      realtimeState.players = realtimeState.players.filter(
        player => player.normalizedKey !== payload.normalizedKey,
      );
      realtimeState.hasPlayers = true;
      notifyPlayersSubscribers();
      return;
    }

    case 'HEARTBEAT':
    default:
      return;
  }
};

const loadOverview = async () => {
  if (realtimeState.overviewLoadPromise) {
    return realtimeState.overviewLoadPromise;
  }

  realtimeState.overviewLoadPromise = minecraftApiClient
    .getOverview()
    .then(response => {
      realtimeState.overview = mapMinecraftOverviewDtoToOverview(response.data);
      realtimeState.hasOverview = true;
      notifyOverviewSubscribers();
    })
    .finally(() => {
      realtimeState.overviewLoadPromise = null;
    });

  return realtimeState.overviewLoadPromise;
};

const loadPlayers = async () => {
  if (realtimeState.playersLoadPromise) {
    return realtimeState.playersLoadPromise;
  }

  realtimeState.playersLoadPromise = minecraftApiClient
    .getPlayers()
    .then(response => {
      realtimeState.players = sortPlayers(
        response.data.map(mapMinecraftPlayerDtoToWhitelistPlayer),
      );
      realtimeState.hasPlayers = true;
      notifyPlayersSubscribers();
    })
    .finally(() => {
      realtimeState.playersLoadPromise = null;
    });

  return realtimeState.playersLoadPromise;
};

const ensureConnection = async () => {
  if (
    !hasSubscribers() ||
    realtimeState.connection ||
    realtimeState.connectionPromise
  ) {
    return;
  }

  clearReconnectTimer();

  realtimeState.connectionPromise = (async () => {
    const connection = await sseClient.connect(
      {
        lastEventId: realtimeState.lastEventId,
        path: '/v1/sse/minecraft',
      },
      {
        connect: options => {
          realtimeState.reconnectDelayMs = options.reconnectDelayMs;

          let nextConnection: SseStreamConnection | null = null;
          nextConnection = createXhrSseStream(options, {
            onClosed: () => {
              if (realtimeState.connection === nextConnection) {
                realtimeState.connection = null;
              }

              scheduleReconnect();
            },
            onError: error => {
              console.warn('마인크래프트 SSE 연결 오류:', error);
            },
            onEvent: event => {
              handleRealtimeEvent(event);
            },
          });

          return nextConnection;
        },
      },
    );

    realtimeState.connection = connection;
  })()
    .catch(error => {
      console.warn('마인크래프트 SSE 연결 실패:', error);
      scheduleReconnect();
    })
    .finally(() => {
      realtimeState.connectionPromise = null;
      disposeIfIdle();
    });

  await realtimeState.connectionPromise;
};

export const subscribeToMinecraftServerOverview = ({
  onData,
  onError,
}: SubscriptionCallbacks<MinecraftServerOverview>): Unsubscribe => {
  const callbacks = {onData, onError};
  realtimeState.overviewSubscribers.add(callbacks);

  if (realtimeState.hasOverview) {
    onData(cloneOverview(realtimeState.overview));
  } else {
    loadOverview().catch(error => {
      callbacks.onError(toError(error));
    });
  }

  ensureConnection().catch(() => undefined);

  return () => {
    realtimeState.overviewSubscribers.delete(callbacks);
    disposeIfIdle();
  };
};

export const subscribeToMinecraftWhitelistPlayers = ({
  onData,
  onError,
}: SubscriptionCallbacks<MinecraftWhitelistPlayer[]>): Unsubscribe => {
  const callbacks = {onData, onError};
  realtimeState.playersSubscribers.add(callbacks);

  if (realtimeState.hasPlayers) {
    onData(clonePlayers(realtimeState.players));
  } else {
    loadPlayers().catch(error => {
      callbacks.onError(toError(error));
    });
  }

  ensureConnection().catch(() => undefined);

  return () => {
    realtimeState.playersSubscribers.delete(callbacks);
    disposeIfIdle();
  };
};

export const subscribeToMinecraftServerInfo = ({
  onData,
  onError,
}: SubscriptionCallbacks<MinecraftServerInfo>): Unsubscribe => {
  return subscribeToMinecraftServerOverview({
    onData: overview => {
      onData(mapMinecraftOverviewToServerInfo(overview));
    },
    onError,
  });
};
