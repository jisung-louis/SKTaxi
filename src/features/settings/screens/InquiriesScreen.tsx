import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import {type CampusStackParamList} from '@/app/navigation/types';
import {
  FormField,
  InfoBanner,
  StackHeader,
} from '@/shared/design-system/components';
import {
  COLORS,
  RADIUS,
  SPACING,
} from '@/shared/design-system/tokens';
import {useScreenView} from '@/shared/hooks/useScreenView';

import {InquiryTypeChips} from '../components/InquiryTypeChips';
import {useInquiryFormData} from '../hooks/useInquiryFormData';

type InquiriesRouteProp = RouteProp<CampusStackParamList, 'Inquiries'>;

export const InquiriesScreen = () => {
  useScreenView();

  const navigation = useNavigation<NativeStackNavigationProp<CampusStackParamList>>();
  const route = useRoute<InquiriesRouteProp>();
  const {
    content,
    data,
    reset,
    selectType,
    setContent,
    setTitle,
    submit,
    submitting,
    title,
  } = useInquiryFormData(route.params?.type);

  const handleSubmit = React.useCallback(async () => {
    try {
      await submit();
      Alert.alert('문의 접수 완료', '문의가 접수되었습니다.', [
        {
          text: '확인',
          onPress: () => {
            reset();
            navigation.goBack();
          },
        },
      ]);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : '문의 접수에 실패했습니다.';
      Alert.alert('알림', message);
    }
  }, [navigation, reset, submit]);

  const handlePressAttachment = React.useCallback(() => {
    Alert.alert('파일 첨부', '파일 첨부는 추후 연결 예정입니다.');
  }, []);

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <StackHeader onPressBack={() => navigation.goBack()} title="문의하기" />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <FormField label="문의 유형" required style={styles.section}>
          <InquiryTypeChips
            items={data.typeOptions}
            onPressItem={selectType}
          />
        </FormField>

        <FormField
          counterLabel={data.titleCountLabel}
          label="제목"
          required
          style={styles.section}>
          <TextInput
            maxLength={data.titleMaxLength}
            onChangeText={setTitle}
            placeholder={data.titlePlaceholder}
            placeholderTextColor={COLORS.text.muted}
            style={styles.input}
            value={title}
          />
        </FormField>

        <FormField
          counterLabel={data.contentCountLabel}
          label="문의 내용"
          required
          style={styles.section}>
          <TextInput
            maxLength={data.contentMaxLength}
            multiline
            onChangeText={setContent}
            placeholder={data.contentPlaceholder}
            placeholderTextColor={COLORS.text.muted}
            style={styles.textArea}
            textAlignVertical="top"
            value={content}
          />
        </FormField>

        <FormField
          label={data.attachmentTitle}
          optionalLabel="(선택)"
          style={styles.section}>
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.88}
            onPress={handlePressAttachment}
            style={styles.attachmentBox}>
            <View style={styles.attachmentIconWrap}>
              <Icon
                color={COLORS.text.secondary}
                name="arrow-up-outline"
                size={18}
              />
            </View>

            <Text style={styles.attachmentTitle}>
              {data.attachmentHelperLines[0]}
            </Text>
            <Text style={styles.attachmentSubtitle}>
              {data.attachmentHelperLines[1]}
            </Text>
          </TouchableOpacity>
        </FormField>

        <InfoBanner
          backgroundColor={COLORS.brand.primaryTint}
          iconColor={COLORS.brand.primary}
          iconName="information-circle-outline"
          lines={data.guideLines}
          style={styles.banner}
          textColor={COLORS.status.success}
        />

        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.9}
          disabled={submitting}
          onPress={handleSubmit}
          style={[
            styles.submitButton,
            submitting ? styles.submitButtonDisabled : undefined,
          ]}>
          <Text style={styles.submitLabel}>
            {submitting ? '문의 접수 중...' : data.submitLabel}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.background.page,
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.border.default,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    color: COLORS.text.primary,
    fontSize: 14,
    height: 47,
    lineHeight: 16,
    paddingHorizontal: 17,
    paddingVertical: 13,
  },
  textArea: {
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.border.default,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    color: COLORS.text.primary,
    fontSize: 14,
    height: 168,
    lineHeight: 18,
    paddingHorizontal: 17,
    paddingVertical: 13,
  },
  attachmentBox: {
    alignItems: 'center',
    backgroundColor: COLORS.background.surface,
    borderColor: '#D1D5DB',
    borderRadius: RADIUS.lg,
    borderStyle: 'dashed',
    borderWidth: 1,
    height: 118,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  attachmentIconWrap: {
    alignItems: 'center',
    backgroundColor: COLORS.background.subtle,
    borderRadius: RADIUS.md,
    height: 36,
    justifyContent: 'center',
    marginBottom: 6,
    width: 36,
  },
  attachmentTitle: {
    color: COLORS.text.tertiary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 2,
  },
  attachmentSubtitle: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  banner: {
    marginBottom: 20,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: COLORS.brand.primary,
    borderRadius: RADIUS.lg,
    height: 52,
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitLabel: {
    color: COLORS.text.inverse,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
});
