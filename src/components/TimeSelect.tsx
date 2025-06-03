import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { COLORS } from '../constants/colors';

const ITEM_HEIGHT = 40;
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
  timeVal: string;  // 'YYYY-MM-DD HH:mm:ss'
  onChange: (value: string) => void;
}

export const TimeSelect: React.FC<TimeSelectProps> = ({ timeVal, onChange }) => {
  // 파싱
  const initial = useMemo(() => {
    const [date, time] = timeVal.split(' ');
    const [HH, MM] = time.split(':');
    const hour = parseInt(HH, 10);
    const period = hour < 12 ? '오전' : '오후';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return {
      period,
      hour: hour12.toString().padStart(2, '0'),
      minute: MM,
      date,
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
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    const dd = now.getDate().toString().padStart(2, '0');
    const ss = '00';
    const result = `${yyyy}-${mm}-${dd} ${h.toString().padStart(2, '0')}:${minute}:${ss}`;
    onChange(result);
  }, [period, hour, minute, onChange]);

  return (
    <View style={styles.card}>
      <Text style={styles.label}>출발시간</Text>
      <View style={styles.timeRow}>
        <PeriodSelect value={period} onChange={setPeriod} />
        <HourSelect value={hour} onChange={setHour} />
        <Text style={styles.colon}>:</Text>
        <MinuteSelect value={minute} onChange={setMinute} />
      </View>
    </View>
  );
};

const PeriodSelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <ScrollPicker
    data={DAY_PERIOD}
    value={value}
    onChange={onChange}
    width={48}
    fontSize={16}
  />
);

const HourSelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <ScrollPicker
    data={HOURS}
    value={value}
    onChange={onChange}
    width={72}
    fontSize={40}
  />
);

const MinuteSelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <ScrollPicker
    data={MINUTES}
    value={value}
    onChange={onChange}
    width={72}
    fontSize={40}
  />
);

const ScrollPicker = ({
  data,
  value,
  onChange,
  width,
  fontSize,
}: {
  data: string[];
  value: string;
  onChange: (v: string) => void;
  width: number;
  fontSize: number;
}) => {
  const selectedIndex = data.indexOf(value);
  return (
    <View style={[styles.pickerContainer, { width }]}> 
      <ScrollView
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingVertical: (ITEM_HEIGHT * (VISIBLE_ITEMS - 1)) / 2,
        }}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
          onChange(data[idx]);
        }}
        style={{ flex: 1 }}
      >
        {data.map((item, idx) => (
          <View
            key={item}
            style={[
              styles.pickerItem,
              idx === selectedIndex && styles.pickerItemSelected,
            ]}
          >
            <Text style={[
              idx === selectedIndex ? styles.pickerTextSelected : styles.pickerText,
              { fontSize },
            ]}>
              {item}
            </Text>
          </View>
        ))}
      </ScrollView>
      {/* 중앙선 */}
      <View style={styles.pickerHighlight} pointerEvents="none" />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background.card,
    borderRadius: 20,
    padding: 20,
    marginVertical: 8,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'flex-start',
  },
  colon: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginHorizontal: 4,
  },
  pickerContainer: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemSelected: {},
  pickerText: {
    color: COLORS.text.secondary,
    fontWeight: '400',
    textAlign: 'center',
  },
  pickerTextSelected: {
    color: COLORS.text.buttonText,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pickerHighlight: {
    position: 'absolute',
    top: (ITEM_HEIGHT * (VISIBLE_ITEMS - 1)) / 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border.default,
    zIndex: 10,
  },
}); 