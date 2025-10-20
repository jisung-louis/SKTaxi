import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, cancelAnimation } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import { SelectedImage } from '../../hooks/useImageUpload';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';

interface ImageSelectorProps {
  selectedImages: SelectedImage[];
  onPickImages: () => void;
  onRemoveImage: (imageId: string) => void;
  onReorderImages: (fromIndex: number, toIndex: number) => void;
  maxImages?: number;
  uploading?: boolean;
}

export const ImageSelector: React.FC<ImageSelectorProps> = ({
  selectedImages,
  onPickImages,
  onRemoveImage,
  onReorderImages,
  maxImages = 10,
  uploading = false
}) => {
  const canAddMore = selectedImages.length < maxImages;

  const WiggleItem: React.FC<{ active: boolean; children: React.ReactNode; }> = ({ active, children }) => {
    const rotation = useSharedValue(0);
    const scale = useSharedValue(1);

    React.useEffect(() => {
      if (active) {
        scale.value = withTiming(1.03, { duration: 120 });
        rotation.value = withRepeat(
          withSequence(
            withTiming(-2.5, { duration: 120 }),
            withTiming(2.5, { duration: 120 })
          ),
          -1,
          true
        );
      } else {
        cancelAnimation(rotation);
        rotation.value = withTiming(0, { duration: 120 });
        scale.value = withTiming(1, { duration: 120 });
      }
    }, [active]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
    }));

    return <Animated.View style={animatedStyle}>{children}</Animated.View>;
  };

  const renderImageItem = ({ item, drag, isActive }: RenderItemParams<SelectedImage>) => {
    const getStatusIcon = () => {
      switch (item.status) {
        case 'uploading':
          return <ActivityIndicator size="small" color={COLORS.accent.blue} />;
        case 'uploaded':
          return <Icon name="checkmark-circle" size={20} color={COLORS.accent.green} />;
        case 'failed':
          return <Icon name="close-circle" size={20} color={COLORS.accent.red} />;
        default:
          return null;
      }
    };

    return (
      <WiggleItem active={isActive}>
        <Pressable
          key={item.id}
          onLongPress={drag}
          delayLongPress={250}
          style={({ pressed }) => [
            styles.imageItem,
            (pressed || isActive) && styles.imageItemActive,
          ]}
        >
          <Image source={{ uri: item.localUri }} style={styles.imagePreview} />
          <View style={styles.imageOverlay}>
            {getStatusIcon()}
            {item.status === 'uploading' && (
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${item.progress}%` }]} />
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => onRemoveImage(item.id)}
            disabled={uploading}
          >
            <Icon name="close" size={16} color={COLORS.text.white} />
          </TouchableOpacity>
          {item.status === 'failed' && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                Alert.alert('재시도', '이미지 업로드를 다시 시도하시겠습니까?');
              }}
            >
              <Icon name="refresh" size={16} color={COLORS.text.white} />
            </TouchableOpacity>
          )}
        </Pressable>
      </WiggleItem>
    );
  };

  return (
    <View style={styles.container}>
      <DraggableFlatList
        data={selectedImages}
        keyExtractor={(item) => item.id}
        horizontal
        activationDistance={20}
        contentContainerStyle={styles.imageListContent}
        showsHorizontalScrollIndicator={false}
        renderItem={renderImageItem}
        onDragEnd={({ from, to }) => {
          if (from !== to) {
            onReorderImages(from, to);
          }
        }}
        ListFooterComponent={
          canAddMore ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={onPickImages}
              disabled={uploading}
            >
              <Icon 
                name="camera" 
                size={24} 
                color={uploading ? COLORS.text.disabled : COLORS.accent.blue} 
              />
              <Text style={[
                styles.addButtonText,
                uploading && styles.addButtonTextDisabled
              ]}>
                추가
              </Text>
            </TouchableOpacity>
          ) : null
        }
      />
      
      {selectedImages.length > 0 && (
        <Text style={styles.hint}>
          사진을 길게 눌러 순서를 변경할 수 있습니다
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
  },
  imageListContent: {
    paddingRight: 16,
    paddingLeft: 0,
    marginTop: 6, // removeButton, retryButton 상단 클리핑 방지
  },
  imageItem: {
    position: 'relative',
    marginRight: 12,
  },
  imageItemActive: {
    opacity: 0.6,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: COLORS.background.secondary,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.accent.blue,
    borderRadius: 1,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.accent.red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButton: {
    position: 'absolute',
    bottom: 4,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.accent.orange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
  },
  addButtonText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.accent.blue,
    marginTop: 4,
    fontWeight: '600',
  },
  addButtonTextDisabled: {
    color: COLORS.text.disabled,
  },
  hint: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 12,
  },
});
