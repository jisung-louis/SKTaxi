import React from 'react';

import {
  createTaxiHomeJoinRequest,
  loadTaxiHomeQueryResult,
} from '../application/taxiHomeQuery';
import type {TaxiAcceptancePendingSeed} from '../model/taxiAcceptancePendingViewData';
import type {
  TaxiHomeFilterId,
  TaxiHomePartyCardViewData,
  TaxiHomeSortId,
  TaxiHomeSourceData,
  TaxiHomeViewData,
} from '../model/taxiHomeViewData';
import {ALL_TAXI_HOME_FILTER_ID} from '../model/taxiHomeViewData';

interface UseTaxiHomeDataResult {
  activePartyId: string | null;
  data: TaxiHomeViewData | null;
  error: string | null;
  hasActiveParty: boolean;
  loading: boolean;
  refetch: () => Promise<void>;
  requestJoin: (
    party: TaxiHomePartyCardViewData,
  ) => Promise<TaxiAcceptancePendingSeed>;
  selectFilter: (filterId: TaxiHomeFilterId) => void;
  selectSort: (sortId: TaxiHomeSortId) => void;
  setSearchQuery: (value: string) => void;
}

const matchesSearchQuery = (
  party: TaxiHomePartyCardViewData,
  query: string,
) => {
  if (!query) {
    return true;
  }

  const normalizedQuery = query.trim().toLowerCase();

  return party.searchKeywords.some(keyword =>
    keyword.toLowerCase().includes(normalizedQuery),
  );
};

const sortParties = (
  parties: TaxiHomePartyCardViewData[],
  sortId: TaxiHomeSortId,
) => {
  const sorted = [...parties];

  if (sortId === 'departureSoon') {
    sorted.sort(
      (left, right) =>
        new Date(left.departureAt).getTime() -
        new Date(right.departureAt).getTime(),
    );

    return sorted;
  }

  sorted.sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );

  return sorted;
};

const buildTaxiHomeViewData = ({
  searchQuery,
  selectedFilterId,
  selectedSortId,
  source,
}: {
  searchQuery: string;
  selectedFilterId: TaxiHomeFilterId;
  selectedSortId: TaxiHomeSortId;
  source: TaxiHomeSourceData;
}): TaxiHomeViewData => {
  const effectiveSelectedFilterId = source.filters.some(
    filter => filter.id === selectedFilterId,
  )
    ? selectedFilterId
    : ALL_TAXI_HOME_FILTER_ID;
  const filteredParties = source.parties.filter(party => {
    if (
      effectiveSelectedFilterId !== ALL_TAXI_HOME_FILTER_ID &&
      !party.filterIds.includes(effectiveSelectedFilterId)
    ) {
      return false;
    }

    return matchesSearchQuery(party, searchQuery);
  });

  const parties = sortParties(filteredParties, selectedSortId);
  const selectedSort =
    source.sortOptions.find(sortOption => sortOption.id === selectedSortId) ??
    source.sortOptions[0];
  const emptyState =
    source.parties.length === 0
      ? source.noPartiesEmptyState
      : parties.length === 0
        ? source.filteredEmptyState
        : undefined;

  return {
    searchPlaceholder: source.searchPlaceholder,
    searchQuery,
    primaryActionLabel: source.primaryActionLabel,
    liveChatActionLabel: source.liveChatActionLabel,
    sectionTitle: source.sectionTitle,
    visiblePartyCount: parties.length,
    filterChips: source.filters.map(filter => ({
      ...filter,
      selected: filter.id === effectiveSelectedFilterId,
    })),
    sortOptions: source.sortOptions.map(sortOption => ({
      ...sortOption,
      selected: sortOption.id === selectedSortId,
    })),
    selectedSortLabel: selectedSort?.label ?? '',
    parties,
    emptyState,
  };
};

export const useTaxiHomeData = (): UseTaxiHomeDataResult => {
  const [activePartyId, setActivePartyId] = React.useState<string | null>(null);
  const [source, setSource] = React.useState<TaxiHomeSourceData | null>(null);
  const [hasActiveParty, setHasActiveParty] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedFilterId, setSelectedFilterId] =
    React.useState<TaxiHomeFilterId>(ALL_TAXI_HOME_FILTER_ID);
  const [selectedSortId, setSelectedSortId] =
    React.useState<TaxiHomeSortId>('latest');

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await loadTaxiHomeQueryResult();
      setActivePartyId(result.activePartyId);
      setHasActiveParty(result.hasActiveParty);
      setSource(result.source);
    } catch (loadError) {
      console.error('택시 홈 데이터를 불러오지 못했습니다.', loadError);
      setError('택시 홈 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  React.useEffect(() => {
    if (!source?.filters.length) {
      if (selectedFilterId !== ALL_TAXI_HOME_FILTER_ID) {
        setSelectedFilterId(ALL_TAXI_HOME_FILTER_ID);
      }
      return;
    }

    if (!source.filters.some(filter => filter.id === selectedFilterId)) {
      setSelectedFilterId(ALL_TAXI_HOME_FILTER_ID);
    }
  }, [selectedFilterId, source]);

  const data = React.useMemo(() => {
    if (!source) {
      return null;
    }

    return buildTaxiHomeViewData({
      searchQuery,
      selectedFilterId,
      selectedSortId,
      source,
    });
  }, [searchQuery, selectedFilterId, selectedSortId, source]);

  const selectFilter = React.useCallback((filterId: TaxiHomeFilterId) => {
    setSelectedFilterId(filterId);
  }, []);

  const selectSort = React.useCallback((sortId: TaxiHomeSortId) => {
    setSelectedSortId(sortId);
  }, []);

  const requestJoin = React.useCallback(
    (party: TaxiHomePartyCardViewData) => createTaxiHomeJoinRequest(party),
    [],
  );

  return {
    activePartyId,
    data,
    error,
    hasActiveParty,
    loading,
    refetch: load,
    requestJoin,
    selectFilter,
    selectSort,
    setSearchQuery,
  };
};
