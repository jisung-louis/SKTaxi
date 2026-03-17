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
  V2_COLORS,
  V2_RADIUS,
  V2_SPACING,
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
            <ActivityIndicator color={V2_COLORS.text.inverse} size="small" />
          </View>
        ) : null}

        <TouchableOpacity
          accessibilityLabel="이미지 삭제"
          accessibilityRole="button"
          activeOpacity={0.82}
          disabled={uploading}
          onPress={() => onRemoveImage(item.id)}
          style={styles.removeButton}>
          <Icon color={V2_COLORS.text.inverse} name="close" size={12} />
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
        <Icon color={V2_COLORS.text.muted} name="add" size={28} />
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
            <Icon color={V2_COLORS.text.muted} name="add" size={28} />
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
    backgroundColor: V2_COLORS.background.page,
    borderColor: V2_COLORS.border.default,
    borderRadius: V2_RADIUS.lg,
    borderStyle: 'dashed',
    borderWidth: 2,
    height: 80,
    justifyContent: 'center',
    marginRight: V2_SPACING.sm,
    width: 80,
  },
  addButtonLabel: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: V2_SPACING.xs,
  },
  footerSpacer: {
    width: V2_SPACING.sm,
  },
  imageItem: {
    height: 80,
    marginRight: V2_SPACING.sm,
    position: 'relative',
    width: 80,
  },
  imageItemActive: {
    opacity: 0.65,
  },
  imagePreview: {
    backgroundColor: V2_COLORS.background.subtle,
    borderRadius: V2_RADIUS.lg,
    height: 80,
    width: 80,
  },
  listContent: {
    alignItems: 'center',
  },
  removeButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(17,24,39,0.82)',
    borderRadius: V2_RADIUS.pill,
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
    borderRadius: V2_RADIUS.lg,
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
