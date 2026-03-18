import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {V2ToggleSwitch} from '@/shared/design-system/components';
import {
  V2_COLORS,
  V2_SPACING,
} from '@/shared/design-system/tokens';

import {BOARD_CATEGORIES} from '../../model/constants';
import type {BoardPostCategoryId, BoardSelectedImage} from '../../model/types';
import {ImageSelector} from '../ImageSelector';

const TITLE_LIMIT = 100;
const CONTENT_LIMIT = 3000;
const CATEGORY_ORDER: BoardPostCategoryId[] = [
  'general',
  'announcement',
  'question',
  'review',
];
const CATEGORY_LABELS: Record<BoardPostCategoryId, string> = {
  announcement: '정보게시판',
  general: '자유게시판',
  question: '질문게시판',
  review: '후기게시판',
};

interface BoardComposeFormProps {
  category: BoardPostCategoryId;
  content: string;
  contentPlaceholder: string;
  isAnonymous: boolean;
  onChangeContent: (value: string) => void;
  onChangeTitle: (value: string) => void;
  onPickImages: () => void;
  onRemoveImage: (imageId: string) => void;
  onReorderImages: (fromIndex: number, toIndex: number) => void;
  onSelectCategory: (category: BoardPostCategoryId) => void;
  onToggleAnonymous: () => void;
  selectedImages: BoardSelectedImage[];
  title: string;
  titlePlaceholder: string;
  uploadingImages?: boolean;
}

export const BoardComposeForm = ({
  category,
  content,
  contentPlaceholder,
  isAnonymous,
  onChangeContent,
  onChangeTitle,
  onPickImages,
  onRemoveImage,
  onReorderImages,
  onSelectCategory,
  onToggleAnonymous,
  selectedImages,
  title,
  titlePlaceholder,
  uploadingImages = false,
}: BoardComposeFormProps) => {
  const categories = React.useMemo(() => {
    const categoryMap = new Map(
      BOARD_CATEGORIES.map(item => [item.id, item] as const),
    );

    return CATEGORY_ORDER.map(categoryId => ({
      id: categoryId,
      label: CATEGORY_LABELS[categoryId],
      source: categoryMap.get(categoryId),
    })).filter(
      (
        item,
      ): item is {
        id: BoardPostCategoryId;
        label: string;
        source: (typeof BOARD_CATEGORIES)[number];
      } => Boolean(item.source),
    );
  }, []);

  return (
    <ScrollView
      bounces={false}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.standaloneSectionLabel}>게시판 선택</Text>
        <View style={styles.categoryRow}>
          {categories.map(item => {
            const isSelected = item.id === category;

            return (
              <TouchableOpacity
                key={item.id}
                accessibilityRole="button"
                activeOpacity={0.82}
                onPress={() => onSelectCategory(item.id)}
                style={[
                  styles.categoryChip,
                  isSelected ? styles.categoryChipSelected : undefined,
                ]}>
                <Text
                  style={[
                    styles.categoryChipLabel,
                    isSelected ? styles.categoryChipLabelSelected : undefined,
                  ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <TextInput
          maxLength={TITLE_LIMIT}
          onChangeText={onChangeTitle}
          placeholder={titlePlaceholder}
          placeholderTextColor={V2_COLORS.border.default}
          style={styles.titleInput}
          value={title}
        />
        <Text style={styles.counterLabel}>
          {title.length}/{TITLE_LIMIT}
        </Text>
      </View>

      <View style={[styles.section, styles.contentSection]}>
        <TextInput
          maxLength={CONTENT_LIMIT}
          multiline
          onChangeText={onChangeContent}
          placeholder={contentPlaceholder}
          placeholderTextColor={V2_COLORS.border.default}
          style={styles.contentInput}
          textAlignVertical="top"
          value={content}
        />
        <Text style={styles.counterLabel}>
          {content.length}/{CONTENT_LIMIT}
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>사진</Text>
          <Text style={styles.inlineCounterLabel}>
            {selectedImages.length}/10
          </Text>
        </View>
        <ImageSelector
          maxImages={10}
          onPickImages={onPickImages}
          onRemoveImage={onRemoveImage}
          onReorderImages={onReorderImages}
          selectedImages={selectedImages}
          uploading={uploadingImages}
        />
      </View>

      <View style={styles.toggleSection}>
        <View>
          <Text style={styles.toggleTitle}>익명으로 올리기</Text>
          <Text style={styles.toggleDescription}>
            닉네임 대신 &#39;익명&#39;으로 표시돼요
          </Text>
        </View>

        <V2ToggleSwitch
          accessibilityLabel="익명으로 올리기"
          onValueChange={onToggleAnonymous}
          value={isAnonymous}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  categoryChip: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.subtle,
    borderRadius: 12,
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  categoryChipLabel: {
    color: V2_COLORS.text.tertiary,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  categoryChipLabelSelected: {
    color: V2_COLORS.text.inverse,
  },
  categoryChipSelected: {
    backgroundColor: V2_COLORS.brand.primaryAccent,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: V2_SPACING.sm,
  },
  contentContainer: {
    backgroundColor: V2_COLORS.background.surface,
    paddingBottom: 32,
  },
  contentInput: {
    color: V2_COLORS.text.strong,
    fontSize: 14,
    lineHeight: 23,
    minHeight: 180,
    padding: 0,
  },
  contentSection: {
    minHeight: 231,
  },
  counterLabel: {
    alignSelf: 'flex-end',
    color: V2_COLORS.border.default,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  inlineCounterLabel: {
    color: V2_COLORS.border.default,
    fontSize: 12,
    lineHeight: 16,
  },
  section: {
    borderBottomColor: V2_COLORS.border.subtle,
    borderBottomWidth: 1,
    paddingHorizontal: V2_SPACING.lg,
    paddingBottom: 13,
    paddingTop: 12,
  },
  sectionHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionLabel: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  standaloneSectionLabel: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    marginBottom: 10,
  },
  titleInput: {
    color: V2_COLORS.text.primary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    minHeight: 24,
    padding: 0,
  },
  toggleDescription: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  toggleSection: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: V2_SPACING.lg,
    paddingTop: V2_SPACING.lg,
  },
  toggleTitle: {
    color: V2_COLORS.text.primary,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
});
