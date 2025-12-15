import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Platform, Modal, TouchableWithoutFeedback, KeyboardAvoidingView } from 'react-native';
//import { Text } from '../components/common/Text';
import { COLORS } from '../../constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TimePicker, formatTimeToSelect } from '../../components/common/TimePicker';
import { CustomTooltip } from '../../components/common/CustomTooltip';
import PageHeader from '../../components/common/PageHeader';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TaxiStackParamList } from '../../navigations/types';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import Button from '../../components/common/Button';
import { DEPARTURE_OPTIONS, DESTINATION_OPTIONS, DEPARTURE_LOCATION, DESTINATION_LOCATION } from '../../constants/constants';
import { WINDOW_WIDTH } from '@gorhom/bottom-sheet';
// SKTaxi: Firestore 저장 로직 추가
import { getApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { sendSystemMessage } from '../../hooks/useMessages';
import Icon from 'react-native-vector-icons/Ionicons';
import { useScreenView } from '../../hooks/useScreenView';
import { logEvent } from '../../lib/analytics';

type RecruitScreenNavigationProp = NativeStackNavigationProp<TaxiStackParamList, 'Recruit'>;

export const RecruitScreen = () => {
  useScreenView();
  const navigation = useNavigation<RecruitScreenNavigationProp>();
  const scrollViewRef = useRef<ScrollView>(null);
  const keywordInputRef = useRef<TextInput>(null);
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [customDeparture, setCustomDeparture] = useState('');
  const [customDepartureCoord, setCustomDepartureCoord] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isCustom, setIsCustom] = useState(false);
  const [customDestination, setCustomDestination] = useState('');
  const [customDestinationCoord, setCustomDestinationCoord] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isCustomDestination, setIsCustomDestination] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [detail, setDetail] = useState('');
  const [showKeywordInfo, setShowKeywordInfo] = useState(false);
  const [customKeyword, setCustomKeyword] = useState('');
  const [showKeywordInput, setShowKeywordInput] = useState(false);
  const [maxMembers, setMaxMembers] = useState(4);
  const [isCreating, setIsCreating] = useState(false);

  const now = new Date();
  const currentHour = now.getHours().toString().padStart(2, '0');
  const currentMinute = now.getMinutes().toString().padStart(2, '0');
  const [time, setTime] = useState(`${currentHour}:${currentMinute}:00`);
  const [departureLocation, setDepartureLocation] = useState({ row: 0, col: 0 });
  const [destinationLocation, setDestinationLocation] = useState({ row: 0, col: 0 });

  const handleRecruit = async () => {
    if (!departure || !destination || !time) {
      Alert.alert('알림', '출발지, 도착지, 출발시간을 모두 입력해주세요.');
      return;
    }
    
    if (departure === destination) {
      Alert.alert('알림', '출발지와 도착지가 같을 수 없습니다.\n다른 도착지를 선택해주세요.');
      return;
    }
    // 좌표 가져오기
    let departureCoord: { latitude: number; longitude: number } | null = null;
    let destinationCoord: { latitude: number; longitude: number } | null = null;
    
    if (!isCustom) {
      // 미리 정의된 출발지의 좌표
      departureCoord = DEPARTURE_LOCATION[departureLocation.row][departureLocation.col];
    } else {
      departureCoord = customDepartureCoord;
    }
    
    if (!isCustomDestination) {
      // 미리 정의된 도착지의 좌표
      destinationCoord = DESTINATION_LOCATION[destinationLocation.row][destinationLocation.col];
    } else {
      destinationCoord = customDestinationCoord;
    }

    // 커스텀 선택인데 좌표가 없는 경우 방어
    if (isCustom && !departureCoord) {
      Alert.alert('알림', '출발지 좌표가 없습니다. 지도를 통해 위치를 선택해주세요.');
      return;
    }
    if (isCustomDestination && !destinationCoord) {
      Alert.alert('알림', '도착지 좌표가 없습니다. 지도를 통해 위치를 선택해주세요.');
      return;
    }
    
    const user = auth(getApp()).currentUser;
    if (!user) {
      Alert.alert('알림', '로그인이 필요합니다.');
      return;
    }

    if (isCreating) {
      return;
    }

    try {
      setIsCreating(true);
      const departureTimeISO = new Date(new Date().toDateString() + ' ' + time).toISOString();
      const partyDoc = {
        // SKTaxi: 실제 Firestore 저장 필드 구성
        leaderId: user.uid,
        departure: { name: departure, lat: departureCoord?.latitude ?? 0, lng: departureCoord?.longitude ?? 0 },
        destination: { name: destination, lat: destinationCoord?.latitude ?? 0, lng: destinationCoord?.longitude ?? 0 },
        departureTime: departureTimeISO,
        maxMembers,
        members: [user.uid],
        tags: keywords,
        detail,
        status: 'open' as const,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      const ref = await firestore(getApp()).collection('parties').add(partyDoc);
      
      // Analytics: 파티 생성 이벤트 로깅
      await logEvent('party_created', {
        party_id: ref.id,
        departure: departure,
        destination: destination,
        max_members: maxMembers,
        has_keywords: keywords.length > 0,
        keyword_count: keywords.length,
        has_detail: !!detail.trim(),
      });
      
      // SKTaxi: 채팅방 생성 시스템 메시지 전송
      try {
        await sendSystemMessage(ref.id, '채팅방이 생성되었어요!');
      } catch (error) {
        console.error('SKTaxi RecruitScreen: Error sending system message:', error);
        // 시스템 메시지 전송 실패해도 전체 프로세스는 계속 진행
      }
      
      Alert.alert('알림', '택시 모집이 시작되었습니다.');
      // 스택에서 RecruitScreen을 제거하고 Chat으로 대체하여 뒤로가기로 중복 생성 방지
      navigation.replace('Chat', { partyId: ref.id });
    } catch (e) {
      Alert.alert('오류', '파티 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.warn('create party failed', e); // SKTaxi: 디버깅 로그
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeywordToggle = (kw: string) => {
    setKeywords(prev => prev.includes(kw) ? prev.filter(k => k !== kw) : [...prev, kw]);
  };

  const handleAddKeyword = () => {
    const raw = customKeyword.trim();
    if (!raw) {
      Alert.alert('알림', '키워드를 입력해주세요.');
      return;
    }
    if (raw.length > 5) {
      Alert.alert('알림', '키워드는 최대 5글자까지 입력 가능합니다.');
      return;
    }
    if (keywords.length >= 3) {
      Alert.alert('알림', '키워드는 최대 3개까지 추가할 수 있습니다.');
      return;
    }
    const withHash = raw.startsWith('#') ? raw : `#${raw}`;
    if (keywords.includes(withHash)) {
      Alert.alert('알림', '이미 추가된 키워드입니다.');
      return;
    }
    setKeywords(prev => [...prev, withHash]);
    setCustomKeyword('');
    setShowKeywordInput(false);
  };

  const onBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <PageHeader onBack={onBack} title="택시 파티 모집하기"/>
      {showKeywordInfo && (
        <TouchableOpacity
          style={styles.tooltipOverlay}
          activeOpacity={1}
          onPress={() => setShowKeywordInfo(false)}
        />
      )}
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={{ paddingBottom: 400 }} 
        showsVerticalScrollIndicator
        style={{marginTop: 10, paddingHorizontal: 16}}
      >
        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Icon name="location-sharp" size={20} color={COLORS.accent.blue} />
            <Text style={styles.label}>출발지</Text>
          </View>
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
                    setDeparture(prev => prev === station ? '' : station);
                    setIsCustom(false);
                    // 해당 station의 인덱스 찾기
                    const stationIndex = DEPARTURE_OPTIONS[rowIdx].indexOf(station);
                    setDepartureLocation({ row: rowIdx, col: stationIndex });
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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
               <Text
                 style={[styles.input, { marginTop: 8, flex: 1, color: COLORS.text.secondary }]}
               >
                 {customDeparture || '지도에서 선택해주세요'}
               </Text>
               <Button 
                 title="지도 검색" 
                 onPress={() => {
                   navigation.navigate('MapSearch', {
                     type: 'departure',
                     onLocationSelect: (location) => {
                       // 지도에서 입력받은 지역 명칭과 좌표 저장
                       setCustomDeparture(location.address);
                       setDeparture(location.address);
                       setCustomDepartureCoord({ latitude: location.latitude, longitude: location.longitude });
                     }
                   });
                 }} 
                 style={{ marginTop: 8, height: 40 }}
               />
              </View>
            )}
        </View>

        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Icon name="location-sharp" size={20} color={COLORS.accent.green} />
            <Text style={styles.label}>도착지</Text>
          </View>
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
                    setDestination(prev => prev === station ? '' : station);
                    setIsCustomDestination(false);
                    // 해당 station의 인덱스 찾기
                    const stationIndex = DESTINATION_OPTIONS[rowIdx].indexOf(station);
                    setDestinationLocation({ row: rowIdx, col: stationIndex });
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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
               <Text
                 style={[styles.input, { marginTop: 8, flex: 1, color: COLORS.text.secondary }]}
               >
                 {customDestination || '지도에서 선택해주세요'}
               </Text>
               <Button 
                 title="지도 검색" 
                 onPress={() => {
                   navigation.navigate('MapSearch', {
                     type: 'destination',
                     onLocationSelect: (location) => {
                       setCustomDestination(location.address);
                       setDestination(location.address);
                       setCustomDestinationCoord({ latitude: location.latitude, longitude: location.longitude });
                     }
                   });
                 }} 
                 style={{ marginTop: 8, height: 40 }}
               />
              </View>
            )}
        </View>

        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Icon name="time" size={20} color={COLORS.accent.orange} />
            <Text style={styles.label}>출발시간</Text>
          </View>
          <TimePicker
            timeVal={time} // 이미 'HH:mm:ss' 형식
            onChange={(newTime) => {
              setTime(newTime);
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
            <View style={styles.labelRow}>
              <Icon name="people" size={20} color={COLORS.accent.blue} />
              <Text style={styles.label}>최대 인원</Text>
            </View>
            <Text style={styles.infoText}>본인을 포함한 인원을 선택해주세요!</Text>
          </View>
          <View style={styles.memberContainer}>
            {[2, 3, 4, 5, 6, 7].map((count) => (
              <TouchableOpacity
                key={count}
                style={[
                  styles.memberButton,
                  maxMembers === count && styles.memberButtonSelected,
                ]}
                onPress={() => setMaxMembers(count)}
              >
                <Text style={[
                  styles.memberButtonText,
                  maxMembers === count && styles.memberButtonTextSelected,
                ]}>
                  {count}명
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.labelContainer}>
            <View style={styles.labelRow}>
              <Icon name="pricetag" size={20} color={COLORS.accent.orange} />
              <Text style={styles.label}>키워드 선택</Text>
            </View>

            <View style={{ position: 'relative' }}>
              <TouchableOpacity onPress={() => setShowKeywordInfo(v => !v)}>
                <Text style={styles.infoButton}>ⓘ</Text>
              </TouchableOpacity>
              <CustomTooltip
                visible={showKeywordInfo}
                text={"동승자에게 전달할 메시지를 키워드로 입력해보세요!\n(예: #중생관, #짐많음, #여자만 등)"}
                onClose={() => setShowKeywordInfo(false)}
                style={{ left: 30, top: -60, zIndex: 1000 }}
              />
            </View>
          </View>
          <View style={styles.keywordContainer}>
            {keywords.map(kw => (
              <View key={kw} style={styles.keywordItem}>
                <Text style={styles.keywordText}>{kw}</Text>
                <TouchableOpacity onPress={() => setKeywords(prev => prev.filter(k => k !== kw))}>
                <Icon name="close" size={20} color={COLORS.text.buttonText} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity 
              style={[styles.addKeywordButton, keywords.length >= 3 && styles.addKeywordButtonDisabled]}
              onPress={() => {
                if (keywords.length >= 3) {
                  Alert.alert('알림', '키워드는 최대 3개까지 추가할 수 있습니다.');
                  return;
                }
                setCustomKeyword('');
                setShowKeywordInput(true);
                // 약간의 딜레이 후 포커스 (모달 오픈 타이밍 보정)
                setTimeout(() => {
                  keywordInputRef.current?.focus();
                }, 50);
              }}
              disabled={keywords.length >= 3}
            >
              <Text style={[styles.addKeywordButtonText, keywords.length >= 3 && styles.addKeywordButtonTextDisabled]}>
                + 키워드 추가
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Icon name="document-text" size={20} color={COLORS.text.secondary} />
            <Text style={styles.label}>상세 내용</Text>
          </View>
          <TextInput
            style={[styles.input, { minHeight: 80 }]}
            value={detail}
            onChangeText={setDetail}
            placeholder="상세 내용을 입력하세요 (예: 명학역 1번출구에서 만나요, 검은 모자 쓰고 있어요 등)"
            placeholderTextColor={COLORS.text.disabled}
            multiline
            onFocus={() => {
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }}
          />
        </View>
      </ScrollView>
      <View style={styles.floatingSubmitButton}>
        <Button
          title={isCreating ? '생성 중...' : '택시 모집 시작'}
          onPress={handleRecruit}
          disabled={isCreating}
          style={{ width: '100%', opacity: isCreating ? 0.7 : 1 }}
        />
      </View>
      <Modal
        visible={showKeywordInput}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowKeywordInput(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowKeywordInput(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '80%' }}>
                <View style={styles.modalContent}>
                  <TextInput
                    ref={keywordInputRef}
                    style={styles.keywordInput}
                    value={customKeyword}
                    onChangeText={(text) => {
                      if (text.length <= 5) {
                        setCustomKeyword(text);
                      }
                    }}
                    placeholder="키워드를 입력하세요 (최대 5글자)"
                    placeholderTextColor={COLORS.text.disabled}
                    maxLength={5}
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
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    ...TYPOGRAPHY.title3,
    color: COLORS.text.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: 8,
    backgroundColor: COLORS.background.primary,
    padding: 12,
    fontSize: 16,
    color: COLORS.text.primary,
    minHeight: 45,
  },
  segmentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 2,
    borderRadius: 12,
    backgroundColor: COLORS.background.primary,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  segmentButtonSelected: {
    backgroundColor: COLORS.accent.green,
  },
  segmentText: {
    color: COLORS.text.primary,
    ...TYPOGRAPHY.body1,
  },
  segmentTextSelected: {
    color: COLORS.text.buttonText,
    ...TYPOGRAPHY.body1,
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
  addKeywordButtonDisabled: {
    opacity: 0.5,
    borderColor: COLORS.border.light,
  },
  addKeywordButtonTextDisabled: {
    color: COLORS.text.disabled,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  infoButton: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginLeft: 8,
    marginBottom: 16,
  },
  infoText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    marginLeft: 8,
    marginBottom: 16,
  },
  timeSelectContainer: {
    width: 'auto',
    justifyContent: 'flex-end',
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
  floatingSubmitButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: COLORS.background.primary,
    padding: 16,
    width: WINDOW_WIDTH,
    height: 48 + (16 * 2) + 40, // 버튼 높이 + 패딩 + 하단 안전영역
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
  },
  memberContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  memberButton: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.background.primary,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  memberButtonSelected: {
    backgroundColor: COLORS.accent.green,
    borderColor: COLORS.accent.green,
  },
  memberButtonText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  memberButtonTextSelected: {
    color: COLORS.text.buttonText,
    fontWeight: '600',
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
  tooltipOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    backgroundColor: 'transparent',
  },
}); 