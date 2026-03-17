import type {ITaxiHomeRepository} from './ITaxiHomeRepository';
import type {TaxiAcceptancePendingSeed} from '../../model/taxiAcceptancePendingViewData';
import type {
  TaxiHomeAvatarViewData,
  TaxiHomeFilterDefinition,
  TaxiHomePartyCardViewData,
  TaxiHomeSortDefinition,
  TaxiHomeSourceData,
} from '../../model/taxiHomeViewData';
import {TAXI_HOME_SOURCE_MOCK} from '../../mocks/taxiHome.mock';

const cloneAvatar = (
  avatar: TaxiHomeAvatarViewData,
): TaxiHomeAvatarViewData => ({
  ...avatar,
});

const cloneAcceptancePendingSeed = (
  seed: TaxiAcceptancePendingSeed,
): TaxiAcceptancePendingSeed => ({
  ...seed,
  leaderAvatar: {...seed.leaderAvatar},
  memberAvatars: seed.memberAvatars.map(avatar => ({...avatar})),
});

const cloneFilter = (
  filter: TaxiHomeFilterDefinition,
): TaxiHomeFilterDefinition => ({
  ...filter,
  matchKeywords: [...filter.matchKeywords],
});

const cloneSort = (sort: TaxiHomeSortDefinition): TaxiHomeSortDefinition => ({
  ...sort,
});

const cloneParty = (
  party: TaxiHomePartyCardViewData,
): TaxiHomePartyCardViewData => ({
  ...party,
  acceptancePendingSeed: party.acceptancePendingSeed
    ? cloneAcceptancePendingSeed(party.acceptancePendingSeed)
    : undefined,
  leaderAvatar: cloneAvatar(party.leaderAvatar),
  participantAvatars: party.participantAvatars.map(cloneAvatar),
  filterIds: [...party.filterIds],
  searchKeywords: [...party.searchKeywords],
  action: {...party.action},
});

const cloneSourceData = (source: TaxiHomeSourceData): TaxiHomeSourceData => ({
  ...source,
  filters: source.filters.map(cloneFilter),
  sortOptions: source.sortOptions.map(cloneSort),
  parties: source.parties.map(cloneParty),
  emptyState: {...source.emptyState},
});

export class MockTaxiHomeRepository implements ITaxiHomeRepository {
  async getHomeData(): Promise<TaxiHomeSourceData> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return cloneSourceData(TAXI_HOME_SOURCE_MOCK);
  }
}
