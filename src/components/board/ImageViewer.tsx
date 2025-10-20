import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import { BoardImage } from '../../types/board';

interface ImageViewerProps {
  visible: boolean;
  images: BoardImage[];
  initialIndex?: number;
  onClose: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  visible,
  images,
  initialIndex = 0,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({ [initialIndex]: true });
  const flatListRef = useRef<FlatList>(null);

  const hasImages = images && images.length > 0;
  const currentImage = hasImages ? images[currentIndex] : undefined;
  const containerPadding = 16;
  const itemGap = 16;
  const itemWidth = screenWidth - containerPadding * 2;

  const getImageDimensions = (image: BoardImage) => {
    const aspectRatio = image.width / image.height;
    const maxWidth = itemWidth;
    const maxHeight = screenHeight * 0.8;

    let displayWidth = maxWidth;
    let displayHeight = maxWidth / aspectRatio;

    if (displayHeight > maxHeight) {
      displayHeight = maxHeight;
      displayWidth = maxHeight * aspectRatio;
    }

    return { width: displayWidth, height: displayHeight };
  };

  const imageDimensions = currentImage ? getImageDimensions(currentImage) : { width: itemWidth, height: screenHeight * 0.6 };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      const nextIndex = viewableItems[0].index ?? 0;
      if (typeof nextIndex === 'number') {
        setCurrentIndex(nextIndex);
      }
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 60 }).current;

  const getItemLayout = useCallback((_: any, index: number) => (
    { length: itemWidth + itemGap, offset: (itemWidth + itemGap) * index, index }
  ), [itemWidth, itemGap]);

  const renderItem = useCallback(({ item, index }: { item: BoardImage; index: number }) => {
    const dims = getImageDimensions(item);
    const isLoading = loadingMap[index];
    return (
      <View style={{ width: itemWidth, justifyContent: 'center', alignItems: 'center' }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          maximumZoomScale={3}
          minimumZoomScale={1}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        >
          <Image
            source={{ uri: item.url }}
            style={[styles.image, { width: dims.width, height: dims.height }]}
            resizeMode="contain"
            onLoadStart={() => setLoadingMap(prev => ({ ...prev, [index]: true }))}
            onLoadEnd={() => setLoadingMap(prev => ({ ...prev, [index]: false }))}
          />
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={COLORS.text.white} />
            </View>
          )}
        </ScrollView>
      </View>
    );
  }, [screenWidth, loadingMap]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={COLORS.text.white} />
          </TouchableOpacity>
          <Text style={styles.counter}>
            {currentIndex + 1} / {images.length}
          </Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.imageContainer}>
          {hasImages ? (
            <FlatList
              ref={flatListRef}
              data={images}
              contentContainerStyle={{ paddingHorizontal: containerPadding, gap: itemGap }}
              keyExtractor={(_, idx) => String(idx)}
              renderItem={renderItem}
              horizontal
              pagingEnabled={false}
              snapToInterval={itemWidth + itemGap}
              snapToAlignment="start"
              decelerationRate="fast"
              initialScrollIndex={initialIndex}
              getItemLayout={getItemLayout}
              showsHorizontalScrollIndicator={false}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
            />
          ) : (
            <View style={{ width: screenWidth, height: imageDimensions.height, justifyContent: 'center', alignItems: 'center' }} />
          )}

          {hasImages && images.length > 1 && (
            <>
              {currentIndex > 0 && (
                <TouchableOpacity
                  style={[styles.navButton, styles.prevButton]}
                  onPress={() => flatListRef.current?.scrollToIndex({ index: Math.max(0, currentIndex - 1), animated: true })}
                >
                  <Icon name="chevron-back" size={24} color={COLORS.text.white} />
                </TouchableOpacity>
              )}

              {currentIndex < images.length - 1 && (
                <TouchableOpacity
                  style={[styles.navButton, styles.nextButton]}
                  onPress={() => flatListRef.current?.scrollToIndex({ index: Math.min(images.length - 1, currentIndex + 1), animated: true })}
                >
                  <Icon name="chevron-forward" size={24} color={COLORS.text.white} />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {hasImages && images.length > 1 && (
          <View style={styles.thumbnailContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailList}
            >
              {images.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.thumbnail,
                    index === currentIndex && styles.thumbnailActive,
                  ]}
                  onPress={() => {
                    setCurrentIndex(index);
                    flatListRef.current?.scrollToIndex({ index, animated: true });
                  }}
                >
                  <Image
                    source={{ uri: image.thumbUrl || image.url }}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counter: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.white,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%',
  },
  image: {
    borderRadius: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: -25 }],
  },
  prevButton: {
    left: 20,
  },
  nextButton: {
    right: 20,
  },
  thumbnailContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  thumbnailList: {
    paddingHorizontal: 8,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: COLORS.accent.blue,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
});
