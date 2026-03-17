import type {TaxiAcceptancePendingSeed} from './taxiAcceptancePendingViewData';

export type TaxiHomeFilterId = 'all' | 'anyang' | 'beomgye';
export type TaxiHomeSortId = 'latest' | 'departureSoon';

export interface TaxiHomeFilterDefinition {
  id: TaxiHomeFilterId;
  label: string;
  matchKeywords: string[];
}

export interface TaxiHomeSortDefinition {
  id: TaxiHomeSortId;
  label: string;
}

export interface TaxiHomeAvatarViewData {
  id: string;
  label: string;
  backgroundColor: string;
  textColor: string;
}

export interface TaxiHomePartyAction {
  type: 'preview' | 'open-chat';
}

export type TaxiHomePartyJoinActionState =
  | 'request'
  | 'joined'
  | 'blocked-by-other-party';

export interface TaxiHomePartyJoinActionViewData {
  helperText?: string;
  label: string;
  state: TaxiHomePartyJoinActionState;
}

export interface TaxiHomePartyCardViewData {
  acceptancePendingSeed?: TaxiAcceptancePendingSeed;
  id: string;
  departureAt: string;
  createdAt: string;
  departureTimeLabel: string;
  departureLabel: string;
  destinationLabel: string;
  statusLabel: string;
  statusTone: 'active' | 'inactive';
  leaderName: string;
  leaderRoleLabel: string;
  leaderAvatar: TaxiHomeAvatarViewData;
  participantAvatars: TaxiHomeAvatarViewData[];
  memberSummaryLabel: string;
  estimatedFareLabel: string;
  filterIds: TaxiHomeFilterId[];
  joinAction: TaxiHomePartyJoinActionViewData;
  searchKeywords: string[];
  action: TaxiHomePartyAction;
}

export interface TaxiHomeEmptyStateViewData {
  title: string;
  description: string;
}

export interface TaxiHomeSourceData {
  searchPlaceholder: string;
  primaryActionLabel: string;
  liveChatActionLabel: string;
  sectionTitle: string;
  filters: TaxiHomeFilterDefinition[];
  sortOptions: TaxiHomeSortDefinition[];
  parties: TaxiHomePartyCardViewData[];
  emptyState: TaxiHomeEmptyStateViewData;
}

export interface TaxiHomeFilterChipViewData extends TaxiHomeFilterDefinition {
  selected: boolean;
}

export interface TaxiHomeSortOptionViewData extends TaxiHomeSortDefinition {
  selected: boolean;
}

export interface TaxiHomeViewData {
  searchPlaceholder: string;
  searchQuery: string;
  primaryActionLabel: string;
  liveChatActionLabel: string;
  sectionTitle: string;
  visiblePartyCount: number;
  filterChips: TaxiHomeFilterChipViewData[];
  sortOptions: TaxiHomeSortOptionViewData[];
  selectedSortLabel: string;
  parties: TaxiHomePartyCardViewData[];
  emptyState?: TaxiHomeEmptyStateViewData;
}
