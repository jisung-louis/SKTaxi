import React from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import {type CampusStackParamList} from '@/app/navigation/types';
import {
  V2FormField,
  V2InfoBanner,
  V2StackHeader,
  V2StateCard,
  V2ToggleSwitch,
} from '@/shared/design-system/components';
import {
  V2_COLORS,
  V2_RADIUS,
  V2_SPACING,
} from '@/shared/design-system/tokens';
import {useScreenView} from '@/shared/hooks/useScreenView';

import {AccountBankDropdown} from '../components/v2/AccountBankDropdown';
import {useAccountManagementData} from '../hooks/useAccountManagementData';

export const AccountModificationScreen = () => {
  useScreenView();

  const navigation = useNavigation<NativeStackNavigationProp<CampusStackParamList>>();
  const {
    data,
    error,
    loading,
    reload,
    save,
    saving,
    selectBank,
    setAccountHolder,
    setAccountNumber,
    setBankDropdownOpen,
    setHideName,
  } = useAccountManagementData();

  const handleSave = React.useCallback(async () => {
    try {
      await save();
      Alert.alert('저장 완료', '계좌 정보가 저장되었습니다.', [
        {
          text: '확인',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : '계좌 정보를 저장하지 못했습니다.';
      Alert.alert('오류', message);
    }
  }, [navigation, save]);

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <V2StackHeader onPressBack={() => navigation.goBack()} title="계좌 관리" />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {loading ? (
          <V2StateCard
            description="계좌 관리 정보를 준비하고 있습니다."
            icon={<ActivityIndicator color={V2_COLORS.brand.primary} />}
            title="계좌 관리 정보를 불러오는 중"
          />
        ) : null}

        {!loading && error ? (
          <V2StateCard
            actionLabel="다시 시도"
            description={error}
            icon={
              <Icon
                color={V2_COLORS.accent.orange}
                name="alert-circle-outline"
                size={28}
              />
            }
            onPressAction={() => {
              reload().catch(() => undefined);
            }}
            title="계좌 관리 정보를 불러오지 못했습니다"
          />
        ) : null}

        {!loading && !error ? (
          <>
            <V2InfoBanner
              backgroundColor={V2_COLORS.accent.blueSoft}
              iconColor={V2_COLORS.accent.blue}
              iconName="information-circle-outline"
              lines={data.infoLines}
              style={styles.banner}
              textColor={V2_COLORS.accent.blue}
            />

            <View style={styles.formSection}>
              <V2FormField
                label="은행명"
                style={[
                  styles.fieldBlock,
                  data.isBankDropdownOpen ? styles.bankFieldRaised : undefined,
                ]}>
                <AccountBankDropdown
                  bankNames={data.bankNames}
                  isOpen={data.isBankDropdownOpen}
                  onPressSelect={selectBank}
                  onPressTrigger={() =>
                    setBankDropdownOpen(!data.isBankDropdownOpen)
                  }
                  selectedBankName={data.selectedBankName}
                />
              </V2FormField>

              <V2FormField label="계좌번호" style={styles.fieldBlock}>
                <TextInput
                  keyboardType="number-pad"
                  onChangeText={setAccountNumber}
                  onFocus={() => setBankDropdownOpen(false)}
                  placeholder="'-' 없이 숫자만 입력"
                  placeholderTextColor={V2_COLORS.text.muted}
                  style={styles.input}
                  value={data.accountNumber}
                />
              </V2FormField>

              <V2FormField label="예금주명" style={styles.fieldBlock}>
                <TextInput
                  onChangeText={setAccountHolder}
                  onFocus={() => setBankDropdownOpen(false)}
                  placeholder="예금주 이름 입력"
                  placeholderTextColor={V2_COLORS.text.muted}
                  style={styles.input}
                  value={data.accountHolder}
                />
              </V2FormField>
            </View>

            <View style={styles.hideNameCard}>
              <View style={styles.hideNameTextGroup}>
                <Text style={styles.hideNameTitle}>이름 일부만 공개</Text>
                <Text style={styles.hideNameSubtitle}>
                  파티원에게 이름 일부만 표시됩니다
                </Text>
              </View>

              <V2ToggleSwitch
                accessibilityLabel="이름 일부만 공개"
                onValueChange={setHideName}
                value={data.hideName}
              />
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.9}
              disabled={!data.isSaveEnabled || saving}
              onPress={handleSave}
              style={[
                styles.saveButton,
                data.isSaveEnabled ? styles.saveButtonEnabled : undefined,
              ]}>
              {saving ? (
                <ActivityIndicator
                  color={
                    data.isSaveEnabled
                      ? V2_COLORS.text.inverse
                      : V2_COLORS.text.muted
                  }
                  size="small"
                  style={styles.buttonSpinner}
                />
              ) : null}
              <Text
                style={[
                  styles.saveButtonLabel,
                  data.isSaveEnabled ? styles.saveButtonLabelEnabled : undefined,
                ]}>
                저장하기
              </Text>
            </TouchableOpacity>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: V2_COLORS.background.page,
    flex: 1,
  },
  content: {
    paddingHorizontal: V2_SPACING.lg,
    paddingTop: 20,
    paddingBottom: 40,
  },
  banner: {
    marginBottom: 24,
  },
  formSection: {
    zIndex: 1,
  },
  fieldBlock: {
    marginBottom: 20,
  },
  bankFieldRaised: {
    zIndex: 20,
  },
  input: {
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.border.default,
    borderRadius: V2_RADIUS.lg,
    borderWidth: 1,
    color: V2_COLORS.text.primary,
    fontSize: 14,
    height: 50,
    lineHeight: 20,
    paddingHorizontal: 17,
    paddingVertical: 15,
  },
  hideNameCard: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.border.default,
    borderRadius: V2_RADIUS.lg,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    minHeight: 72,
    paddingHorizontal: 17,
    paddingVertical: 17,
  },
  hideNameTextGroup: {
    flex: 1,
    marginRight: 12,
  },
  hideNameTitle: {
    color: V2_COLORS.text.primary,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  hideNameSubtitle: {
    color: V2_COLORS.text.tertiary,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.subtle,
    borderRadius: V2_RADIUS.lg,
    flexDirection: 'row',
    height: 52,
    justifyContent: 'center',
    marginTop: 32,
  },
  saveButtonEnabled: {
    backgroundColor: V2_COLORS.brand.primary,
  },
  saveButtonLabel: {
    color: V2_COLORS.text.muted,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  saveButtonLabelEnabled: {
    color: V2_COLORS.text.inverse,
  },
  buttonSpinner: {
    marginRight: 8,
  },
});
