import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';

import {V2FilterChips} from '@/shared/design-system/components';
import {V2_SPACING} from '@/shared/design-system/tokens';

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
    paddingBottom: V2_SPACING.sm,
    paddingRight: V2_SPACING.lg,
  },
});
