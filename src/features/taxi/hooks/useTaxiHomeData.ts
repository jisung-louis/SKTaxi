import React from 'react';

import type {ITaxiHomeRepository} from '../data/repositories/ITaxiHomeRepository';
import {MockTaxiHomeRepository} from '../data/repositories/MockTaxiHomeRepository';
import type {
  TaxiHomeFilterId,
  TaxiHomePartyCardViewData,
  TaxiHomeSortId,
  TaxiHomeSourceData,
  TaxiHomeViewData,
} from '../model/taxiHomeViewData';

interface UseTaxiHomeDataResult {
  data: TaxiHomeViewData | null;
  error: string | null;
  loading: boolean;
  refetch: () => Promise<void>;
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
  const filteredParties = source.parties.filter(party => {
    if (
      selectedFilterId !== 'all' &&
      !party.filterIds.includes(selectedFilterId)
    ) {
      return false;
    }

    return matchesSearchQuery(party, searchQuery);
  });

  const parties = sortParties(filteredParties, selectedSortId);
  const selectedSort =
    source.sortOptions.find(sortOption => sortOption.id === selectedSortId) ??
    source.sortOptions[0];

  return {
    searchPlaceholder: source.searchPlaceholder,
    searchQuery,
    primaryActionLabel: source.primaryActionLabel,
    liveChatActionLabel: source.liveChatActionLabel,
    sectionTitle: source.sectionTitle,
    visiblePartyCount: parties.length,
    filterChips: source.filters.map(filter => ({
      ...filter,
      selected: filter.id === selectedFilterId,
    })),
    sortOptions: source.sortOptions.map(sortOption => ({
      ...sortOption,
      selected: sortOption.id === selectedSortId,
    })),
    selectedSortLabel: selectedSort?.label ?? '',
    parties,
    emptyState: parties.length === 0 ? source.emptyState : undefined,
  };
};

export const useTaxiHomeData = (): UseTaxiHomeDataResult => {
  const repositoryRef = React.useRef<ITaxiHomeRepository | null>(null);

  if (!repositoryRef.current) {
    repositoryRef.current = new MockTaxiHomeRepository();
  }

  const [source, setSource] = React.useState<TaxiHomeSourceData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedFilterId, setSelectedFilterId] =
    React.useState<TaxiHomeFilterId>('all');
  const [selectedSortId, setSelectedSortId] =
    React.useState<TaxiHomeSortId>('latest');

  const load = React.useCallback(async () => {
    if (!repositoryRef.current) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nextSource = await repositoryRef.current.getHomeData();
      setSource(nextSource);
    } catch (loadError) {
      console.error('taxi home mock data load failed', loadError);
      setError('택시 홈 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

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

  return {
    data,
    error,
    loading,
    refetch: load,
    selectFilter,
    selectSort,
    setSearchQuery,
  };
};
