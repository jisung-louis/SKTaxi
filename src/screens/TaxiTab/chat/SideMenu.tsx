import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Animated from 'react-native-reanimated';
import { EdgeInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typhograpy';
import Surface from '../../../components/common/Surface';

interface SideMenuProps {
  visible: boolean;
  insets: EdgeInsets;
  memberUids: string[];
  displayNameMap: Record<string, string>;
  currentUserId?: string;
  leaderId?: string;
  partyStatus?: string;
  isLeader: boolean;
  isPartyEnded: boolean;
  isChatMuted: boolean;
  overlayAnimatedStyle: any;
  sideMenuAnimatedStyle: any;
  onClose: () => void;
  onToggleMute: () => void;
  onShare: () => void;
  onKick: (memberId: string, displayName: string) => void;
  onLeave: () => void;
  onDeleteParty: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({
  visible,
  insets,
  memberUids,
  displayNameMap,
  currentUserId,
  leaderId,
  partyStatus,
  isLeader,
  isPartyEnded,
  isChatMuted,
  overlayAnimatedStyle,
  sideMenuAnimatedStyle,
  onClose,
  onToggleMute,
  onShare,
  onKick,
  onLeave,
  onDeleteParty,
}) => {
  if (!visible) return null;

  return (
    <>
      <Animated.View style={[styles.sideMenuOverlay, overlayAnimatedStyle]}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      <Animated.View style={[styles.sideMenu, sideMenuAnimatedStyle]}>
        <View style={[styles.sideMenuHeader, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.sideMenuTitle}>파티 정보</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>
        {!isPartyEnded ? (
          <View style={styles.sideMenuContent}>
            <View style={styles.memberSection}>
              <Text style={styles.sectionTitle}>참여 멤버 ({memberUids.length}명)</Text>
              <View style={styles.memberList}>
                {memberUids.map((uid) => {
                  const displayName = displayNameMap[uid] || '익명';
                  const isMe = uid === currentUserId;
                  const isMemberLeader = leaderId === uid;
                  const initial = displayName.charAt(0).toUpperCase();

                  return (
                    <View key={uid} style={styles.memberItem}>
                      <View style={[
                        styles.memberAvatar,
                        isMemberLeader && styles.leaderAvatar
                      ]}>
                        <Text style={styles.memberInitial}>{initial}</Text>
                      </View>
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>{displayName}</Text>
                        <Text style={[
                          styles.memberRole,
                          isMemberLeader && styles.leaderRole
                        ]}>
                          {isMe ?
                            isMemberLeader ? '리더(나)' : '멤버(나)'
                            :
                            isMemberLeader ? '리더' : '멤버'
                          }
                        </Text>
                      </View>
                      {(uid !== currentUserId) && (
                        <View style={{ gap: 8, alignItems: 'flex-start' }}>
                          <TouchableOpacity style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }} onPress={() => Alert.alert('멤버 정보', displayName)}>
                            <Icon name="information-circle-outline" size={18} color={COLORS.text.secondary} />
                            <Text style={styles.memberRole}>정보보기</Text>
                          </TouchableOpacity>
                          {isLeader && partyStatus !== 'arrived' && (
                            <TouchableOpacity style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }} onPress={() => onKick(uid, displayName)}>
                              <Icon name="remove-circle" size={18} color="#FF6B6B" />
                              <Text style={[styles.memberRole, { color: '#FF6B6B' }]}>강퇴</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
            <Surface color={COLORS.background.card} height={1} margin={16} />
            <View style={styles.actionSection}>
              <TouchableOpacity style={styles.actionButton} onPress={onToggleMute}>
                <Icon
                  name={isChatMuted ? "notifications-off" : "notifications"}
                  size={20}
                  color={isChatMuted ? COLORS.text.secondary : COLORS.accent.green}
                />
                <Text style={[styles.actionButtonText, isChatMuted && styles.mutedText]}>
                  채팅 알림 {isChatMuted ? '해제됨' : '켜기'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={onShare}>
                <Icon name="share" size={20} color={COLORS.accent.green} />
                <Text style={styles.actionButtonText}>공유</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={isLeader ? onDeleteParty : onLeave}
              >
                <Icon name="exit" size={20} color="#FF6B6B" />
                <Text style={[styles.actionButtonText, { color: '#FF6B6B' }]}>
                  {isLeader ? '파티 없애기' : '나가기'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, { margin: 20 }]}
            onPress={onClose}
          >
            <Icon name="exit" size={20} color="#FF6B6B" />
            <Text style={[styles.actionButtonText, { color: '#FF6B6B' }]}>나가기</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  sideMenuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  overlayTouchable: {
    flex: 1,
  },
  sideMenu: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 300,
    backgroundColor: COLORS.background.primary,
    zIndex: 1001,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  sideMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  sideMenuTitle: {
    ...TYPOGRAPHY.title3,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  sideMenuContent: {
    flex: 1,
    paddingTop: 16,
  },
  memberSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    fontWeight: '600',
    marginBottom: 12,
  },
  memberList: {
    gap: 12,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border.default,
  },
  leaderAvatar: {
    borderColor: COLORS.accent.green,
    backgroundColor: COLORS.accent.green + '20',
  },
  memberInitial: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  memberRole: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
  },
  leaderRole: {
    color: COLORS.accent.green,
  },
  actionSection: {
    paddingHorizontal: 16,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  mutedText: {
    color: COLORS.text.secondary,
  },
});
