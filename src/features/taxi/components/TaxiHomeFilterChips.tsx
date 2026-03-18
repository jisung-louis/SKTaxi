import React from 'react';

import type {TaxiHomeFilterChipViewData} from '../../model/taxiHomeViewData';
import {
  FilterChips,
  type FilterChipItem,
} from '@/shared/design-system/components';

interface TaxiHomeFilterChipsProps {
  filters: TaxiHomeFilterChipViewData[];
  onPressFilter: (filterId: TaxiHomeFilterChipViewData['id']) => void;
}

export const TaxiHomeFilterChips = ({
  filters,
  onPressFilter,
}: TaxiHomeFilterChipsProps) => {
  const items: FilterChipItem<TaxiHomeFilterChipViewData['id']>[] =
    filters.map(filter => ({
      id: filter.id,
      label: filter.label,
      selected: filter.selected,
    }));

  return <FilterChips items={items} onPressItem={onPressFilter} />;
};
