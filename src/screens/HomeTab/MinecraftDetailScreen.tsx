import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Clipboard, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import database from '@react-native-firebase/database';
import firestore from '@react-native-firebase/firestore';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import { MinecraftServerStatus, MinecraftWhitelistPlayer } from '../../types/minecraft';

type PlayerWithMeta = MinecraftWhitelistPlayer & {
  addedByDisplayName?: string;
};

export const MinecraftDetailScreen = () => {
  const navigation = useNavigation();
  const [whitelistEnabled, setWhitelistEnabled] = useState<boolean | null>(null);
  const [players, setPlayers] = useState<PlayerWithMeta[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [serverStatus, setServerStatus] = useState<MinecraftServerStatus | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [serverVersion, setServerVersion] = useState<string | null>(null);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [userCache, setUserCache] = useState<Record<string, string>>({});

  useEffect(() => {
    const enabledRef = database().ref('whitelist/enabled');
    const playersRef = database().ref('whitelist/players');
    const bePlayersRef = database().ref('whitelist/BEPlayers');
    const statusRef = database().ref('serverStatus');
    const serverUrlRef = database().ref('serverStatus/serverUrl');

    const handleEnabled = enabledRef.on('value', (snap) => {
      if (snap.exists()) {
        setWhitelistEnabled(!!snap.val());
      } else {
        setWhitelistEnabled(null);
      }
    });

    let jePlayers: PlayerWithMeta[] = [];
    let bePlayers: PlayerWithMeta[] = [];

    const updatePlayers = () => {
      const allPlayers = [...jePlayers, ...bePlayers];
      allPlayers.sort((a, b) => b.addedAt - a.addedAt);
      setPlayers(allPlayers);
      setLoadingPlayers(false);
    };

    const handleJePlayers = playersRef.on('value', (snap) => {
      const value = snap.val();
      if (!value) {
        jePlayers = [];
      } else {
        jePlayers = Object.entries(value).map(([uuid, data]) => {
          const record = data as any;
          return {
            uuid,
            username: record?.nickname || '플레이어',
            edition: record?.edition || 'JE',
            whoseFriend: record?.whoseFriend,
            addedBy: record?.addedBy || 'unknown',
            addedAt: typeof record?.addedAt === 'number' ? record.addedAt : Date.now(),
            addedByDisplayName: userCache[record?.addedBy || ''],
          };
        });
      }
      updatePlayers();
    });

    const handleBePlayers = bePlayersRef.on('value', (snap) => {
      const value = snap.val();
      if (!value) {
        bePlayers = [];
      } else {
        bePlayers = Object.entries(value).map(([storedName, data]) => {
          const record = data as any;
          return {
            uuid: `be:${storedName}`, // BE는 be: 접두사 사용
            username: record?.nickname || record?.username || storedName, // 원본 닉네임 사용
            edition: 'BE',
            whoseFriend: record?.whoseFriend,
            addedBy: record?.addedBy || 'unknown',
            addedAt: typeof record?.addedAt === 'number' ? record.addedAt : Date.now(),
            addedByDisplayName: userCache[record?.addedBy || ''],
          };
        });
      }
      updatePlayers();
    });

    const handleStatus = statusRef.on('value', (snap) => {
      const data = snap.val();
      if (!data) {
        setServerStatus(null);
        return;
      }
      const playersData = parseServerPlayers(data.players) ?? [];
      setServerStatus({
        online: data.online ?? true,
        maxPlayers: data.maxPlayers ?? playersData.length,
        currentPlayers: data.currentPlayers ?? data.playerCount ?? playersData.length,
        players: playersData,
        updatedAt: data.updatedAt ?? Date.now(),
      });
      // 추가 서버 정보
      if (data.version) setServerVersion(data.version);
    });

    const handleServerUrl = serverUrlRef.on('value', (snap) => {
      if (snap.exists()) {
        setServerUrl(snap.val() as string);
      } else {
        setServerUrl(null);
      }
    });

    return () => {
      enabledRef.off('value', handleEnabled);
      playersRef.off('value', handleJePlayers);
      bePlayersRef.off('value', handleBePlayers);
      statusRef.off('value', handleStatus);
      serverUrlRef.off('value', handleServerUrl);
    };
  }, [userCache]);

  useEffect(() => {
    const missingUserIds = Array.from(new Set(players.map((player) => player.addedBy)))
      .filter((uid) => uid && !userCache[uid]);

    if (missingUserIds.length === 0) return;

    setFetchingUsers(true);
    Promise.all(
      missingUserIds.map(async (uid) => {
        try {
          const snap = await firestore().collection('users').doc(uid).get();
          const displayName = snap.data()?.displayName || '관리자';
          return { uid, displayName };
        } catch {
          return { uid, displayName: '알 수 없음' };
        }
      })
    )
      .then((results) => {
        setUserCache((prev) => {
          const next = { ...prev };
          results.forEach(({ uid, displayName }) => {
            next[uid] = displayName;
          });
          return next;
        });
      })
      .finally(() => setFetchingUsers(false));
  }, [players, userCache]);

  const sortedPlayers = useMemo(() => {
    // whoseFriend가 없는 플레이어(부모 계정)를 먼저 abc순으로 정렬
    const parentPlayers = players
      .filter((p) => !p.whoseFriend)
      .sort((a, b) => a.username.localeCompare(b.username, 'ko'));

    // 각 부모 계정의 친구들을 그룹화
    const friendsByParent = new Map<string, typeof players>();
    players
      .filter((p) => p.whoseFriend)
      .forEach((friend) => {
        const parent = friend.whoseFriend!;
        if (!friendsByParent.has(parent)) {
          friendsByParent.set(parent, []);
        }
        friendsByParent.get(parent)!.push(friend);
      });

    // 각 부모의 친구들을 abc순으로 정렬
    friendsByParent.forEach((friends) => {
      friends.sort((a, b) => a.username.localeCompare(b.username, 'ko'));
    });

    // 부모 계정과 그 친구들을 순서대로 배치
    const result: typeof players = [];
    parentPlayers.forEach((parent) => {
      result.push(parent);
      const friends = friendsByParent.get(parent.username) || [];
      result.push(...friends);
    });

    return result.map((player) => ({
      ...player,
      addedByDisplayName: userCache[player.addedBy] || player.addedByDisplayName || '알 수 없음',
    }));
  }, [players, userCache]);

  const formatDateTime = (ts?: number) => {
    if (!ts) return '-';
    try {
      const date = new Date(ts);
      return `${date.toLocaleDateString('ko-KR')} ${date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return '-';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>마인크래프트 서버 정보</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={[styles.cardHeaderRow, { justifyContent: 'space-between' }]}>
            <View style={styles.cardHeaderLeftContainer}>
                <Icon name="globe" size={20} color={COLORS.accent.blue} />
                <Text style={styles.cardTitle}>서버 정보</Text>
            </View>

            {/* 서버 상태 배지 */}
            {serverStatus && (
              <View style={styles.serverStatusBadgeContainer}>
                <View style={[styles.serverStatusBadge, serverStatus.online ? styles.serverStatusBadgeOnline : styles.serverStatusBadgeOffline]}>
                  <View style={[styles.serverStatusDot, serverStatus.online ? styles.serverStatusDotOnline : styles.serverStatusDotOffline]} />
                  <Text style={[styles.serverStatusBadgeText, serverStatus.online ? styles.serverStatusBadgeTextOnline : styles.serverStatusBadgeTextOffline]}>
                    {serverStatus.online ? '서버 켜짐' : '서버 꺼짐'}
                  </Text>
                </View>
              </View>
            )}
          </View>
          
          <View style={styles.serverInfoContent}>

            {/* 서버 주소 섹션 */}
            <View style={styles.serverAddressSection}>
              <View style={styles.serverInfoLabelRow}>
                <Icon name="server" size={16} color={COLORS.text.secondary} />
                <Text style={styles.serverInfoLabel}>서버 주소</Text>
              </View>
              <View style={styles.serverAddressRow}>
                <View style={styles.serverAddressContainer}>
                  <Text style={styles.serverAddressText}>{serverUrl || '서버 주소를 불러오는 중...'}</Text>
                </View>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={async () => {
                    if (!serverUrl) {
                      Alert.alert('알림', '서버 주소를 불러올 수 없습니다.');
                      return;
                    }
                    try {
                      await Clipboard.setString(serverUrl);
                      Alert.alert('복사 완료', '서버 주소가 클립보드에 복사되었습니다.');
                    } catch (error) {
                      Alert.alert('오류', '클립보드 복사에 실패했습니다.');
                    }
                  }}
                  disabled={!serverUrl}
                >
                  <Icon name="copy-outline" size={18} color={COLORS.accent.blue} />
                  <Text style={styles.copyButtonText}>복사</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 서버 버전 정보 */}
            {serverVersion && (
              <>
                <View style={styles.serverInfoDivider} />
                <View style={styles.serverInfoRow}>
                  <View style={styles.serverInfoLabelRow}>
                    <Icon name="code" size={16} color={COLORS.text.secondary} />
                    <Text style={styles.serverInfoLabel}>버전</Text>
                  </View>
                  <Text style={styles.serverInfoValue}>{serverVersion}</Text>
                </View>
              </>
            )}

            {/* 도움말 및 채팅방 바로가기 */}
            <View style={styles.serverInfoDivider} />
            
            <View style={styles.serverInfoHelp}>
              <Icon name="information-circle-outline" size={16} color={COLORS.accent.blue} />
              <Text style={styles.serverInfoHelpText}>
                JE: 멀티플레이어 → 서버 추가 → 주소 입력{'\n'}
                BE: 서버 → 서버 추가 → 주소 입력
              </Text>
            </View>

            <TouchableOpacity
              style={styles.chatRoomButton}
              onPress={() => {
                (navigation as any).navigate('Main', {
                  screen: '채팅',
                  params: {
                    screen: 'ChatDetail',
                    params: { chatRoomId: 'game-minecraft' }
                  }
                });
              }}
            >
              <View style={styles.chatRoomButtonContent}>
                <Icon name="chatbubbles" size={20} color={COLORS.accent.orange} />
                <Text style={styles.chatRoomButtonText}>마인크래프트 채팅방</Text>
                <Icon name="chevron-forward" size={18} color={COLORS.text.secondary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <View style={[styles.cardHeaderRow, { justifyContent: 'space-between' }]}>
            <View style={styles.cardHeaderLeftContainer}>
                <Icon name="people" size={20} color={COLORS.accent.orange} />
                <Text style={styles.cardTitle}>현재 서버 접속자</Text>
            </View>
            {serverStatus && (
              <View style={styles.serverPlayerCountBadge}>
                <Icon name="people" size={16} color={COLORS.text.secondary} />
                <Text style={styles.serverPlayerCountText}>
                    {serverStatus?.currentPlayers || 0}/{serverStatus?.maxPlayers || serverStatus?.currentPlayers || 0}
                </Text>
              </View>
            )}
          </View>
          {serverStatus ? (
            <>
              <View style={styles.serverStatusHeader}>
                <View style={styles.serverUpdatedAt}>
                  <Icon name="time-outline" size={12} color={COLORS.text.secondary} />
                  <Text style={styles.serverUpdatedAtText}>{formatDateTime(serverStatus.updatedAt)}</Text>
                </View>
              </View>
              {serverStatus.players && serverStatus.players.length > 0 ? (
                <View style={styles.playersList}>
                  {serverStatus.players.map((p) => {
                    const avatarUrl = p.uuid && !p.uuid.startsWith('be:') ? p.uuid : '8667ba71b85a4004af54457a9734eed7';
                    return (
                    <View key={`${p.uuid || p.username}`} style={styles.playerRow}>
                      <Image 
                        source={{ uri: `https://minotar.net/avatar/${avatarUrl}/48` }} 
                        style={styles.playerAvatar}
                      />
                      <View style={styles.playerInfo}>
                        <Text style={styles.playerName}>{p.username}</Text>
                      </View>
                      {/* <View style={styles.playerMeta}>
                        TODO: 레벨, 현재 체력, 위치(오버월드,네더 등) 표시 예정
                      </View> */}
                      <TouchableOpacity
                        style={styles.playerActionButton}
                        onPress={() => {
                          // TODO: 추후 귓말 보내기 등 기능 확장
                        }}
                      >
                        <Icon name="ellipsis-horizontal" size={18} color={COLORS.text.secondary} />
                      </TouchableOpacity>
                    </View>
                  )})}
                </View>
              ) : (
                <View style={styles.emptyPlayersState}>
                  <Icon name="people-outline" size={32} color={COLORS.text.disabled} />
                  <Text style={styles.emptyPlayersText}>현재 접속 중인 플레이어가 없습니다</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyServerState}>
              <Icon name="server-outline" size={32} color={COLORS.text.disabled} />
              <Text style={styles.emptyServerText}>서버 상태 정보를 불러오는 중이거나{'\n'}아직 설정되지 않았어요</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Icon name="list-circle" size={20} color={COLORS.accent.blue} />
            <Text style={styles.cardTitle}>서버 멤버 목록</Text>
            {fetchingUsers && <ActivityIndicator color={COLORS.text.secondary} size="small" style={{ marginLeft: 8 }} />}
          </View>
          {loadingPlayers ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={COLORS.accent.blue} />
              <Text style={styles.loadingText}>서버 멤버 목록을 불러오는 중...</Text>
            </View>
          ) : sortedPlayers.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="shield-outline" size={40} color={COLORS.text.disabled} />
              <Text style={styles.emptyStateTitle}>서버 멤버가 없어요</Text>
              <Text style={styles.emptyStateDesc}>홈 탭에서 닉네임을 등록해서{'\n'}마인크래프트 서버에 참여해보세요!</Text>
            </View>
          ) : (
            sortedPlayers.map((player) => {
              const avatarUrl = player.uuid && !player.uuid.startsWith('be:') ? player.uuid : '8667ba71b85a4004af54457a9734eed7';
              return (
              <View key={player.uuid} style={styles.playerRow}>
                <Image 
                    source={{ uri: `https://minotar.net/avatar/${avatarUrl}/48` }} 
                    style={styles.playerAvatar}
                />
                <View style={styles.playerInfo}>
                  <View style={styles.playerNameRow}>
                    <Text style={styles.playerName}>{player.username}</Text>
                    {player.whoseFriend && (
                      <View style={[styles.playerTypeBadge, styles.playerTypeBadgeFriend]}>
                        <Text style={[styles.playerTypeText, styles.playerTypeTextFriend]}>
                          {player.whoseFriend}님의 친구
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.playerMeta}>
                    {player.edition || 'JE'} · {formatDateTime(player.addedAt)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.playerActionButton}
                  onPress={() => {
                    // TODO: 추후 귓말 보내기 등 기능 확장
                  }}
                >
                  <Icon name="ellipsis-horizontal" size={18} color={COLORS.text.secondary} />
                </TouchableOpacity>
              </View>
            )})
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const parseServerPlayers = (value: any): MinecraftServerStatus['players'] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((p: any) => ({
      username: p.username || p.name || '플레이어',
      uuid: p.uuid,
    }));
  }
  if (typeof value === 'object') {
    return Object.values(value).map((p: any) => ({
      username: p.username || p.name || '플레이어',
      uuid: p.uuid,
    }));
  }
  return [];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    ...TYPOGRAPHY.title2,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  headerRightPlaceholder: {
    width: 32,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  card: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  cardHeaderLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  statusText: {
    ...TYPOGRAPHY.title3,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  serverStatusHeader: {
    gap: 12,
    marginBottom: 4,
  },
  serverStatusBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serverStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
  },
  serverStatusBadgeOnline: {
    backgroundColor: COLORS.accent.green + '20',
    borderColor: COLORS.accent.green + '40',
  },
  serverStatusBadgeOffline: {
    backgroundColor: COLORS.accent.red + '20',
    borderColor: COLORS.accent.red + '40',
  },
  serverStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  serverStatusDotOnline: {
    backgroundColor: COLORS.accent.green,
  },
  serverStatusDotOffline: {
    backgroundColor: COLORS.accent.red,
  },
  serverStatusBadgeText: {
    ...TYPOGRAPHY.caption2,
    fontWeight: '600',
  },
  serverStatusBadgeTextOnline: {
    color: COLORS.accent.green,
  },
  serverStatusBadgeTextOffline: {
    color: COLORS.accent.red,
  },
  serverPlayerCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serverPlayerCountText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  cardDescription: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginTop: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 12,
  },
  emptyStateTitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  emptyStateDesc: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyPlayersState: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyPlayersText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
  },
  emptyServerState: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyServerText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.moreDark,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  playerInfo: {
    flex: 1,
  },
  playerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  playerName: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  playerTypeBadge: {
    backgroundColor: COLORS.accent.green + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  playerTypeBadgeFriend: {
    backgroundColor: COLORS.accent.blue + '20',
  },
  playerTypeText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.accent.green,
    fontWeight: '600',
    fontSize: 10,
  },
  playerTypeTextFriend: {
    color: COLORS.accent.blue,
  },
  playerMeta: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  playerActionButton: {
    padding: 4,
    marginLeft: 'auto',
  },
  serverInfoHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.accent.blue + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serverInfoContent: {
    gap: 12,
  },
  serverAddressSection: {
    gap: 10,
    marginTop: 4,
  },
  serverInfoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  serverInfoLabel: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  serverAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  serverAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: COLORS.background.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  serverAddressText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  serverPortText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    fontWeight: '400',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.accent.blue + '20',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.accent.blue + '40',
  },
  copyButtonText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.accent.blue,
    fontWeight: '600',
  },
  serverInfoDivider: {
    height: 1,
    backgroundColor: COLORS.border.moreDark,
    marginVertical: 4,
  },
  serverInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  serverInfoValue: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  serverInfoHelp: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: COLORS.accent.blue + '10',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.accent.blue + '20',
  },
  serverInfoHelpText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  chatRoomButton: {
    backgroundColor: COLORS.accent.orange + '15',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.accent.orange + '30',
    padding: 14,
  },
  chatRoomButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chatRoomButtonText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '600',
    flex: 1,
  },
  playersList: {
    marginTop: 12,
    gap: 8,
  },
  serverUpdatedAt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serverUpdatedAtText: {
    ...TYPOGRAPHY.caption2,
    color: COLORS.text.secondary,
  },
});

