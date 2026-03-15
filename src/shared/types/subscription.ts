// Generic realtime subscription contract shared across features.
export type Unsubscribe = () => void;

export interface SubscriptionCallbacks<T> {
  onData: (data: T) => void;
  onError: (error: Error) => void;
}
