import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import { MainTabParamList } from '../../navigations/types';
import { useAuth } from '../../hooks/auth';
import { registerMinecraftAccount, deleteMinecraftAccount } from '../../lib/minecraft/registerAccount';
import { MinecraftAccountEntry, MinecraftEdition } from '../../types/minecraft';
import Button from '../common/Button';

export const MinecraftSection: React.FC = () => {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const { user } = useAuth();
  const [mcNickname, setMcNickname] = useState('');
  const [mcEdition, setMcEdition] = useState<MinecraftEdition>('JE');
  const [registeringMc, setRegisteringMc] = useState(false);
  const [mcError, setMcError] = useState<string | null>(null);

  const minecraftAccounts: MinecraftAccountEntry[] = Array.isArray((user as any)?.minecraftAccount?.accounts)
    ? ((user as any).minecraftAccount.accounts as MinecraftAccountEntry[])
    : [];
  const isWhitelistRegistered = minecraftAccounts.length > 0;

  const formatDate = (value?: number) => {
    if (!value) return '-';
    try {
      const date = new Date(value);
      return date.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
    } catch {
      return '-';
    }
  };

  const handleRegisterMinecraft = async () => {
    if (!user?.uid) {
      Alert.alert('로그인 필요', '화이트리스트를 등록하려면 로그인이 필요해요.');
      return;
    }
    if (!mcNickname.trim()) {
      Alert.alert('알림', '닉네임을 입력해주세요.');
      return;
    }
    setRegisteringMc(true);
    setMcError(null);
    try {
      await registerMinecraftAccount({
        uid: user.uid,
        nickname: mcNickname.trim(),
        edition: mcEdition,
      });
      setMcNickname('');
      Alert.alert('등록 완료', '화이트리스트에 등록이 완료되었어요.');
    } catch (error: any) {
      const message = error?.message || '등록 중 오류가 발생했습니다.';
      setMcError(message);
      Alert.alert('오류', message);
    } finally {
      setRegisteringMc(false);
    }
  };

  const handleDeleteAccount = async (account: MinecraftAccountEntry) => {
    if (!user?.uid) {
      Alert.alert('로그인 필요', '계정을 삭제하려면 로그인이 필요해요.');
      return;
    }

    const isParentAccount = !account.whoseFriend;
    const hasFriendAccounts = minecraftAccounts.some((acc) => !!acc.whoseFriend);
    if (isParentAccount && hasFriendAccounts) {
      Alert.alert(
        '삭제할 수 없어요',
        '이 계정에는 친구 계정이 연결되어 있어요.\n내 마인크래프트 계정을 삭제하려면 먼저 친구 계정들을 삭제해주세요.'
      );
      return;
    }

    Alert.alert(
      '계정 삭제',
      `${account.nickname} 계정을 화이트리스트에서 삭제하시겠어요?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMinecraftAccount({ uid: user.uid, uuid: account.uuid });
              Alert.alert('삭제 완료', '계정이 화이트리스트에서 제거되었어요.');
            } catch (error: any) {
              Alert.alert('오류', error?.message || '계정 삭제 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Icon name="game-controller" size={20} color={COLORS.accent.orange} />
          <Text style={styles.sectionTitle}>마인크래프트 계정 등록</Text>
        </View>
        <TouchableOpacity
          style={styles.sectionActionButton}
          onPress={() => navigation.navigate('홈', { screen: 'MinecraftDetail' })}
        >
          <Text style={styles.sectionAction}>자세히</Text>
          <Icon name="chevron-forward" size={16} color={COLORS.accent.green} />
        </TouchableOpacity>
      </View>

      {isWhitelistRegistered ? (
        <View style={styles.minecraftRegisteredCard}>
          {minecraftAccounts.map((account) => {
            const avatarUrl = account.uuid && !account.uuid.startsWith('be:') ? account.uuid : '8667ba71b85a4004af54457a9734eed7';
            return (
              <View key={account.uuid} style={styles.minecraftAccountRow}>
                <Image
                  source={{ uri: `https://minotar.net/avatar/${avatarUrl}/48` }}
                  style={styles.minecraftAccountAvatar}
                />
                <View style={{ flex: 1 }}>
                  <View style={styles.minecraftAccountHeader}>
                    <Text style={styles.minecraftAccountName}>{account.nickname}</Text>
                    {account.whoseFriend && (
                      <View style={[styles.minecraftAccountTypeBadge, styles.minecraftAccountTypeBadgeFriend]}>
                        <Text style={[styles.minecraftAccountTypeText, styles.minecraftAccountTypeTextFriend]}>
                          친구 계정
                        </Text>
                      </View>
                    )}
                    {!account.whoseFriend && (
                      <View style={styles.minecraftAccountTypeBadge}>
                        <Text style={styles.minecraftAccountTypeText}>
                          내 계정
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.minecraftAccountMeta}>
                    {account.edition} · {formatDate(account.linkedAt)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.minecraftDeleteButton}
                  onPress={() => handleDeleteAccount(account)}
                >
                  <Icon name="trash-outline" size={18} color={COLORS.accent.red} />
                </TouchableOpacity>
              </View>
            );
          })}
          <Text style={styles.minecraftInfoTextSmall}>
            화이트리스트에 등록된 계정입니다. {'\n'}{minecraftAccounts.length < 4 ? '다른 계정을 추가하려면 아래에서 등록할 수 있어요.\n(최대 4개: 내 계정 1개 + 친구 계정 3개)' : '최대 4개의 계정을 등록할 수 있습니다.\n(내 계정 1개 + 친구 계정 3개)'}
          </Text>
        </View>
      ) : (
        <View style={styles.minecraftRegisteredCard}>
          <Text style={styles.minecraftInfoText}>
            아직 마크 계정이 등록되지 않았어요.{'\n'}마크 닉네임을 등록하면 서버에 접속할 수 있어요.
          </Text>
        </View>
      )}

      {minecraftAccounts.length < 4 && (
        <View style={styles.minecraftForm}>
          {minecraftAccounts.length === 0 ? (
            <Text style={styles.minecraftHelperText}>
              먼저 본인의 마인크래프트 계정을 등록해주세요. {'\n'}이후 친구 계정을 최대 3개까지 추가할 수 있어요.
            </Text>
          ) : (
            <Text style={styles.minecraftHelperText}>
              친구 계정을 추가할 수 있어요. (남은 슬롯: {4 - minecraftAccounts.length}개)
            </Text>
          )}
          <Text style={styles.minecraftInputLabel}>마인크래프트 닉네임</Text>
          <TextInput
            style={styles.minecraftInput}
            placeholder="예: Yangdding (BE는 대소문자 구분)"
            placeholderTextColor={COLORS.text.disabled}
            value={mcNickname}
            onChangeText={setMcNickname}
            autoCapitalize="none"
          />
          <Text style={styles.minecraftInputLabel}>플랫폼</Text>
          <View style={styles.editionToggleContainer}>
            {(['JE', 'BE'] as MinecraftEdition[]).map((edition) => {
              const selected = mcEdition === edition;
              return (
                <TouchableOpacity
                  key={edition}
                  style={[styles.editionChip, selected && styles.editionChipSelected]}
                  onPress={() => setMcEdition(edition)}
                >
                  <Text style={[styles.editionChipText, selected && styles.editionChipTextSelected]}>
                    {edition === 'JE' ? 'Java Edition' : 'Bedrock Edition'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {mcError ? <Text style={styles.minecraftErrorText}>{mcError}</Text> : null}
          <Button
            title="등록하기"
            onPress={handleRegisterMinecraft}
            loading={registeringMc}
            disabled={!mcNickname.trim()}
            style={{ marginTop: 24 }}
          />
        </View>
      )}

      {minecraftAccounts.length >= 4 && (
        <Text style={styles.minecraftLimitText}>
          최대 4개의 계정을 등록할 수 있습니다 (내 계정 1개 + 친구 계정 3개). 기존 계정을 삭제하면 새로운 계정을 등록할 수 있어요.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    ...TYPOGRAPHY.title2,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  sectionActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionAction: {
    ...TYPOGRAPHY.body2,
    color: COLORS.accent.green,
    fontWeight: '600',
  },
  minecraftRegisteredCard: {
    backgroundColor: COLORS.background.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    gap: 12,
  },
  minecraftInfoText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
  },
  minecraftInfoTextSmall: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    lineHeight: 16,
  },
  minecraftForm: {
    backgroundColor: COLORS.background.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    marginTop: 12,
  },
  minecraftInputLabel: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    marginTop: 12,
    marginBottom: 6,
  },
  minecraftInput: {
    backgroundColor: COLORS.background.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: COLORS.text.primary,
  },
  editionToggleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  editionChip: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    paddingVertical: 10,
    alignItems: 'center',
  },
  editionChipSelected: {
    borderColor: COLORS.accent.green,
    backgroundColor: COLORS.accent.green + '20',
  },
  editionChipText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  editionChipTextSelected: {
    color: COLORS.accent.green,
  },
  minecraftHelperText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  minecraftErrorText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.accent.red,
    marginTop: 8,
  },
  minecraftLimitText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginTop: 8,
  },
  minecraftAccountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
    paddingBottom: 12,
    marginBottom: 12,
  },
  minecraftAccountAvatar: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  minecraftAccountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  minecraftAccountName: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  minecraftAccountTypeBadge: {
    backgroundColor: COLORS.accent.green + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  minecraftAccountTypeBadgeFriend: {
    backgroundColor: COLORS.accent.blue + '20',
  },
  minecraftAccountTypeText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.accent.green,
    fontWeight: '600',
    fontSize: 10,
  },
  minecraftAccountTypeTextFriend: {
    color: COLORS.accent.blue,
  },
  minecraftDeleteButton: {
    padding: 8,
    marginLeft: 12,
  },
  minecraftAccountMeta: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
});
