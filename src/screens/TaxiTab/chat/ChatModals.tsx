import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  TextInput,
  ScrollView,
  Keyboard,
  StyleSheet,
  Image,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typhograpy';
import { WINDOW_WIDTH } from '@gorhom/bottom-sheet';

const BANKS = [
  '신한','KB국민','카카오','토스뱅크','IBK기업','NH농협','케이뱅크','하나','우리','수협','SC제일','한국씨티',
  '부산은행','대구은행','광주은행','제주은행','전북은행','경남은행','새마을금고','우체국','신협'
];

// 계좌 정보 모달
interface AccountModalProps {
  visible: boolean;
  onClose: () => void;
  accountLoading: boolean;
  userAccount: any;
  editingAccountInline: boolean;
  setEditingAccountInline: (value: boolean) => void;
  tempBankName: string;
  setTempBankName: (value: string) => void;
  tempAccountNumber: string;
  setTempAccountNumber: (value: string) => void;
  tempAccountHolder: string;
  setTempAccountHolder: (value: string) => void;
  tempHideName: boolean;
  setTempHideName: (value: boolean) => void;
  rememberAccount: boolean;
  setRememberAccount: (value: boolean) => void;
  showBankDropdown: boolean;
  setShowBankDropdown: (value: boolean) => void;
  onSendAccountInfo: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  visible,
  onClose,
  accountLoading,
  userAccount,
  editingAccountInline,
  setEditingAccountInline,
  tempBankName,
  setTempBankName,
  tempAccountNumber,
  setTempAccountNumber,
  tempAccountHolder,
  setTempAccountHolder,
  tempHideName,
  setTempHideName,
  rememberAccount,
  setRememberAccount,
  showBankDropdown,
  setShowBankDropdown,
  onSendAccountInfo,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.accountModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>계좌 정보</Text>
                <TouchableOpacity onPress={onClose}>
                  <Icon name="close" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                {accountLoading ? (
                  <Text style={styles.loadingText}>계좌 정보를 불러오는 중...</Text>
                ) : (userAccount && !editingAccountInline) ? (
                  <View>
                    <View style={styles.accountInfoItem}>
                      <Text style={styles.accountInfoLabel}>은행명</Text>
                      <Text style={styles.accountInfoValue}>{userAccount.bankName}</Text>
                    </View>
                    <View style={styles.accountInfoItem}>
                      <Text style={styles.accountInfoLabel}>계좌번호</Text>
                      <Text style={styles.accountInfoValue}>{userAccount.accountNumber}</Text>
                    </View>
                    {userAccount.hideName && userAccount.accountHolder && (
                      <View style={styles.accountInfoItem}>
                        <Text style={styles.accountInfoLabel}>예금주</Text>
                        <Text style={styles.accountInfoValue}>{userAccount.accountHolder}</Text>
                      </View>
                    )}

                    <View style={styles.modalButtonContainer}>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.modalEditButton, { flex: 1 }]}
                        onPress={() => {
                          setEditingAccountInline(true);
                          setRememberAccount(true);
                        }}
                      >
                        <Text style={styles.modalEditButtonText}>수정하기</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.modalSendButton, { flex: 1 }]}
                        onPress={onSendAccountInfo}
                      >
                        <Text style={styles.modalSendButtonText}>전송하기</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View>
                    <View style={styles.bankInputContainer}>
                      <View style={[styles.inputGroup, { flex: 3.33 }]}>
                        <Text style={styles.inputLabel}>은행명</Text>
                        <TouchableOpacity
                          style={styles.bankSelectButton}
                          onPress={() => setShowBankDropdown(!showBankDropdown)}
                        >
                          <Text style={[styles.bankSelectText, !tempBankName && { color: COLORS.text.disabled }]}>
                            {tempBankName || '은행 선택'}
                          </Text>
                          <Icon name="chevron-down" size={18} color={COLORS.text.secondary} />
                        </TouchableOpacity>
                        {showBankDropdown && (
                          <ScrollView style={styles.bankDropdown}>
                            {BANKS.map((bank) => (
                              <TouchableOpacity
                                key={bank}
                                style={styles.bankOption}
                                onPress={() => {
                                  setTempBankName(bank);
                                  setShowBankDropdown(false);
                                }}
                              >
                                <Text style={styles.bankOptionText}>{bank}</Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        )}
                      </View>

                      <View style={[styles.inputGroup, { flex: 6.66 }]}>
                        <Text style={styles.inputLabel}>계좌번호</Text>
                        <TextInput
                          style={[styles.textInput, { ...TYPOGRAPHY.body2 }]}
                          value={tempAccountNumber}
                          onChangeText={(text) => setTempAccountNumber((text ?? '').replace(/[^0-9]/g, ''))}
                          placeholder="계좌번호를 입력하세요"
                          placeholderTextColor={COLORS.text.disabled}
                          keyboardType="number-pad"
                        />
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>예금주명 (이름)</Text>
                      <TextInput
                        style={styles.textInput}
                        value={tempAccountHolder}
                        onChangeText={setTempAccountHolder}
                        placeholder="이름을 입력하세요"
                        placeholderTextColor={COLORS.text.disabled}
                      />
                    </View>

                    <TouchableOpacity
                      style={styles.checkboxContainer}
                      onPress={() => setTempHideName(!tempHideName)}
                    >
                      <Icon
                        name={tempHideName ? "checkbox" : "square-outline"}
                        size={20}
                        color={tempHideName ? COLORS.accent.green : COLORS.text.secondary}
                      />
                      <Text style={styles.checkboxText}>이름 일부만 공개</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.checkboxContainer}
                      onPress={() => setRememberAccount(!rememberAccount)}
                    >
                      <Icon
                        name={rememberAccount ? "checkbox" : "square-outline"}
                        size={20}
                        color={rememberAccount ? COLORS.accent.green : COLORS.text.secondary}
                      />
                      <Text style={styles.checkboxText}>계좌 정보를 기억하기</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalSendButton, styles.fullWidthButton]}
                      onPress={onSendAccountInfo}
                    >
                      <Text style={styles.modalSendButtonText}>전송하기</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// 도착 모달
interface ArrivalModalProps {
  visible: boolean;
  onClose: () => void;
  taxiFare: string;
  setTaxiFare: (value: string) => void;
  memberUids: string[];
  selectedMembers: string[];
  displayNameMap: Record<string, string>;
  currentUserId?: string;
  toggleMemberSelection: (memberId: string) => void;
  arrivalBankName: string;
  setArrivalBankName: (value: string) => void;
  arrivalAccountNumber: string;
  setArrivalAccountNumber: (value: string) => void;
  arrivalAccountHolder: string;
  setArrivalAccountHolder: (value: string) => void;
  arrivalHideName: boolean;
  setArrivalHideName: (value: boolean) => void;
  showArrivalBankDropdown: boolean;
  setShowArrivalBankDropdown: (value: boolean) => void;
  rememberArrivalAccount: boolean;
  setRememberArrivalAccount: (value: boolean) => void;
  onSubmit: () => void;
  taxiFareRef?: React.RefObject<TextInput>;
}

export const ArrivalModal: React.FC<ArrivalModalProps> = ({
  visible,
  onClose,
  taxiFare,
  setTaxiFare,
  memberUids,
  selectedMembers,
  displayNameMap,
  currentUserId,
  toggleMemberSelection,
  arrivalBankName,
  setArrivalBankName,
  arrivalAccountNumber,
  setArrivalAccountNumber,
  arrivalAccountHolder,
  setArrivalAccountHolder,
  arrivalHideName,
  setArrivalHideName,
  showArrivalBankDropdown,
  setShowArrivalBankDropdown,
  rememberArrivalAccount,
  setRememberArrivalAccount,
  onSubmit,
  taxiFareRef,
}) => {
  const handleClose = () => {
    setArrivalBankName('');
    setArrivalAccountNumber('');
    setArrivalAccountHolder('');
    setArrivalHideName(false);
    setShowArrivalBankDropdown(false);
    setRememberArrivalAccount(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.accountModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>도착 확정</Text>
                <TouchableOpacity onPress={handleClose}>
                  <Icon name="close" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.rowContainer}>
                  <View style={[styles.inputGroup, { flex: 3.33 }]}>
                    <Text style={styles.inputLabel}>택시비 (원)</Text>
                    <TextInput
                      ref={taxiFareRef}
                      style={styles.textInput}
                      value={taxiFare}
                      onChangeText={(text) => setTaxiFare((text ?? '').replace(/[^0-9]/g, ''))}
                      placeholder="택시비"
                      placeholderTextColor={COLORS.text.disabled}
                      keyboardType="number-pad"
                    />
                  </View>
                  <View style={{ flex: 0.66 }} />

                  <View style={[styles.inputGroup, { flex: 6 }]}>
                    <Text style={styles.inputLabel}>N빵할 사람</Text>
                    <View style={styles.memberSelectionContainer}>
                      {memberUids.map((uid) => {
                        const displayName = displayNameMap[uid] || '익명';
                        const isSelected = selectedMembers.includes(uid);
                        const isMe = uid === currentUserId;

                        return (
                          <TouchableOpacity
                            key={uid}
                            style={[styles.memberSelectionItem, isSelected && styles.memberSelectionItemSelected]}
                            onPress={() => toggleMemberSelection(uid)}
                          >
                            <Icon
                              name={isSelected ? "checkbox" : "square-outline"}
                              size={16}
                              color={isSelected ? COLORS.accent.green : COLORS.text.secondary}
                            />
                            <Text style={[styles.memberSelectionText, isSelected && styles.memberSelectionTextSelected]}>
                              {displayName} {isMe && '(나)'}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>

                <View style={styles.bankInputContainer}>
                  <View style={[styles.inputGroup, { flex: 3.33 }]}>
                    <Text style={styles.inputLabel}>은행명</Text>
                    <TouchableOpacity
                      style={styles.bankSelectButton}
                      onPress={() => setShowArrivalBankDropdown(!showArrivalBankDropdown)}
                    >
                      <Text style={[styles.bankSelectText, !arrivalBankName && { color: COLORS.text.disabled }]}>
                        {arrivalBankName || '은행 선택'}
                      </Text>
                      <Icon name="chevron-down" size={18} color={COLORS.text.secondary} />
                    </TouchableOpacity>
                    {showArrivalBankDropdown && (
                      <ScrollView style={styles.bankDropdown}>
                        {BANKS.map((bank) => (
                          <TouchableOpacity
                            key={bank}
                            style={styles.bankOption}
                            onPress={() => {
                              setArrivalBankName(bank);
                              setShowArrivalBankDropdown(false);
                            }}
                          >
                            <Text style={styles.bankOptionText}>{bank}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    )}
                  </View>

                  <View style={[styles.inputGroup, { flex: 6.66 }]}>
                    <Text style={styles.inputLabel}>계좌번호</Text>
                    <TextInput
                      style={styles.textInput}
                      value={arrivalAccountNumber}
                      onChangeText={(text) => setArrivalAccountNumber((text ?? '').replace(/[^0-9]/g, ''))}
                      placeholder="계좌번호를 입력하세요"
                      placeholderTextColor={COLORS.text.disabled}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>예금주명 (이름)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={arrivalAccountHolder}
                    onChangeText={setArrivalAccountHolder}
                    placeholder="이름을 입력하세요"
                    placeholderTextColor={COLORS.text.disabled}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.checkboxContainer, { marginTop: 8 }]}
                  onPress={() => setArrivalHideName(!arrivalHideName)}
                >
                  <Icon
                    name={arrivalHideName ? "checkbox" : "square-outline"}
                    size={20}
                    color={arrivalHideName ? COLORS.accent.green : COLORS.text.secondary}
                  />
                  <Text style={styles.checkboxText}>이름 일부만 공개</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setRememberArrivalAccount(!rememberArrivalAccount)}
                >
                  <Icon
                    name={rememberArrivalAccount ? "checkbox" : "square-outline"}
                    size={20}
                    color={rememberArrivalAccount ? COLORS.accent.green : COLORS.text.secondary}
                  />
                  <Text style={styles.checkboxText}>계좌 정보를 기억하기</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.modalSendButton, styles.fullWidthButton]}
                  onPress={onSubmit}
                >
                  <Text style={styles.modalSendButtonText}>도착 확정</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// 정산 현황 모달
interface SettlementModalProps {
  visible: boolean;
  onClose: () => void;
  settlementStatus: { [key: string]: boolean };
  displayNameMap: Record<string, string>;
  currentUserId?: string;
  leaderId?: string;
  perPersonAmount: number;
  onSettlementComplete: (memberId: string, memberName: string) => void;
}

export const SettlementModal: React.FC<SettlementModalProps> = ({
  visible,
  onClose,
  settlementStatus,
  displayNameMap,
  currentUserId,
  leaderId,
  perPersonAmount,
  onSettlementComplete,
}) => {
  const sortedMemberIds = Object.keys(settlementStatus).sort((a, b) => {
    const aIsLeader = a === leaderId;
    const bIsLeader = b === leaderId;

    if (aIsLeader && !bIsLeader) return -1;
    if (!aIsLeader && bIsLeader) return 1;

    const aName = displayNameMap[a] || '익명';
    const bName = displayNameMap[b] || '익명';
    return aName.localeCompare(bName);
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.settlementModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>정산 현황 업데이트</Text>
                <TouchableOpacity onPress={onClose}>
                  <Icon name="close" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={[styles.modalBody, { paddingTop: 0 }]}>
                {sortedMemberIds.map((memberId) => {
                  const displayName = displayNameMap[memberId] || '익명';
                  const isSettled = settlementStatus[memberId];
                  const isMe = memberId === currentUserId;
                  const isLeader = memberId === leaderId;

                  return (
                    <View key={memberId} style={styles.settlementModalItem}>
                      <View style={styles.settlementModalItemLeft}>
                        <Text style={styles.settlementModalName}>
                          {displayName}{isMe && ' (나)'}
                        </Text>
                        <Text style={styles.settlementAmount}>{perPersonAmount.toLocaleString()}원</Text>
                        <Text style={[styles.settlementModalStatus, isSettled && styles.settlementModalStatusCompleted]}>
                          {isLeader ? '정산자' : (isSettled ? '정산 완료' : '정산 중...')}
                        </Text>
                      </View>
                      {!isSettled && !isLeader && (
                        <TouchableOpacity
                          style={styles.settlementCompleteButton}
                          onPress={() => onSettlementComplete(memberId, displayName)}
                        >
                          <Text style={styles.settlementCompleteButtonText}>정산완료</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// 택시 앱 모달
const taxiApps = [
  {
    id: 'kakaot',
    name: '카카오 T',
    scheme: (party: any) => {
      const lat = party?.destination?.lat;
      const lng = party?.destination?.lng;
      const name = party?.destination?.name;
      if (lat && lng) {
        let url = `kakaot://taxi?&dest_lat=${lat}&dest_lng=${lng}`;
        if (name) url += `&dest_name=${encodeURIComponent(name)}`;
        return url;
      }
      return 'kakaot://taxi';
    },
    iosStore: 'https://apps.apple.com/app/id981110422',
    androidStore: 'market://details?id=com.kakao.taxi',
    icon: require('../../../../assets/images/kakaot_icon.png'),
  },
  {
    id: 'tmoneygo',
    name: '티머니 GO',
    scheme: () => 'tmoneygo://',
    iosStore: 'https://apps.apple.com/app/id1483433931',
    androidStore: 'market://details?id=com.tmoney.tmoneygo',
    icon: require('../../../../assets/images/tmoneygo_icon.png'),
  },
  {
    id: 'uber',
    name: 'Uber',
    scheme: () => 'uber://',
    iosStore: 'https://apps.apple.com/app/id368677368',
    androidStore: 'market://details?id=com.ubercab',
    icon: require('../../../../assets/images/uber_icon.png'),
  },
] as const;

interface TaxiAppModalProps {
  visible: boolean;
  onClose: () => void;
  currentParty: any;
}

export const TaxiAppModal: React.FC<TaxiAppModalProps> = ({
  visible,
  onClose,
  currentParty,
}) => {
  const openExternalApp = async (
    urlBuilder: (party?: any) => string,
    iosStore: string,
    androidStore: string
  ) => {
    const scheme = urlBuilder(currentParty);
    try {
      const canOpen = await Linking.canOpenURL(scheme);
      if (canOpen) {
        await Linking.openURL(scheme);
      } else {
        const storeUrl = Platform.OS === 'ios' ? iosStore : androidStore;
        await Linking.openURL(storeUrl);
      }
    } catch (e) {
      const storeUrl = Platform.OS === 'ios' ? iosStore : androidStore;
      Alert.alert('안내', '앱을 열 수 없어요. 스토어로 이동합니다.');
      Linking.openURL(storeUrl).catch(() => {});
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.taxiModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>택시 앱으로 이동</Text>
                <TouchableOpacity onPress={onClose}>
                  <Icon name="close" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
              </View>
              <View style={styles.modalBody}>
                <Text style={styles.taxiAppHint}>원하는 앱을 선택하면 해당 앱으로 이동해요</Text>
                <View style={styles.taxiAppGrid}>
                  {taxiApps.map(app => (
                    <TouchableOpacity
                      key={app.id}
                      style={styles.taxiAppItem}
                      onPress={() =>
                        openExternalApp(app.scheme, app.iosStore, app.androidStore)
                      }
                      accessibilityLabel={`${app.name} 열기`}
                    >
                      <View style={styles.taxiAppIconContainer}>
                        <Image source={app.icon} style={styles.taxiAppIcon} />
                      </View>
                      <Text style={styles.taxiAppName}>{app.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={[styles.modalButton, styles.fullWidthButton, styles.modalEditButton]} onPress={onClose}>
                  <Text style={styles.modalEditButtonText}>취소</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountModalContent: {
    backgroundColor: COLORS.background.card,
    borderRadius: 16,
    margin: 20,
    width: WINDOW_WIDTH - 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  modalTitle: {
    ...TYPOGRAPHY.title3,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  modalBody: {
    padding: 16,
  },
  loadingText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  accountInfoItem: {
    marginBottom: 12,
  },
  accountInfoLabel: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  accountInfoValue: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalEditButton: {
    backgroundColor: COLORS.background.surface,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  modalEditButtonText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  modalSendButton: {
    backgroundColor: COLORS.accent.green,
  },
  modalSendButtonText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.buttonText,
    fontWeight: '600',
  },
  fullWidthButton: {
    marginTop: 16,
  },
  bankInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: COLORS.background.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  bankSelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  bankSelectText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
  },
  bankDropdown: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    maxHeight: 150,
    backgroundColor: COLORS.background.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    zIndex: 1000,
  },
  bankOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  bankOptionText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  checkboxText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  memberSelectionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  memberSelectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: COLORS.background.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  memberSelectionItemSelected: {
    borderColor: COLORS.accent.green,
    backgroundColor: COLORS.accent.green + '10',
  },
  memberSelectionText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
  },
  memberSelectionTextSelected: {
    color: COLORS.accent.green,
    fontWeight: '600',
  },
  settlementModalContent: {
    backgroundColor: COLORS.background.card,
    borderRadius: 16,
    margin: 20,
    maxHeight: '50%',
    width: WINDOW_WIDTH - 80,
  },
  settlementModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.dark,
  },
  settlementModalItemLeft: {
    flex: 1,
  },
  settlementModalName: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  settlementAmount: {
    ...TYPOGRAPHY.body1,
    color: COLORS.accent.green + '90',
    fontWeight: '700',
    marginBottom: 4,
  },
  settlementModalStatus: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
  },
  settlementModalStatusCompleted: {
    color: COLORS.accent.green,
    fontWeight: '600',
  },
  settlementCompleteButton: {
    backgroundColor: COLORS.accent.green,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  settlementCompleteButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.background.primary,
    fontWeight: '600',
  },
  taxiModalContent: {
    backgroundColor: COLORS.background.card,
    borderRadius: 16,
    margin: 20,
    width: WINDOW_WIDTH - 40,
  },
  taxiAppHint: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  taxiAppGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  taxiAppItem: {
    alignItems: 'center',
    gap: 8,
  },
  taxiAppIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.background.surface,
  },
  taxiAppIcon: {
    width: '100%',
    height: '100%',
  },
  taxiAppName: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
});
