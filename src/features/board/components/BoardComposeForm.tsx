import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {ToggleSwitch} from '@/shared/design-system/components';
import {
  COLORS,
  SPACING,
} from '@/shared/design-system/tokens';

import {BOARD_CATEGORIES} from '../model/constants';
import type {BoardPostCategoryId, BoardSelectedImage} from '../model/types';
import {ImageSelector} from './ImageSelector';

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
  anonymousEditable?: boolean;
  category: BoardPostCategoryId;
  content: string;
  contentPlaceholder: string;
  imageHelperText?: string;
  imagesEditable?: boolean;
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
  anonymousEditable = true,
  category,
  content,
  contentPlaceholder,
  imageHelperText,
  imagesEditable = true,
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
          placeholderTextColor={COLORS.text.placeholder}
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
          placeholderTextColor={COLORS.text.placeholder}
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
          editable={imagesEditable}
          maxImages={10}
          onPickImages={onPickImages}
          onRemoveImage={onRemoveImage}
          onReorderImages={onReorderImages}
          selectedImages={selectedImages}
          uploading={uploadingImages}
        />
        {imageHelperText ? (
          <Text style={styles.helperText}>{imageHelperText}</Text>
        ) : null}
      </View>

      <View style={styles.toggleSection}>
        <View>
          <Text style={styles.toggleTitle}>익명으로 올리기</Text>
          <Text style={styles.toggleDescription}>
            {anonymousEditable
              ? '닉네임 대신 익명으로 표시돼요'
              : '현재 Spring 계약에서는 작성 후 익명 설정을 수정할 수 없어요'}
          </Text>
        </View>

        <ToggleSwitch
          accessibilityLabel="익명으로 올리기"
          disabled={!anonymousEditable}
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
    backgroundColor: COLORS.background.subtle,
    borderRadius: 12,
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  categoryChipLabel: {
    color: COLORS.text.tertiary,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  categoryChipLabelSelected: {
    color: COLORS.text.inverse,
  },
  categoryChipSelected: {
    backgroundColor: COLORS.brand.primaryAccent,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  contentContainer: {
    backgroundColor: COLORS.background.surface,
    paddingBottom: 32,
  },
  contentInput: {
    color: COLORS.text.strong,
    fontSize: 14,
    lineHeight: 18,
    minHeight: 180,
    padding: 0,
  },
  contentSection: {
    minHeight: 231,
  },
  counterLabel: {
    alignSelf: 'flex-end',
    color: COLORS.border.default,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  helperText: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: SPACING.sm,
  },
  inlineCounterLabel: {
    color: COLORS.border.default,
    fontSize: 12,
    lineHeight: 16,
  },
  section: {
    borderBottomColor: COLORS.border.subtle,
    borderBottomWidth: 1,
    paddingHorizontal: SPACING.lg,
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
    color: COLORS.text.muted,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  standaloneSectionLabel: {
    color: COLORS.text.muted,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    marginBottom: 10,
  },
  titleInput: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
    minHeight: 24,
    padding: 0,
  },
  toggleDescription: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  toggleSection: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  toggleTitle: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
});
