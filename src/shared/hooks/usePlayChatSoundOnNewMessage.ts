import React from 'react';

import {loadChatSound, playChatSound} from '@/shared/lib/sound/chatSound';

export const usePlayChatSoundOnNewMessage = (
  scopeKey: string | null | undefined,
  latestMessageId: string | null | undefined,
) => {
  const previousScopeKeyRef = React.useRef<string | null>(scopeKey ?? null);
  const previousMessageIdRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    loadChatSound();
  }, []);

  React.useEffect(() => {
    const normalizedScopeKey = scopeKey ?? null;

    if (previousScopeKeyRef.current !== normalizedScopeKey) {
      previousScopeKeyRef.current = normalizedScopeKey;
      previousMessageIdRef.current = null;
    }

    if (!latestMessageId) {
      previousMessageIdRef.current = null;
      return;
    }

    if (previousMessageIdRef.current === null) {
      previousMessageIdRef.current = latestMessageId;
      return;
    }

    if (previousMessageIdRef.current !== latestMessageId) {
      previousMessageIdRef.current = latestMessageId;
      playChatSound();
      return;
    }

    previousMessageIdRef.current = latestMessageId;
  }, [latestMessageId, scopeKey]);
};
