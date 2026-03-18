import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';

import {FilterChips} from '@/shared/design-system/components';
import {SPACING} from '@/shared/design-system/tokens';

import type {NoticeHomeCategoryChipViewData} from '../../model/noticeHomeViewData';

interface NoticeCategoryBarProps {
  categories: NoticeHomeCategoryChipViewData[];
  onSelectCategory: (categoryId: NoticeHomeCategoryChipViewData['id']) => void;
}

export const NoticeCategoryBar = ({
  categories,
  onSelectCategory,
}: NoticeCategoryBarProps) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}>
      <FilterChips
        inactiveVariant="surface"
        items={categories}
        onPressItem={onSelectCategory}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingRight: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
});
