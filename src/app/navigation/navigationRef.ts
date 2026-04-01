import {
  createNavigationContainerRef,
  type NavigationState,
  type PartialState,
} from '@react-navigation/native';

import type {RootStackParamList} from './types';

type NavigationStateLike = NavigationState | PartialState<NavigationState>;

const pendingNavigationActions: Array<() => void> = [];

export const rootNavigationRef =
  createNavigationContainerRef<RootStackParamList>();

export const runWhenNavigationReady = (action: () => void) => {
  if (rootNavigationRef.isReady()) {
    action();
    return true;
  }

  pendingNavigationActions.push(action);
  return false;
};

export const flushPendingNavigationActions = () => {
  if (!rootNavigationRef.isReady()) {
    return;
  }

  while (pendingNavigationActions.length > 0) {
    const nextAction = pendingNavigationActions.shift();
    nextAction?.();
  }
};

export const getRootNavigationState = (): NavigationStateLike | undefined =>
  rootNavigationRef.getRootState();
