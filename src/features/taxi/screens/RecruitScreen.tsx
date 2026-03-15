import React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Animated from 'react-native-reanimated';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
} from '@/shared/design-system/tokens';
import {useScreenEnterAnimation, useScreenView} from '@/shared/hooks';

import {TaxiCreateLocationSection} from '../components/v2/TaxiCreateLocationSection';
import {TaxiCreateTagSection} from '../components/v2/TaxiCreateTagSection';
import {TaxiCreateTimePicker} from '../components/v2/TaxiCreateTimePicker';
import {useTaxiRecruitForm} from '../hooks/useTaxiRecruitForm';
import type {TaxiStackParamList} from '../model/navigation';

type RecruitScreenNavigationProp = NativeStackNavigationProp<
  TaxiStackParamList,
  'Recruit'
>;

const DETAIL_MAX_LENGTH = 300;

export const RecruitScreen = () => {
  useScreenView();

  const navigation = useNavigation<RecruitScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const screenAnimatedStyle = useScreenEnterAnimation();
  const {
    addCustomTag,
    canSubmit,
    customTagInput,
    departure,
    departureTime,
    detail,
    destination,
    isSubmitting,
    maxMemberOptions,
    maxMembers,
    removeTag,
    selectDepartureCustom,
    selectDeparturePreset,
    selectDestinationCustom,
    selectDestinationPreset,
    selectHour,
    selectMaxMembers,
    selectMinute,
    selectedTags,
    setCustomDepartureValue,
    setCustomDestinationValue,
    setCustomTagInput,
    setDetail,
    submitForm,
    tagOptions,
    togglePresetTag,
  } = useTaxiRecruitForm();

  const handleSubmit = React.useCallback(async () => {
    const result = await submitForm();

    Alert.alert('파티 만들기', result.message);
  }, [submitForm]);

  const footerPaddingBottom = insets.bottom + 12;
  const scrollBottomPadding = footerPaddingBottom + 112;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <Animated.View style={[styles.flex, screenAnimatedStyle]}>
          <View style={styles.header}>
            <TouchableOpacity
              accessibilityLabel="뒤로 가기"
              accessibilityRole="button"
              activeOpacity={0.84}
              onPress={navigation.goBack}
              style={styles.headerButton}>
              <Icon
                color={V2_COLORS.text.primary}
                name="arrow-back"
                size={22}
              />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>파티 만들기</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              {paddingBottom: scrollBottomPadding},
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <TaxiCreateLocationSection
              customPlaceholder="출발지를 직접 입력하세요"
              customValue={departure.customValue}
              disabledLabel={departure.disabledLabel}
              mode={departure.mode}
              options={departure.options}
              selectedLabel={departure.selectedLabel}
              title="출발지"
              onChangeCustomValue={setCustomDepartureValue}
              onPressCustom={selectDepartureCustom}
              onPressPreset={selectDeparturePreset}
            />

            <TaxiCreateLocationSection
              customPlaceholder="도착지를 직접 입력하세요"
              customValue={destination.customValue}
              disabledLabel={destination.disabledLabel}
              mode={destination.mode}
              options={destination.options}
              selectedLabel={destination.selectedLabel}
              title="도착지"
              onChangeCustomValue={setCustomDestinationValue}
              onPressCustom={selectDestinationCustom}
              onPressPreset={selectDestinationPreset}
            />

            <TaxiCreateTimePicker
              hour={departureTime.hour}
              minute={departureTime.minute}
              summaryLabel={departureTime.summaryLabel}
              summaryTone={departureTime.summaryTone}
              onChangeHour={selectHour}
              onChangeMinute={selectMinute}
            />

            <View style={styles.card}>
              <Text style={styles.memberTitle}>
                최대 인원{' '}
                <Text style={styles.memberCount}>{`${maxMembers}명`}</Text>{' '}
                <Text style={styles.memberCaption}>(본인 포함)</Text>
              </Text>

              <View style={styles.memberOptions}>
                {maxMemberOptions.map(option => {
                  const isSelected = option === maxMembers;

                  return (
                    <TouchableOpacity
                      accessibilityRole="button"
                      activeOpacity={0.84}
                      key={option}
                      onPress={() => selectMaxMembers(option)}
                      style={[
                        styles.memberButton,
                        isSelected && styles.memberButtonSelected,
                      ]}>
                      <Text
                        style={[
                          styles.memberButtonLabel,
                          isSelected && styles.memberButtonLabelSelected,
                        ]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <TaxiCreateTagSection
              customTagInput={customTagInput}
              selectedTags={selectedTags}
              tagOptions={tagOptions}
              onAddCustomTag={addCustomTag}
              onChangeCustomTagInput={setCustomTagInput}
              onRemoveTag={removeTag}
              onTogglePresetTag={togglePresetTag}
            />

            <View style={styles.card}>
              <Text style={styles.title}>상세 내용</Text>
              <TextInput
                maxLength={DETAIL_MAX_LENGTH}
                multiline
                placeholder="파티에 대한 추가 정보를 입력하세요. (예: 짐이 많아요, 여성분만 탑승 가능해요 등)"
                placeholderTextColor={V2_COLORS.text.muted}
                selectionColor={V2_COLORS.brand.primary}
                style={styles.detailInput}
                textAlignVertical="top"
                value={detail}
                onChangeText={setDetail}
              />
              <Text style={styles.detailCounter}>
                {`${detail.length}/${DETAIL_MAX_LENGTH}`}
              </Text>
            </View>
          </ScrollView>

          <View style={[styles.footer, {paddingBottom: footerPaddingBottom}]}>
            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={canSubmit && !isSubmitting ? 0.9 : 1}
              disabled={!canSubmit || isSubmitting}
              onPress={handleSubmit}
              style={[
                styles.submitButton,
                (!canSubmit || isSubmitting) && styles.submitButtonDisabled,
              ]}>
              <Icon
                color={
                  canSubmit && !isSubmitting
                    ? V2_COLORS.text.inverse
                    : '#98A2B3'
                }
                name="car-sport-outline"
                size={22}
              />
              <Text
                style={[
                  styles.submitButtonLabel,
                  (!canSubmit || isSubmitting) &&
                    styles.submitButtonLabelDisabled,
                ]}>
                {isSubmitting ? '준비 중...' : '택시파티 모집 시작'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: V2_COLORS.background.page,
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.page,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: V2_SPACING.lg,
    paddingVertical: V2_SPACING.md,
  },
  headerButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  headerTitle: {
    color: V2_COLORS.text.primary,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
  },
  headerSpacer: {
    width: 36,
  },
  scrollContent: {
    gap: V2_SPACING.lg,
    paddingHorizontal: V2_SPACING.lg,
    paddingTop: V2_SPACING.sm,
  },
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
    marginBottom: V2_SPACING.md,
  },
  memberTitle: {
    color: V2_COLORS.text.primary,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: V2_SPACING.md,
  },
  memberCount: {
    color: V2_COLORS.brand.primaryStrong,
  },
  memberCaption: {
    color: V2_COLORS.text.muted,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  memberOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: V2_SPACING.sm,
  },
  memberButton: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.border.default,
    borderRadius: V2_RADIUS.md,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    minWidth: 48,
    paddingHorizontal: 18,
  },
  memberButtonSelected: {
    backgroundColor: V2_COLORS.brand.primary,
    borderColor: V2_COLORS.brand.primary,
  },
  memberButtonLabel: {
    color: V2_COLORS.text.secondary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  memberButtonLabelSelected: {
    color: V2_COLORS.text.inverse,
  },
  detailInput: {
    backgroundColor: V2_COLORS.background.subtle,
    borderColor: V2_COLORS.border.default,
    borderRadius: V2_RADIUS.md,
    borderWidth: 1,
    color: V2_COLORS.text.primary,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 148,
    paddingHorizontal: V2_SPACING.md,
    paddingVertical: V2_SPACING.md,
  },
  detailCounter: {
    alignSelf: 'flex-end',
    color: V2_COLORS.text.muted,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    marginTop: V2_SPACING.sm,
  },
  footer: {
    backgroundColor: V2_COLORS.background.surface,
    borderTopColor: V2_COLORS.border.subtle,
    borderTopWidth: 1,
    paddingHorizontal: V2_SPACING.lg,
    paddingTop: V2_SPACING.md,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.brand.primary,
    borderRadius: V2_RADIUS.md,
    flexDirection: 'row',
    gap: V2_SPACING.sm,
    height: 60,
    justifyContent: 'center',
    ...V2_SHADOWS.floating,
  },
  submitButtonDisabled: {
    backgroundColor: '#F2F4F7',
    shadowOpacity: 0,
  },
  submitButtonLabel: {
    color: V2_COLORS.text.inverse,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
  },
  submitButtonLabelDisabled: {
    color: '#98A2B3',
  },
});
