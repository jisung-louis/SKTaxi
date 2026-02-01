import React, { useMemo, useState, useEffect } from 'react';
import { Text, StyleSheet, ScrollView, View, TouchableOpacity, TextInput, Alert, TouchableWithoutFeedback, Keyboard, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typhograpy';
import PageHeader from '../../../components/common/PageHeader';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { useScreenView } from '../../../hooks/useScreenView';
import { useAccountInfo } from '../../../hooks/user';

export const AccountModificationScreen = () => {
  useScreenView();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  // Repository 패턴 훅 사용
  const {
    accountInfo,
    hasAccount,
    loading: accountLoading,
    saving: accountSaving,
    deleting: accountDeleting,
    saveAccountInfo,
    deleteAccountInfo,
  } = useAccountInfo();

  const BANKS = useMemo(
    () => [
      '신한','KB국민','카카오','토스뱅크','IBK기업','NH농협','케이뱅크','하나','우리','수협','SC제일','한국씨티',
      '부산은행','대구은행','광주은행','제주은행','전북은행','경남은행','새마을금고','우체국','신협'
    ],
    []
  );

  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [hideName, setHideName] = useState(false);

  const [errors, setErrors] = useState<{holder?: string; bank?: string; number?: string}>({});
  const [open, setOpen] = useState(false);

  // 로컬 상태 별칭 (기존 코드 호환)
  const fetching = accountLoading;
  const saving = accountSaving;
  const deleting = accountDeleting;

  const onlyDigits = (v: string) => v.replace(/[^0-9]/g, '');

  // Repository 패턴: accountInfo가 로드되면 로컬 상태에 반영
  useEffect(() => {
    if (accountInfo) {
      setBankName(accountInfo.bankName);
      setAccountNumber(accountInfo.accountNumber);
      setAccountHolder(accountInfo.accountHolder);
      setHideName(accountInfo.hideName);
    }
  }, [accountInfo]);

  const validate = () => {
    const next: typeof errors = {};
    if (!bankName.trim()) next.bank = '은행을 선택해주세요.';
    if (!accountNumber.trim()) next.number = '계좌번호를 입력해주세요.';
    if (!accountHolder.trim()) next.holder = '예금주를 입력해주세요.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      Alert.alert('알림', '입력값을 확인해주세요.');
      return;
    }
    try {
      // Repository 패턴: saveAccountInfo 훅 사용
      await saveAccountInfo({
        bankName,
        accountNumber: accountNumber.trim(),
        accountHolder: accountHolder.trim(),
        hideName,
      });

      Alert.alert('완료', '계좌 정보가 저장되었어요.', [{ text: '확인', onPress: () => navigation.goBack() }]);
    } catch (e) {
      Alert.alert('오류', '저장 중 오류가 발생했어요.');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      '계좌 정보 삭제',
      '저장된 계좌 정보를 삭제할까요?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              // Repository 패턴: deleteAccountInfo 훅 사용
              await deleteAccountInfo();

              // 로컬 상태 초기화
              setBankName('');
              setAccountNumber('');
              setAccountHolder('');
              setHideName(false);
              setErrors({});

              Alert.alert('완료', '계좌 정보가 삭제되었어요.', [{ text: '확인', onPress: () => navigation.goBack() }]);
            } catch (e) {
              Alert.alert('오류', '삭제 중 오류가 발생했어요.');
            }
          },
        },
      ]
    );
  };
  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false}>
      <SafeAreaView style={styles.container}>
        <PageHeader onBack={() => navigation.goBack()} title="계좌번호 등록/수정" borderBottom />
            <View style={styles.form}>

              <View style={styles.bankInputContainer}>
                <View style={[styles.inputContainer, { flex: 3.3, position: 'relative' }]}>
                  <Text style={styles.label}>은행명</Text>
                  <TouchableOpacity style={[styles.select, (fetching || saving) && { opacity: 0.6 }]} disabled={fetching || saving} onPress={() => setOpen(!open)}>
                    <Text style={styles.selectText}>{fetching ? '...' : (bankName || '은행 선택')}</Text>
                    <Icon name={open ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.text.secondary} />
                  </TouchableOpacity>
                  <View>
                    {open && (
                      <ScrollView style={styles.dropdown}>
                        {BANKS.map((b) => (
                          <TouchableOpacity key={b} style={styles.option} onPress={() => { setBankName(b); setOpen(false); if (errors.bank) setErrors({ ...errors, bank: '' }); }}>
                            <Text style={styles.optionText}>{b}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    )}
                  </View>
                  {errors.bank ? <Text style={styles.errorText}>{errors.bank}</Text> : null}
                </View>

                <View style={[styles.inputContainer, { flex: 6.6 }]}>
                  <Text style={styles.label}>계좌번호</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={fetching ? '불러오는 중...' : saving ? '저장 중...' : '숫자만 입력'}
                    placeholderTextColor={COLORS.text.disabled}
                    value={accountNumber}
                    onChangeText={(v) => { const f = onlyDigits(v); setAccountNumber(f); if (errors.number) setErrors({ ...errors, number: '' }); }}
                    editable={!fetching && !saving}
                    keyboardType="number-pad"
                  />
                  {errors.number ? <Text style={styles.errorText}>{errors.number}</Text> : null}
                </View>
              </View>
              <View style={styles.inputContainer}>
                <View style={styles.labelContainer}>
                  <Text style={styles.label}>이름</Text>
                  <Text style={styles.labelDescription}>예금주명을 입력해주세요</Text>
                </View>
                <View style={styles.nameInputContainer}>
                  <TextInput
                    style={[styles.input, { flex: 1, height: '100%' }]}
                    placeholder={fetching ? '불러오는 중...' : saving ? '저장 중...' : '이름'}
                    placeholderTextColor={COLORS.text.disabled}
                    value={accountHolder}
                    onChangeText={(v) => { setAccountHolder(v); if (errors.holder) setErrors({ ...errors, holder: '' }); }}
                    editable={!fetching && !saving}
                  />
                  <View style={styles.toggleContainer}>
                      <TouchableOpacity style={styles.toggleButton} disabled={fetching || saving} onPress={() => setHideName(prev => !prev)}>
                        <Icon name={hideName ? 'checkbox' : 'square-outline'} size={20} color={hideName ? COLORS.accent.green : COLORS.text.secondary} />
                      <Text style={[styles.toggleButtonText, hideName && { color: COLORS.accent.green }]}>이름 일부만 공개</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
                

              {errors.holder ? <Text style={styles.errorText}>{errors.holder}</Text> : null}

            <TouchableOpacity style={[styles.saveButton, (fetching || saving) && styles.saveButtonDisabled]} disabled={fetching || saving} onPress={handleSave}>
                {saving ? (
                  <View style={styles.saveButtonContent}>
                    <ActivityIndicator size="small" color={COLORS.text.buttonText} style={{ marginRight: 8 }} />
                    <Text style={styles.saveButtonText}>저장 중...</Text>
                  </View>
                ) : (
                  <Text style={styles.saveButtonText}>저장하기</Text>
                )}
              </TouchableOpacity>

              {/* Firestore에 account 필드가 존재할 때만 삭제 버튼 표시 */}
              {hasAccount && (
                <TouchableOpacity 
                  style={[styles.deleteButton, (fetching || saving || deleting) && styles.deleteButtonDisabled]} 
                  disabled={fetching || saving || deleting} 
                  onPress={handleDelete}
                >
                  {deleting ? (
                    <View style={styles.deleteButtonContent}>
                      <ActivityIndicator size="small" color={COLORS.accent.red} style={{ marginRight: 8 }} />
                      <Text style={styles.deleteButtonText}>삭제 중...</Text>
                    </View>
                  ) : (
                    <>
                      <Icon name="trash-outline" size={20} color={COLORS.accent.red} />
                      <Text style={styles.deleteButtonText}>계좌정보 삭제하기</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  form: {
    paddingHorizontal: 16,
    paddingVertical: 32,
    gap: 16,
  },
  bankInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 8,
  },
  nameInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  inputContainer: {
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  labelDescription: {
    ...TYPOGRAPHY.caption2,
    color: COLORS.text.secondary,
  },
  label: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    padding: 14,
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    minHeight: 50,
  },
  select: {
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
  },
  dropdown: {
    position: 'absolute',
    width: '100%',
    top: 4,
    maxHeight: 300,
    zIndex: 20,
    elevation: 20,
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    overflow: 'hidden',
  },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
    backgroundColor: COLORS.background.card,
  },
  optionText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.primary,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 6,
  },
  toggleContainer: {
    gap: 6,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toggleButtonText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
  },
  saveButton: {
    backgroundColor: COLORS.accent.green,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: COLORS.text.buttonText,
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.accent.red,
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: COLORS.accent.red,
    fontSize: 16,
    fontWeight: '600',
  },
});