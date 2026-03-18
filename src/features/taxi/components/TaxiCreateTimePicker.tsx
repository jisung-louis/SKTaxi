import React from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
} from '@/shared/design-system/tokens';

const ITEM_HEIGHT = 40;
const VISIBLE_ITEM_COUNT = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEM_COUNT;
const CONTENT_PADDING = (PICKER_HEIGHT - ITEM_HEIGHT) / 2;

const HOURS = Array.from({length: 24}, (_, index) => index);
const MINUTES = Array.from({length: 60}, (_, index) => index);

interface TaxiCreateWheelColumnProps {
  items: number[];
  selectedValue: number;
  onChange: (value: number) => void;
}

interface TaxiCreateTimePickerProps {
  hour: number;
  minute: number;
  summaryLabel: string;
  summaryTone: 'today' | 'tomorrow';
  onChangeHour: (hour: number) => void;
  onChangeMinute: (minute: number) => void;
}

const clampIndex = (index: number, max: number) =>
  Math.min(Math.max(index, 0), max);

const TaxiCreateWheelLabel = React.memo(
  ({label, selected}: {label: string; selected: boolean}) => {
    const progress = useSharedValue(selected ? 1 : 0);

    React.useEffect(() => {
      progress.value = withTiming(selected ? 1 : 0, {duration: 140});
    }, [progress, selected]);

    const animatedStyle = useAnimatedStyle(() => ({
      color: interpolateColor(
        progress.value,
        [0, 1],
        [COLORS.text.muted, COLORS.brand.primary],
      ),
      fontSize: interpolate(progress.value, [0, 1], [16, 22]),
      lineHeight: interpolate(progress.value, [0, 1], [24, 28]),
      transform: [{scale: interpolate(progress.value, [0, 1], [1, 1.04])}],
    }));

    return (
      <Animated.Text style={[styles.wheelItemLabel, animatedStyle]}>
        {label}
      </Animated.Text>
    );
  },
);

const TaxiCreateWheelColumn = React.memo(
  ({
    items,
    selectedValue,
    onChange,
  }: TaxiCreateWheelColumnProps) => {
    const scrollRef = React.useRef<ScrollView>(null);
    const selectedIndex = React.useMemo(
      () => items.findIndex(item => item === selectedValue),
      [items, selectedValue],
    );
    const lastAnnouncedValueRef = React.useRef(selectedValue);

    React.useEffect(() => {
      lastAnnouncedValueRef.current = selectedValue;
    }, [selectedValue]);

    React.useEffect(() => {
      const offset = selectedIndex * ITEM_HEIGHT;
      const frame = requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({animated: false, y: offset});
      });

      return () => cancelAnimationFrame(frame);
    }, [selectedIndex]);

    const announceNearestValue = React.useCallback(
      (offsetY: number) => {
        const rawIndex = Math.round(offsetY / ITEM_HEIGHT);
        const safeIndex = clampIndex(rawIndex, items.length - 1);
        const nextValue = items[safeIndex];

        if (nextValue !== lastAnnouncedValueRef.current) {
          lastAnnouncedValueRef.current = nextValue;
          onChange(nextValue);
        }

        return safeIndex;
      },
      [items, onChange],
    );

    const snapToNearest = React.useCallback(
      (offsetY: number) => {
        const safeIndex = announceNearestValue(offsetY);
        const targetOffset = safeIndex * ITEM_HEIGHT;

        if (Math.abs(offsetY - targetOffset) > 0.5) {
          scrollRef.current?.scrollTo({
            animated: true,
            y: targetOffset,
          });
        }
      },
      [announceNearestValue],
    );

    const handleScroll = React.useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        announceNearestValue(event.nativeEvent.contentOffset.y);
      },
      [announceNearestValue],
    );

    const handleMomentumEnd = React.useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        snapToNearest(event.nativeEvent.contentOffset.y);
      },
      [snapToNearest],
    );

    const handleScrollEndDrag = React.useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const velocityY = Math.abs(event.nativeEvent.velocity?.y ?? 0);

        if (velocityY < 0.05) {
          snapToNearest(event.nativeEvent.contentOffset.y);
        }
      },
      [snapToNearest],
    );

    return (
      <View style={styles.wheelColumn}>
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.wheelContent}
        decelerationRate={Platform.OS === 'ios' ? 0.992 : 0.985}
        directionalLockEnabled
        nestedScrollEnabled
        overScrollMode="never"
        ref={scrollRef}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumEnd}
        onScroll={handleScroll}
        onScrollEndDrag={handleScrollEndDrag}>
          {items.map(item => {
            const isSelected = item === selectedValue;

            return (
              <View key={item} style={styles.wheelItem}>
                <TaxiCreateWheelLabel
                  label={`${item}`.padStart(2, '0')}
                  selected={isSelected}
                />
              </View>
            );
          })}
        </ScrollView>

        <View pointerEvents="none" style={styles.selectionWindow} />
        <LinearGradient
          colors={[COLORS.background.surface, 'rgba(255,255,255,0)']}
          pointerEvents="none"
          style={styles.fadeTop}
        />
        <LinearGradient
          colors={['rgba(255,255,255,0)', COLORS.background.surface]}
          pointerEvents="none"
          style={styles.fadeBottom}
        />
      </View>
    );
  },
);

export const TaxiCreateTimePicker = React.memo(({
  hour,
  minute,
  summaryLabel,
  summaryTone,
  onChangeHour,
  onChangeMinute,
}: TaxiCreateTimePickerProps) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>출발 시간</Text>

      <View style={styles.pickerRow}>
        <TaxiCreateWheelColumn
          items={HOURS}
          selectedValue={hour}
          onChange={onChangeHour}
        />
        <Text style={styles.separator}>:</Text>
        <TaxiCreateWheelColumn
          items={MINUTES}
          selectedValue={minute}
          onChange={onChangeMinute}
        />
      </View>

      <View
        style={[
          styles.summaryPill,
          summaryTone === 'tomorrow'
            ? styles.summaryPillTomorrow
            : styles.summaryPillToday,
        ]}>
        <Text
          style={[
            styles.summaryLabel,
            summaryTone === 'tomorrow'
              ? styles.summaryLabelTomorrow
              : styles.summaryLabelToday,
          ]}>
          {summaryLabel}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.border.subtle,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.lg,
    ...SHADOWS.card,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: SPACING.md,
  },
  pickerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  wheelColumn: {
    height: PICKER_HEIGHT,
    overflow: 'hidden',
    position: 'relative',
    width: 120,
  },
  wheelContent: {
    paddingVertical: CONTENT_PADDING,
  },
  wheelItem: {
    alignItems: 'center',
    height: ITEM_HEIGHT,
    justifyContent: 'center',
  },
  wheelItemLabel: {
    fontWeight: '700',
  },
  selectionWindow: {
    backgroundColor: '#F3FBF6',
    borderColor: COLORS.border.accent,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    height: ITEM_HEIGHT,
    left: 0,
    position: 'absolute',
    right: 0,
    top: CONTENT_PADDING,
    zIndex: -1,
  },
  fadeTop: {
    height: CONTENT_PADDING,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  fadeBottom: {
    bottom: 0,
    height: CONTENT_PADDING,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  separator: {
    color: '#9AA7B1',
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 38,
    marginHorizontal: SPACING.sm,
    marginTop: -6,
  },
  summaryPill: {
    alignSelf: 'center',
    borderRadius: RADIUS.pill,
    marginTop: SPACING.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  summaryPillToday: {
    backgroundColor: COLORS.brand.primarySoft,
  },
  summaryPillTomorrow: {
    backgroundColor: COLORS.accent.orangeSoft,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  summaryLabelToday: {
    color: COLORS.brand.primaryStrong,
  },
  summaryLabelTomorrow: {
    color: COLORS.status.warning,
  },
});
