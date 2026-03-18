import React from 'react';

import type {TaxiHomeFilterChipViewData} from '../../model/taxiHomeViewData';
import {
  V2FilterChips,
  type V2FilterChipItem,
} from '@/shared/design-system/components';

interface TaxiHomeFilterChipsProps {
  filters: TaxiHomeFilterChipViewData[];
  onPressFilter: (filterId: TaxiHomeFilterChipViewData['id']) => void;
}

export const TaxiHomeFilterChips = ({
  filters,
  onPressFilter,
}: TaxiHomeFilterChipsProps) => {
  const items: V2FilterChipItem<TaxiHomeFilterChipViewData['id']>[] =
    filters.map(filter => ({
      id: filter.id,
      label: filter.label,
      selected: filter.selected,
    }));

  return <V2FilterChips items={items} onPressItem={onPressFilter} />;
};
