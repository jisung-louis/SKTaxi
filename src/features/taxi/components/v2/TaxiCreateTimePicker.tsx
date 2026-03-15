import React from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
} from '@/shared/design-system/tokens';

const ITEM_HEIGHT = 44;
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

const TaxiCreateWheelColumn = ({
  items,
  selectedValue,
  onChange,
}: TaxiCreateWheelColumnProps) => {
  const listRef = React.useRef<FlatList<number>>(null);
  const selectedIndex = React.useMemo(
    () => items.findIndex(item => item === selectedValue),
    [items, selectedValue],
  );

  const scrollToIndex = React.useCallback(
    (index: number, animated: boolean) => {
      listRef.current?.scrollToOffset({
        animated,
        offset: index * ITEM_HEIGHT,
      });
    },
    [],
  );

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => {
      scrollToIndex(selectedIndex, false);
    });

    return () => cancelAnimationFrame(frame);
  }, [scrollToIndex, selectedIndex]);

  const handleScrollEnd = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const rawIndex = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
      const safeIndex = clampIndex(rawIndex, items.length - 1);

      onChange(items[safeIndex]);
      scrollToIndex(safeIndex, true);
    },
    [items, onChange, scrollToIndex],
  );

  return (
    <View style={styles.wheelColumn}>
      <FlatList
        data={items}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          index,
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
        })}
        keyExtractor={item => `${item}`}
        ref={listRef}
        renderItem={({item}) => {
          const isSelected = item === selectedValue;

          return (
            <View style={styles.wheelItem}>
              <Text
                style={[
                  styles.wheelItemLabel,
                  isSelected && styles.wheelItemLabelSelected,
                ]}>
                {`${item}`.padStart(2, '0')}
              </Text>
            </View>
          );
        }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={ITEM_HEIGHT}
        contentContainerStyle={styles.wheelContent}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
      />

      <View pointerEvents="none" style={styles.selectionWindow} />
      <LinearGradient
        colors={[V2_COLORS.background.surface, 'rgba(255,255,255,0)']}
        pointerEvents="none"
        style={styles.fadeTop}
      />
      <LinearGradient
        colors={['rgba(255,255,255,0)', V2_COLORS.background.surface]}
        pointerEvents="none"
        style={styles.fadeBottom}
      />
    </View>
  );
};

export const TaxiCreateTimePicker = ({
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
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.border.subtle,
    borderRadius: V2_RADIUS.lg,
    borderWidth: 1,
    padding: V2_SPACING.lg,
    ...V2_SHADOWS.card,
  },
  title: {
    color: V2_COLORS.text.primary,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: V2_SPACING.lg,
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
    width: 138,
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
    color: '#CBD5E1',
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 36,
  },
  wheelItemLabelSelected: {
    color: '#A7B7B1',
  },
  selectionWindow: {
    borderColor: V2_COLORS.border.accent,
    borderRadius: V2_RADIUS.md,
    borderWidth: 1,
    height: ITEM_HEIGHT,
    left: 0,
    position: 'absolute',
    right: 0,
    top: CONTENT_PADDING,
    backgroundColor: '#F3FBF6',
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
    fontSize: 40,
    fontWeight: '700',
    lineHeight: 46,
    marginHorizontal: V2_SPACING.md,
    marginTop: -8,
  },
  summaryPill: {
    alignSelf: 'center',
    borderRadius: V2_RADIUS.pill,
    marginTop: V2_SPACING.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  summaryPillToday: {
    backgroundColor: V2_COLORS.brand.primarySoft,
  },
  summaryPillTomorrow: {
    backgroundColor: V2_COLORS.accent.orangeSoft,
  },
  summaryLabel: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 18,
  },
  summaryLabelToday: {
    color: V2_COLORS.brand.primaryStrong,
  },
  summaryLabelTomorrow: {
    color: V2_COLORS.status.warning,
  },
});
