import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typhograpy';

interface SettlementBarProps {
  settlementStatus: { [key: string]: boolean };
  displayNameMap: Record<string, string>;
  currentUserId?: string;
  leaderId?: string;
  perPersonAmount: number;
  isMinimized: boolean;
  animatedBarStyle: any;
  animatedListStyle: any;
  onToggleMinimize: () => void;
  onPressBar: () => void;
}

export const SettlementBar: React.FC<SettlementBarProps> = ({
  settlementStatus,
  displayNameMap,
  currentUserId,
  leaderId,
  perPersonAmount,
  isMinimized,
  animatedBarStyle,
  animatedListStyle,
  onToggleMinimize,
  onPressBar,
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
    <Animated.View style={[styles.topNoticeBar, animatedBarStyle]}>
      <TouchableOpacity style={styles.noticeBarContent} onPress={onPressBar}>
        <Text style={styles.noticeBarTitle}>정산 현황</Text>
        <Animated.View style={[styles.settlementList, animatedListStyle]}>
          {sortedMemberIds.map((memberId) => {
            const displayName = displayNameMap[memberId] || '익명';
            const isSettled = settlementStatus[memberId];
            const isMe = memberId === currentUserId;
            const isLeader = memberId === leaderId;

            return (
              <View key={memberId} style={styles.settlementItem}>
                <Icon
                  name={isLeader ? "flag" : (isSettled ? "checkbox" : "square-outline")}
                  size={16}
                  color={isLeader ? COLORS.accent.green : (isSettled ? COLORS.accent.green : COLORS.text.secondary)}
                />
                <Text style={[styles.settlementText, isSettled && styles.settlementTextCompleted, isMe && { fontWeight: '700' }]}>
                  {displayName}님 {isLeader ? '정산자' : `${perPersonAmount.toLocaleString()}원 ${isSettled ? '송금완료' : '송금 중'}`}{isMe && ' (나)'}
                </Text>
              </View>
            );
          })}
        </Animated.View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.noticeBarToggle}
        onPress={onToggleMinimize}
      >
        <Icon
          name={isMinimized ? "chevron-down" : "chevron-up"}
          size={20}
          color={COLORS.text.secondary}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  topNoticeBar: {
    backgroundColor: COLORS.background.primary,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border.default,
    zIndex: 1000,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    minHeight: 52,
    overflow: 'hidden',
  },
  noticeBarContent: {
    marginVertical: 6,
    flex: 1,
  },
  noticeBarTitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  settlementList: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  settlementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
    gap: 4,
  },
  settlementText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
  settlementTextCompleted: {
    color: COLORS.accent.green,
    fontWeight: '600',
  },
  noticeBarToggle: {
    padding: 8,
  },
});
