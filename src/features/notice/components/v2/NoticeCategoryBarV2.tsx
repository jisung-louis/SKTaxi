import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';

import {V2FilterChips} from '@/shared/design-system/components';

import type {NoticeHomeCategoryChipViewData} from '../../model/noticeHomeViewData';

interface NoticeCategoryBarV2Props {
  categories: NoticeHomeCategoryChipViewData[];
  onSelectCategory: (categoryId: NoticeHomeCategoryChipViewData['id']) => void;
}

export const NoticeCategoryBarV2 = ({
  categories,
  onSelectCategory,
}: NoticeCategoryBarV2Props) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}>
      <V2FilterChips
        inactiveVariant="surface"
        items={categories}
        onPressItem={onSelectCategory}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 12,
  },
});
