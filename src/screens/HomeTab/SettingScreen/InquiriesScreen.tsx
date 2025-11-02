import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, ScrollView, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typhograpy';
import PageHeader from '../../../components/common/PageHeader';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../../hooks/useAuth';
import { getFirestore, collection, addDoc } from '@react-native-firebase/firestore';
import { useScreenView } from '../../../hooks/useScreenView';

const INQUIRY_TYPES = [
  { id: 'feature', label: '기능 제안', icon: 'bulb-outline' },
  { id: 'bug', label: '버그 신고', icon: 'bug-outline' },
  { id: 'account', label: '계정 문의', icon: 'person-outline' },
  { id: 'service', label: '서비스 문의', icon: 'help-circle-outline' },
  { id: 'other', label: '기타', icon: 'chatbubble-outline' },
];

export const InquiriesScreen = () => {
  useScreenView();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<any>();
  const { user } = useAuth();
  
  const [selectedType, setSelectedType] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 파라미터로 받은 타입에 따라 자동 선택
  useEffect(() => {
    const type = route?.params?.type;
    if (type && ['feature', 'bug', 'account', 'service', 'other'].includes(type)) {
      setSelectedType(type);
    }
  }, [route?.params?.type]);

  const handleSubmitInquiry = async () => {
    if (!selectedType) {
      Alert.alert('알림', '문의 유형을 선택해주세요.');
      return;
    }
    
    if (!subject.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }
    
    if (!content.trim()) {
      Alert.alert('알림', '문의 내용을 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      
      const db = getFirestore();
      const inquiriesRef = collection(db, 'inquiries');
      
      const inquiryData = {
        type: selectedType,
        subject: subject.trim(),
        content: content.trim(),
        userId: user?.uid || null,
        userEmail: user?.email || null,
        userName: user?.displayName || null,
        userRealname: user?.realname || null,
        userStudentId: user?.studentId || null,
        status: 'pending', // pending, in_progress, resolved
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addDoc(inquiriesRef, inquiryData);
      
      Alert.alert(
        '문의 전송 완료', 
        '보내주셔서 감사해요!',
        [
          {
            text: '확인',
            onPress: () => {
              // 폼 초기화
              setSelectedType('');
              setSubject('');
              setContent('');
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      console.error('문의 접수 실패:', error);
      Alert.alert('오류', '문의사항 접수에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const InquiryTypeButton = ({ type }: { type: typeof INQUIRY_TYPES[0] }) => (
    <TouchableOpacity
      style={[
        styles.typeButton,
        selectedType === type.id && styles.typeButtonSelected
      ]}
      onPress={() => setSelectedType(type.id)}
    >
      <Icon 
        name={type.icon} 
        size={20} 
        color={selectedType === type.id ? COLORS.accent.blue : COLORS.text.secondary} 
      />
      <Text style={[
        styles.typeButtonText,
        selectedType === type.id && styles.typeButtonTextSelected
      ]}>
        {type.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader onBack={() => navigation.goBack()} title="문의사항" borderBottom />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
        {/* 문의 유형 선택 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>문의 유형</Text>
          <View style={styles.typeContainer}>
            {INQUIRY_TYPES.map((type) => (
              <InquiryTypeButton key={type.id} type={type} />
            ))}
          </View>
        </View>

        {/* 제목 입력 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제목</Text>
          <TextInput
            style={styles.input}
            value={subject}
            onChangeText={setSubject}
            placeholder="문의 제목을 입력하세요"
            placeholderTextColor={COLORS.text.disabled}
            maxLength={100}
          />
        </View>

        {/* 내용 입력 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>문의 내용</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={content}
            onChangeText={setContent}
            placeholder="문의 내용을 자세히 입력해주세요"
            placeholderTextColor={COLORS.text.disabled}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            maxLength={1000}
          />
          <Text style={styles.characterCount}>{content.length}/1000</Text>
        </View>

        {/* 전송 버튼 */}
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!selectedType || !subject.trim() || !content.trim() || submitting) && styles.sendButtonDisabled
          ]}
          onPress={handleSubmitInquiry}
          disabled={!selectedType || !subject.trim() || !content.trim() || submitting}
        >
          <Icon name="send-outline" size={20} color={COLORS.text.white} />
          <Text style={styles.sendButtonText}>
            {submitting ? '처리 중...' : '문의 접수하기'}
          </Text>
        </TouchableOpacity>

        {/* 안내 메시지 */}
        <View style={styles.infoContainer}>
          <Icon name="information-circle-outline" size={16} color={COLORS.text.secondary} />
          <Text style={styles.infoText}>
            문의사항이 접수되면 최대한 빨리 답변드릴게요. 감사해요!!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...TYPOGRAPHY.subtitle2,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  typeButtonSelected: {
    backgroundColor: COLORS.accent.blue + '15',
    borderColor: COLORS.accent.blue,
  },
  typeButtonText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  typeButtonTextSelected: {
    color: COLORS.accent.blue,
    fontWeight: '600',
  },
  input: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.disabled,
    textAlign: 'right',
    marginTop: 4,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.accent.blue,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.text.disabled,
  },
  sendButtonText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.white,
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: COLORS.background.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  infoText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    lineHeight: 18,
    flex: 1,
  },
});