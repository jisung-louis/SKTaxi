import React from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DraggableFlatList, {
  type RenderItemParams,
} from 'react-native-draggable-flatlist';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  COLORS,
  RADIUS,
  SPACING,
} from '@/shared/design-system/tokens';

import type {BoardSelectedImage} from '../model/types';

interface ImageSelectorProps {
  maxImages?: number;
  onPickImages: () => void;
  onRemoveImage: (imageId: string) => void;
  onReorderImages: (fromIndex: number, toIndex: number) => void;
  selectedImages: BoardSelectedImage[];
  uploading?: boolean;
}

export const ImageSelector = ({
  maxImages = 10,
  onPickImages,
  onRemoveImage,
  onReorderImages,
  selectedImages,
  uploading = false,
}: ImageSelectorProps) => {
  const canAddMore = selectedImages.length < maxImages;

  const renderImageItem = ({
    drag,
    isActive,
    item,
  }: RenderItemParams<BoardSelectedImage>) => {
    const isUploading = item.status === 'uploading';

    return (
      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.92}
        delayLongPress={220}
        onLongPress={drag}
        style={[styles.imageItem, isActive ? styles.imageItemActive : undefined]}>
        <Image source={{uri: item.localUri}} style={styles.imagePreview} />

        {isUploading ? (
          <View style={styles.uploadOverlay}>
            <ActivityIndicator color={COLORS.text.inverse} size="small" />
          </View>
        ) : null}

        <TouchableOpacity
          accessibilityLabel="이미지 삭제"
          accessibilityRole="button"
          activeOpacity={0.82}
          disabled={uploading}
          onPress={() => onRemoveImage(item.id)}
          style={styles.removeButton}>
          <Icon color={COLORS.text.inverse} name="close" size={12} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (selectedImages.length === 0) {
    return (
      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.82}
        disabled={!canAddMore || uploading}
        onPress={onPickImages}
        style={styles.addButton}>
        <Icon color={COLORS.text.muted} name="add" size={28} />
        <Text style={styles.addButtonLabel}>추가</Text>
      </TouchableOpacity>
    );
  }

  return (
    <DraggableFlatList
      activationDistance={20}
      contentContainerStyle={styles.listContent}
      data={selectedImages}
      horizontal
      keyExtractor={item => item.id}
      onDragEnd={({from, to}) => {
        if (from !== to) {
          onReorderImages(from, to);
        }
      }}
      renderItem={renderImageItem}
      showsHorizontalScrollIndicator={false}
      ListFooterComponent={
        canAddMore ? (
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.82}
            disabled={uploading}
            onPress={onPickImages}
            style={styles.addButton}>
            <Icon color={COLORS.text.muted} name="add" size={28} />
            <Text style={styles.addButtonLabel}>추가</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.footerSpacer} />
        )
      }
    />
  );
};

const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    backgroundColor: COLORS.background.page,
    borderColor: COLORS.border.default,
    borderRadius: RADIUS.lg,
    borderStyle: 'dashed',
    borderWidth: 2,
    height: 82,
    justifyContent: 'center',
    marginRight: SPACING.sm,
    width: 82,
  },
  addButtonLabel: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: SPACING.xs,
  },
  footerSpacer: {
    width: SPACING.sm,
  },
  imageItem: {
    height: 82,
    marginRight: SPACING.sm,
    position: 'relative',
    width: 82,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  imageItemActive: {
    opacity: 0.65,
  },
  imagePreview: {
    backgroundColor: COLORS.background.subtle,
    borderRadius: RADIUS.lg,
    height: 80,
    width: 80,
  },
  listContent: {
    alignItems: 'center',
  },
  removeButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(17,24,39,0.82)',
    borderRadius: RADIUS.pill,
    height: 20,
    justifyContent: 'center',
    position: 'absolute',
    right: 6,
    top: 6,
    width: 20,
  },
  uploadOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(17,24,39,0.32)',
    borderRadius: RADIUS.lg,
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
