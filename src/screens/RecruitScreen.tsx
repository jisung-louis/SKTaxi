import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import { Text } from '../components/common/Text';
import { COLORS } from '../constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TimeSelect, formatTimeToSelect } from '../components/TimeSelect';

const DEPARTURE_OPTIONS = [
  ['명학역', '안양역', '금정역'],
  ['범계역', '성결대학교'],
];

const DESTINATION_OPTIONS = [
  ['성결대학교', '안양역', '금정역'],
  ['범계역', '명학역'],
];

const KEYWORD_OPTIONS = ['#여성전용', '#조용히', '#음악', '#짐많음', '#흡연', '#동승환영'];

export const RecruitScreen = () => {
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [customDeparture, setCustomDeparture] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [customDestination, setCustomDestination] = useState('');
  const [isCustomDestination, setIsCustomDestination] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [detail, setDetail] = useState('');

  const now = new Date();
  now.setHours(8, 0, 0, 0); // 오전 8시 0분 0초
  const [time, setTime] = useState(formatTimeToSelect(now));

  const handleRecruit = () => {
    if (!departure || !destination || !time) {
      Alert.alert('알림', '출발지, 도착지, 출발시간을 모두 입력해주세요.');
      return;
    }
    // TODO: Firebase에 택시 모집 정보 저장
    Alert.alert('알림', '택시 모집이 시작되었습니다.');
  };

  const handleKeywordToggle = (kw: string) => {
    setKeywords(prev => prev.includes(kw) ? prev.filter(k => k !== kw) : [...prev, kw]);
  };

  // 더미 시간 선택 (실제 DateTimePicker로 교체 가능)
  const handleTimeSelect = () => {
    // 더미: 현재 시간으로 설정
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    setTime(`${h}:${m}`);
    setShowTimePicker(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Text style={styles.title}>택시 파티 모집하기</Text>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.label}>출발지</Text>
          {DEPARTURE_OPTIONS.map((row, rowIdx) => (
            <View key={rowIdx} style={styles.segmentContainer}>
              {row.map(station => (
                <TouchableOpacity
                  key={station}
                  style={[
                    styles.segmentButton,
                    departure === station && !isCustom && styles.segmentButtonSelected,
                  ]}
                  onPress={() => {
                    setDeparture(station);
                    setIsCustom(false);
                  }}
                >
                  <Text style={departure === station && !isCustom ? styles.segmentTextSelected : styles.segmentText}>
                    {station}
                  </Text>
                </TouchableOpacity>
              ))}
              {rowIdx === DEPARTURE_OPTIONS.length - 1 && (
                <TouchableOpacity
                  style={[
                    styles.segmentButton,
                    isCustom && styles.segmentButtonSelected,
                  ]}
                  onPress={() => {
                    setIsCustom(true);
                    setDeparture(customDeparture);
                  }}
                >
                  <Text style={isCustom ? styles.segmentTextSelected : styles.segmentText}>
                    직접 입력
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          {isCustom && (
            <TextInput
              style={[styles.input, { marginTop: 8 }]}
              value={customDeparture}
              onChangeText={text => {
                setCustomDeparture(text);
                setDeparture(text);
              }}
              placeholder="출발지를 직접 입력하세요"
              placeholderTextColor={COLORS.text.disabled}
            />
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>도착지</Text>
          {DESTINATION_OPTIONS.map((row, rowIdx) => (
            <View key={rowIdx} style={styles.segmentContainer}>
              {row.map(station => (
                <TouchableOpacity
                  key={station}
                  style={[
                    styles.segmentButton,
                    destination === station && !isCustomDestination && styles.segmentButtonSelected,
                  ]}
                  onPress={() => {
                    setDestination(station);
                    setIsCustomDestination(false);
                  }}
                >
                  <Text style={destination === station && !isCustomDestination ? styles.segmentTextSelected : styles.segmentText}>
                    {station}
                  </Text>
                </TouchableOpacity>
              ))}
              {rowIdx === DESTINATION_OPTIONS.length - 1 && (
                <TouchableOpacity
                  style={[
                    styles.segmentButton,
                    isCustomDestination && styles.segmentButtonSelected,
                  ]}
                  onPress={() => {
                    setIsCustomDestination(true);
                    setDestination(customDestination);
                  }}
                >
                  <Text style={isCustomDestination ? styles.segmentTextSelected : styles.segmentText}>
                    직접 입력
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          {isCustomDestination && (
            <TextInput
              style={[styles.input, { marginTop: 8 }]}
              value={customDestination}
              onChangeText={text => {
                setCustomDestination(text);
                setDestination(text);
              }}
              placeholder="도착지를 직접 입력하세요"
              placeholderTextColor={COLORS.text.disabled}
            />
          )}
        </View>

        <View style={styles.card}>
          <TimeSelect timeVal={time} onChange={setTime} />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>키워드 선택</Text>
          <View style={styles.keywordContainer}>
            {KEYWORD_OPTIONS.map(kw => (
              <TouchableOpacity
                key={kw}
                style={[
                  styles.keywordButton,
                  keywords.includes(kw) && styles.keywordButtonSelected,
                ]}
                onPress={() => handleKeywordToggle(kw)}
              >
                <Text style={keywords.includes(kw) ? styles.keywordTextSelected : styles.keywordText}>{kw}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>상세 내용</Text>
          <TextInput
            style={[styles.input, { minHeight: 80 }]}
            value={detail}
            onChangeText={setDetail}
            placeholder="상세 내용을 입력하세요 (예: 짐이 많아요, 조용히 가고 싶어요 등)"
            placeholderTextColor={COLORS.text.disabled}
            multiline
          />
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.buttonFixed} onPress={handleRecruit}>
        <Text style={styles.buttonText}>택시 모집 시작</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background.card,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    transform: [{ scale: 1 }],
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginTop: 8,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: 8,
    backgroundColor: COLORS.background.primary,
    padding: 12,
    fontSize: 16,
    color: COLORS.text.primary,
  },
  button: {
    backgroundColor: COLORS.accent.green,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonFixed: {
    backgroundColor: COLORS.accent.green,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    zIndex: 10,
  },
  buttonText: {
    color: COLORS.text.buttonText,
    fontSize: 16,
    fontWeight: '600',
  },
  segmentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 2,
    borderRadius: 16,
    backgroundColor: COLORS.background.primary,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  segmentButtonSelected: {
    backgroundColor: COLORS.accent.green,
    borderColor: COLORS.accent.green,
  },
  segmentText: {
    color: COLORS.text.primary,
    fontSize: 16,
  },
  segmentTextSelected: {
    color: COLORS.text.buttonText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  keywordContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  keywordButton: {
    borderWidth: 1,
    borderColor: COLORS.accent.green,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
    backgroundColor: COLORS.background.primary,
  },
  keywordButtonSelected: {
    backgroundColor: COLORS.accent.green,
    borderColor: COLORS.accent.green,
  },
  keywordText: {
    color: COLORS.accent.green,
    fontSize: 14,
  },
  keywordTextSelected: {
    color: COLORS.text.buttonText,
    fontSize: 14,
    fontWeight: 'bold',
  },
  timeButton: {
    borderWidth: 1,
    borderColor: COLORS.accent.green,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  timeButtonText: {
    color: COLORS.accent.green,
    fontSize: 16,
    fontWeight: '600',
  },
}); 