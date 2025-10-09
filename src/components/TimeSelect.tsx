import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ViewStyle, TextStyle } from 'react-native';
import { COLORS } from '../constants/colors';

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 3;
export const DAY_PERIOD = ['오전', '오후'];
export const HOURS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
export const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

export function formatTimeToSelect(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');
  const HH = date.getHours().toString().padStart(2, '0');
  const MM = date.getMinutes().toString().padStart(2, '0');
  const ss = date.getSeconds().toString().padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${HH}:${MM}:${ss}`;
}

export interface TimeSelectProps {
  timeVal: string;  // 'HH:mm:ss'
  onChange: (value: string) => void;
  containerStyle?: ViewStyle;
  periodStyle?: ViewStyle;
  hourStyle?: ViewStyle;
  minuteStyle?: ViewStyle;
  periodTextStyle?: TextStyle;
  hourTextStyle?: TextStyle;
  minuteTextStyle?: TextStyle;
  colonStyle?: TextStyle;
  itemHeight?: number;
  visibleItems?: number;
}

export const TimeSelect: React.FC<TimeSelectProps> = ({
  timeVal,
  onChange,
  containerStyle,
  periodStyle,
  hourStyle,
  minuteStyle,
  periodTextStyle,
  hourTextStyle,
  minuteTextStyle,
  colonStyle,
  itemHeight = ITEM_HEIGHT,
  visibleItems = VISIBLE_ITEMS,
}) => {
  // 파싱
  const initial = useMemo(() => {
    const [HH, MM] = timeVal.split(':');
    const hour = parseInt(HH, 10);
    const period = hour < 12 ? '오전' : '오후';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return {
      period,
      hour: hour12.toString().padStart(2, '0'),
      minute: MM,
    };
  }, [timeVal]);

  const [period, setPeriod] = useState(initial.period);
  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);

  // 시간 변경 시 콜백
  useEffect(() => {
    let h = parseInt(hour, 10);
    if (period === '오후' && h !== 12) h += 12;
    if (period === '오전' && h === 12) h = 0;
    const result = `${h.toString().padStart(2, '0')}:${minute}:00`;
    onChange(result);
  }, [period, hour, minute, onChange]);

  return (
    <View style={[styles.timeRow, containerStyle]}>
      <PeriodSelect
        value={period}
        onChange={setPeriod}
        width={48}
        fontSize={18}
        style={periodStyle}
        textStyle={periodTextStyle}
        itemHeight={itemHeight}
        visibleItems={visibleItems}
      />
      <HourSelect
        value={hour}
        onChange={setHour}
        width={72}
        fontSize={40}
        style={hourStyle}
        textStyle={hourTextStyle}
        itemHeight={itemHeight}
        visibleItems={visibleItems}
      />
      <Text style={[styles.colon, colonStyle]}>:</Text>
      <MinuteSelect
        value={minute}
        onChange={setMinute}
        width={72}
        fontSize={40}
        style={minuteStyle}
        textStyle={minuteTextStyle}
        itemHeight={itemHeight}
        visibleItems={visibleItems}
      />
    </View>
  );
};

interface ScrollPickerProps {
  data: string[];
  value: string;
  onChange: (v: string) => void;
  width: number;
  fontSize: number;
  style?: ViewStyle;
  textStyle?: TextStyle;
  itemHeight: number;
  visibleItems: number;
}

const PeriodSelect = ({ value, onChange, width, fontSize, style, textStyle, itemHeight, visibleItems }: Omit<ScrollPickerProps, 'data'>) => (
  <ScrollPicker
    data={DAY_PERIOD}
    value={value}
    onChange={onChange}
    width={width}
    fontSize={fontSize}
    style={style}
    textStyle={textStyle}
    itemHeight={itemHeight}
    visibleItems={visibleItems}
  />
);

const HourSelect = ({ value, onChange, width, fontSize, style, textStyle, itemHeight, visibleItems }: Omit<ScrollPickerProps, 'data'>) => (
  <ScrollPicker
    data={HOURS}
    value={value}
    onChange={onChange}
    width={width}
    fontSize={fontSize}
    style={style}
    textStyle={textStyle}
    itemHeight={itemHeight}
    visibleItems={visibleItems}
  />
);

const MinuteSelect = ({ value, onChange, width, fontSize, style, textStyle, itemHeight, visibleItems }: Omit<ScrollPickerProps, 'data'>) => (
  <ScrollPicker
    data={MINUTES}
    value={value}
    onChange={onChange}
    width={width}
    fontSize={fontSize}
    style={style}
    textStyle={textStyle}
    itemHeight={itemHeight}
    visibleItems={visibleItems}
  />
);

const ScrollPicker = ({
  data,
  value,
  onChange,
  width,
  fontSize,
  style,
  textStyle,
  itemHeight,
  visibleItems,
}: ScrollPickerProps) => {
  const selectedIndex = data.indexOf(value);
  const [scrollY, setScrollY] = useState(0);
  const getOpacity = (index: number) => {
    const itemPosition = index * itemHeight;
    const centerIndex = Math.floor(visibleItems / 2);
    const centerY = scrollY;
    const distanceFromCenter = Math.abs(itemPosition - centerY);
    const maxDistance = itemHeight * centerIndex;
    return Math.max(0.2, 1 - distanceFromCenter / maxDistance);
  };

  return (
    <View style={[styles.pickerContainer, { width, height: itemHeight * visibleItems }, style]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingVertical: itemHeight * Math.floor(visibleItems / 2),
        }}
        onScroll={(e) => {
          setScrollY(e.nativeEvent.contentOffset.y);
        }}
        scrollEventThrottle={16}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.y / itemHeight);
          onChange(data[idx]);
        }}
        style={{ flex: 1 }}
      >
        {data.map((item, idx) => (
          <View
            key={item}
            style={[
              styles.pickerItem,
              { height: itemHeight },
            ]}
          >
            <Text style={[
              styles.pickerText,
              { 
                fontSize,
                opacity: getOpacity(idx),
              },
              textStyle,
              //idx === selectedIndex && styles.pickerTextSelected, //선택된 시간 bold처리
            ]}>
              {item}
            </Text>
          </View>
        ))}
      </ScrollView>
      {/*<View
        style={[
          styles.pickerHighlight,
          {
            top: (itemHeight * (visibleItems-1))/2,
            height: itemHeight,
          },
        ]}
        pointerEvents="none"
      />*/}
    </View>
  );
};

const styles = StyleSheet.create({
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  colon: {
    fontSize: 40,
    fontWeight: 'bold',
    marginHorizontal: 4,
  },
  pickerContainer: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  pickerItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerText: {
    textAlign: 'center',
    opacity: 1,
  },
  pickerTextSelected: {
    fontWeight: 'bold',
  },
  pickerHighlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E5E5',
    zIndex: 10,
  },
});