import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typhograpy';

interface ChatMenuProps {
  isLeader: boolean;
  partyStatus?: string;
  animatedStyle: any;
  onMenuPress: (type: string) => void;
}

export const ChatMenu: React.FC<ChatMenuProps> = ({
  isLeader,
  partyStatus,
  animatedStyle,
  onMenuPress,
}) => {
  return (
    <Animated.View style={[styles.menuContainer, animatedStyle]}>
      <View style={styles.menuItemWrapper}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => onMenuPress('taxi')}
        >
          <Icon name="car" size={32} color={COLORS.accent.green} />
        </TouchableOpacity>
        <Text style={styles.menuItemText}>택시호출</Text>
      </View>
      <View style={styles.menuItemWrapper}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => onMenuPress('account')}
        >
          <Icon name="card" size={32} color={COLORS.accent.green} />
        </TouchableOpacity>
        <Text style={styles.menuItemText}>계좌전송</Text>
      </View>
      {isLeader && (
        <>
          {partyStatus !== 'arrived' ? (
            <View style={styles.menuItemWrapper}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => onMenuPress('close')}
              >
                <Icon name={partyStatus === 'closed' ? 'refresh-circle' : 'close-circle'} size={32} color={COLORS.accent.green} />
              </TouchableOpacity>
              <Text style={styles.menuItemText}>{partyStatus === 'closed' ? '모집재개' : '모집마감'}</Text>
            </View>
          ) : (
            <View style={styles.menuItemWrapper}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => onMenuPress('settlement')}
              >
                <Icon name="receipt" size={32} color={COLORS.accent.blue} />
              </TouchableOpacity>
              <Text style={styles.menuItemText}>정산현황</Text>
            </View>
          )}
          <View style={styles.menuItemWrapper}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => onMenuPress(partyStatus === 'arrived' ? 'endParty' : 'arrive')}
            >
              <Icon
                name={partyStatus === 'arrived' ? "log-out" : "checkmark-circle"}
                size={32}
                color={partyStatus === 'arrived' ? COLORS.accent.red : COLORS.accent.green}
              />
            </TouchableOpacity>
            <Text style={styles.menuItemText}>{partyStatus === 'arrived' ? '동승종료' : '도착'}</Text>
          </View>
        </>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: COLORS.background.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
  },
  menuItemWrapper: {
    alignItems: 'center',
    gap: 6,
  },
  menuItem: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.background.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  menuItemText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
});
