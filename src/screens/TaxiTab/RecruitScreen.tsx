import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Platform, Modal } from 'react-native';
//import { Text } from '../components/common/Text';
import { COLORS } from '../../constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TimePicker, formatTimeToSelect } from '../../components/common/TimePicker';
import { CustomTooltip } from '../../components/common/CustomTooltip';
import PageHeader from '../../components/common/PageHeader';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TYPOGRAPHY } from '../../constants/typhograpy';

const DEPARTURE_OPTIONS = [
  ['명학역', '안양역', '금정역'],
  ['범계역', '성결대학교'],
];

const DESTINATION_OPTIONS = [
  ['성결대학교', '안양역', '금정역'],
  ['범계역', '명학역'],
];

const KEYWORD_OPTIONS = ['#여성전용', '#조용히', '#음악', '#짐많음', '#흡연', '#동승환영'];

type RecruitScreenNavigationProp = NativeStackNavigationProp<RecruitScreenParamList, 'Recruit'>;
type RecruitScreenParamList = {
  Recruit: undefined;
};

export const RecruitScreen = () => {
  const navigation = useNavigation<RecruitScreenNavigationProp>();
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [customDeparture, setCustomDeparture] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [customDestination, setCustomDestination] = useState('');
  const [isCustomDestination, setIsCustomDestination] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [detail, setDetail] = useState('');
  const [showKeywordInfo, setShowKeywordInfo] = useState(false);
  const [customKeyword, setCustomKeyword] = useState('');
  const [showKeywordInput, setShowKeywordInput] = useState(false);

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

  const handleAddKeyword = () => {
    if (!customKeyword.trim()) {
      Alert.alert('알림', '키워드를 입력해주세요.');
      return;
    }
    if (keywords.includes(customKeyword)) {
      Alert.alert('알림', '이미 추가된 키워드입니다.');
      return;
    }
    setKeywords(prev => [...prev, customKeyword]);
    setCustomKeyword('');
    setShowKeywordInput(false);
  };

  const onBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <PageHeader onBack={onBack} padding={0} title="택시 파티 모집하기"/>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false} style={{marginTop: 10}}>
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
          <Text style={styles.label}>출발시간</Text>
          <TimePicker
            timeVal={time.split(' ')[1]} // 'HH:mm:ss' 형식으로 변환
            onChange={(newTime) => {
              const [date] = time.split(' ');
              setTime(`${date} ${newTime}`);
            }}
            containerStyle={styles.timeSelectContainer}
            periodStyle={styles.timeSelectPeriod}
            hourStyle={styles.timeSelectHour}
            minuteStyle={styles.timeSelectMinute}
            periodTextStyle={styles.timeSelectPeriodText}
            hourTextStyle={styles.timeSelectHourText}
            minuteTextStyle={styles.timeSelectMinuteText}
            colonStyle={styles.timeSelectColon}
          />
        </View>

        <View style={styles.card}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>키워드 선택</Text>
            <View style={{ position: 'relative' }}>
              <TouchableOpacity onPress={() => setShowKeywordInfo(v => !v)}>
                <Text style={styles.infoButton}>ⓘ</Text>
              </TouchableOpacity>
              <CustomTooltip
                visible={showKeywordInfo}
                text={"동승자에게 전달할 메시지를 키워드로 입력해보세요!"}
                onClose={() => setShowKeywordInfo(false)}
                style={{ left: 30, top: -40,zIndex:1000  }}
              />
            </View>
          </View>
          <View style={styles.keywordContainer}>
            {keywords.map(kw => (
              <View key={kw} style={styles.keywordItem}>
                <Text style={styles.keywordText}>{kw}</Text>
                <TouchableOpacity onPress={() => setKeywords(prev => prev.filter(k => k !== kw))}>
                  <Text style={styles.removeKeywordButton}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity 
              style={styles.addKeywordButton}
              onPress={() => setShowKeywordInput(true)}
            >
              <Text style={styles.addKeywordButtonText}>+ 키워드 추가</Text>
            </TouchableOpacity>
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

      <Modal
        visible={showKeywordInput}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowKeywordInput(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.keywordInput}
              value={customKeyword}
              onChangeText={setCustomKeyword}
              placeholder="키워드를 입력하세요"
              placeholderTextColor={COLORS.text.disabled}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setShowKeywordInput(false);
                  setCustomKeyword('');
                }}
              >
                <Text style={styles.modalButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={handleAddKeyword}
              >
                <Text style={[styles.modalButtonText, styles.modalConfirmButtonText]}>추가</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  keywordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent.green,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  keywordText: {
    color: COLORS.text.buttonText,
    fontSize: 14,
    marginRight: 4,
  },
  removeKeywordButton: {
    color: COLORS.text.buttonText,
    fontSize: 20,
    marginLeft: 4,
    fontWeight: 'bold',
  },
  addKeywordButton: {
    borderWidth: 1,
    borderColor: COLORS.accent.green,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  addKeywordButtonText: {
    color: COLORS.accent.green,
    fontSize: 14,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoButton: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginLeft: 8,
    marginBottom: 16,
  },
  timeSelectContainer: {
    width: '100%',
    justifyContent: 'flex-end',
    backgroundColor:COLORS.background.card,
  },
  timeSelectPeriod: {
  },
  timeSelectHour: {
  },
  timeSelectMinute: {
  },
  timeSelectPeriodText: {
    color: COLORS.text.secondary,
  },
  timeSelectHourText: {
    color: COLORS.text.primary,
  },
  timeSelectMinuteText: {
    color: COLORS.text.primary,
  },
  timeSelectColon: {
    color: COLORS.text.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.background.card,
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalText: {
    fontSize: 16,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  modalCloseButton: {
    backgroundColor: COLORS.accent.green,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: COLORS.text.buttonText,
    fontSize: 16,
    fontWeight: '600',
  },
  keywordInput: {
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text.primary,
    marginBottom: 20,
    backgroundColor:COLORS.background.primary,
    minHeight: 45,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: COLORS.background.primary,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  modalConfirmButton: {
    backgroundColor: COLORS.accent.green,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  modalConfirmButtonText: {
    color: COLORS.text.buttonText,
  },
  tooltipContent: {
    padding: 8,
    minWidth: 200,
  },
  tooltipText: {
    color: COLORS.text.buttonText,
    fontSize: 14,
    textAlign: 'center',
  },
}); 