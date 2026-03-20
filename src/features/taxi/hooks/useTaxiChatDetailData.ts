import React from 'react';
import {
  usePartyRepository,
  useTaxiChatRepository,
} from '@/di/useRepository';
import {useAuth} from '@/features/auth';

import {
  TAXI_CHAT_CURRENT_USER_ID,
  type TaxiChatSourceData,
  type TaxiChatViewData,
} from '../model/taxiChatViewData';
import {buildTaxiChatViewData} from '../application/taxiChatDetailAssembler';

const buildSettlementDraft = (
  partyChat: TaxiChatSourceData,
  taxiFare: number,
) => {
  const settlementTargets = partyChat.participants.filter(
    participant => !participant.isLeader,
  );

  if (settlementTargets.length === 0) {
    throw new Error('동승 멤버가 있어야 도착 처리할 수 있습니다.');
  }

  return {
    members: settlementTargets.reduce<Record<string, {settled: boolean}>>(
      (accumulator, participant) => {
        accumulator[participant.id] = {
          settled: participant.settled,
        };
        return accumulator;
      },
      {},
    ),
    perPersonAmount: Math.floor(taxiFare / settlementTargets.length),
    taxiFare,
  };
};

export const useTaxiChatDetailData = (partyId: string | undefined) => {
  const partyRepository = usePartyRepository();
  const taxiChatRepository = useTaxiChatRepository();
  const {user} = useAuth();
  const currentUserId = user?.uid ?? TAXI_CHAT_CURRENT_USER_ID;
  const [sourceData, setSourceData] = React.useState<TaxiChatSourceData | null>(
    null,
  );
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [actionInFlightId, setActionInFlightId] = React.useState<string | null>(
    null,
  );
  const hasDataRef = React.useRef(false);

  const data = React.useMemo<TaxiChatViewData | null>(() => {
    if (!sourceData) {
      return null;
    }

    return buildTaxiChatViewData({
      currentUserId,
      partyChat: sourceData,
    });
  }, [currentUserId, sourceData]);

  React.useEffect(() => {
    hasDataRef.current = sourceData !== null;
  }, [sourceData]);

  const applyPartyChat = React.useCallback((partyChat: TaxiChatSourceData) => {
    setSourceData(partyChat);
    setError(null);
  }, []);

  const refreshPartySnapshot = React.useCallback(async () => {
    if (!partyId) {
      setSourceData(null);
      setError('파티 채팅방 정보를 찾을 수 없습니다.');
      return;
    }

    const partyChat = await taxiChatRepository.getPartyChat(partyId);

    if (!partyChat) {
      setSourceData(null);
      setError('파티 채팅방 정보를 찾을 수 없습니다.');
      return;
    }

    applyPartyChat(partyChat);
  }, [applyPartyChat, partyId, taxiChatRepository]);

  const reload = React.useCallback(async () => {
    if (!partyId) {
      setSourceData(null);
      setError('파티 채팅방 정보를 찾을 수 없습니다.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await refreshPartySnapshot();
      await taxiChatRepository.setCurrentParty(partyId);
    } catch (loadError) {
      console.error('파티 채팅 데이터를 불러오지 못했습니다.', loadError);
      setError('파티 채팅 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [partyId, refreshPartySnapshot, taxiChatRepository]);

  React.useEffect(() => {
    if (!partyId) {
      setSourceData(null);
      setError('파티 채팅방 정보를 찾을 수 없습니다.');
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = taxiChatRepository.subscribeToPartyChat(partyId, {
      onData: partyChat => {
        if (!partyChat) {
          setSourceData(null);
          setError('파티 채팅방 정보를 찾을 수 없습니다.');
          setLoading(false);
          return;
        }

        applyPartyChat(partyChat);
        setLoading(false);
      },
      onError: loadError => {
        console.error('파티 채팅 실시간 연결에 실패했습니다.', loadError);

        if (!hasDataRef.current) {
          setError('파티 채팅 데이터를 불러오지 못했습니다.');
        }

        setLoading(false);
      },
    });

    taxiChatRepository.setCurrentParty(partyId).catch(() => undefined);

    return () => unsubscribe();
  }, [applyPartyChat, partyId, taxiChatRepository]);

  React.useEffect(() => {
    if (!partyId) {
      return undefined;
    }

    return partyRepository.subscribeToParty(partyId, {
      onData: () => {
        refreshPartySnapshot().catch(syncError => {
          console.warn('파티 상태 변경 후 채팅 스냅샷을 갱신하지 못했습니다.', syncError);
        });
      },
      onError: syncError => {
        console.warn('파티 상태 SSE 신호를 처리하지 못했습니다.', syncError);
      },
    });
  }, [partyId, partyRepository, refreshPartySnapshot]);

  const runPartyAction = React.useCallback(
    async (actionId: string, action: () => Promise<void>) => {
      setActionInFlightId(actionId);

      try {
        await action();
        await refreshPartySnapshot();
      } finally {
        setActionInFlightId(null);
      }
    },
    [refreshPartySnapshot],
  );

  const closeParty = React.useCallback(async () => {
    if (!partyId) {
      return;
    }

    await runPartyAction('close', () => partyRepository.closeParty(partyId));
  }, [partyId, partyRepository, runPartyAction]);

  const reopenParty = React.useCallback(async () => {
    if (!partyId) {
      return;
    }

    await runPartyAction('reopen', () => partyRepository.reopenParty(partyId));
  }, [partyId, partyRepository, runPartyAction]);

  const endParty = React.useCallback(async () => {
    if (!partyId) {
      return;
    }

    await runPartyAction('end', async () => {
      await partyRepository.endParty(partyId);

      try {
        await taxiChatRepository.sendEndMessage(partyId);
      } catch (sendEndError) {
        await refreshPartySnapshot();
        throw new Error(
          sendEndError instanceof Error && sendEndError.message
            ? `파티 종료 상태는 반영됐지만 종료 메시지 전송에 실패했습니다. ${sendEndError.message}`
            : '파티 종료 상태는 반영됐지만 종료 메시지 전송에 실패했습니다.',
        );
      }
    });
  }, [
    partyId,
    partyRepository,
    refreshPartySnapshot,
    runPartyAction,
    taxiChatRepository,
  ]);

  const kickMember = React.useCallback(
    async (memberId: string) => {
      if (!partyId) {
        return;
      }

      await runPartyAction(`kick:${memberId}`, () =>
        partyRepository.removeMember(partyId, memberId),
      );
    },
    [partyId, partyRepository, runPartyAction],
  );

  const confirmSettlement = React.useCallback(
    async (memberId: string) => {
      if (!partyId) {
        return;
      }

      await runPartyAction(`confirmSettlement:${memberId}`, () =>
        partyRepository.markMemberSettled(partyId, memberId),
      );
    },
    [partyId, partyRepository, runPartyAction],
  );

  const startSettlement = React.useCallback(
    async (taxiFare: number) => {
      if (!partyId || !sourceData) {
        return;
      }

      if (!Number.isFinite(taxiFare) || taxiFare <= 0) {
        throw new Error('택시 총액을 1원 이상 숫자로 입력해주세요.');
      }

      await runPartyAction('arrive', async () => {
        await partyRepository.startSettlement(
          partyId,
          buildSettlementDraft(sourceData, taxiFare),
        );

        try {
          await taxiChatRepository.sendArrivedMessage(partyId, taxiFare);
        } catch (sendArrivedError) {
          await refreshPartySnapshot();
          throw new Error(
            sendArrivedError instanceof Error && sendArrivedError.message
              ? `도착/정산 상태는 반영됐지만 ARRIVED 메시지 전송에 실패했습니다. ${sendArrivedError.message}`
              : '도착/정산 상태는 반영됐지만 ARRIVED 메시지 전송에 실패했습니다.',
          );
        }
      });
    },
    [
      partyId,
      partyRepository,
      refreshPartySnapshot,
      runPartyAction,
      sourceData,
      taxiChatRepository,
    ],
  );

  const leaveParty = React.useCallback(async () => {
    if (!partyId) {
      return;
    }

    setActionInFlightId('leave');

    try {
      await partyRepository.leaveParty(partyId);
      setSourceData(null);
      await taxiChatRepository.resetSession();
    } finally {
      setActionInFlightId(null);
    }
  }, [partyId, partyRepository, taxiChatRepository]);

  const sendMessage = React.useCallback(
    async (messageText: string) => {
      if (!partyId) {
        return;
      }

      await taxiChatRepository.sendMessage(partyId, messageText);
    },
    [partyId, taxiChatRepository],
  );

  const sendAccountMessage = React.useCallback(async () => {
    if (!partyId) {
      return;
    }

    await taxiChatRepository.sendAccountMessage(partyId);
    await refreshPartySnapshot();
  }, [partyId, refreshPartySnapshot, taxiChatRepository]);

  const updateParty = React.useCallback(
    async ({
      departureTime,
      detail,
    }: {
      departureTime: string;
      detail?: string;
    }) => {
      if (!partyId) {
        return;
      }

      await runPartyAction('edit', () =>
        partyRepository.updateParty(partyId, {
          departureTime,
          detail,
        }),
      );
    },
    [partyId, partyRepository, runPartyAction],
  );

  const cancelParty = React.useCallback(async () => {
    if (!partyId) {
      return;
    }

    await runPartyAction('cancel', () =>
      partyRepository.deleteParty(partyId, 'cancelled'),
    );
  }, [partyId, partyRepository, runPartyAction]);

  const toggleNotification = React.useCallback(async () => {
    if (!partyId || !sourceData) {
      return;
    }

    const nextPartyChat = await taxiChatRepository.updateNotificationSetting(
      partyId,
      !sourceData.notificationEnabled,
    );

    if (!nextPartyChat) {
      return;
    }

    applyPartyChat(nextPartyChat);
  }, [applyPartyChat, partyId, sourceData, taxiChatRepository]);

  return {
    actionInFlightId,
    cancelParty,
    closeParty,
    confirmSettlement,
    data,
    endParty,
    error,
    kickMember,
    leaveParty,
    loading,
    reload,
    reopenParty,
    sendAccountMessage,
    sendMessage,
    startSettlement,
    toggleNotification,
    updateParty,
  };
};
