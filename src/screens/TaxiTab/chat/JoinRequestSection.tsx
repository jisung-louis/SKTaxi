import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typhograpy';

interface JoinRequest {
  id: string;
  requesterId: string;
  createdAt?: { toDate?: () => Date };
}

interface JoinRequestSectionProps {
  joinRequests: JoinRequest[];
  displayNameMap: Record<string, string>;
  showJoinRequests: boolean;
  onToggleShow: () => void;
  onAccept: (requestId: string, requesterId: string) => void;
  onDecline: (requestId: string) => void;
}

export const JoinRequestSection: React.FC<JoinRequestSectionProps> = ({
  joinRequests,
  displayNameMap,
  showJoinRequests,
  onToggleShow,
  onAccept,
  onDecline,
}) => {
  if (joinRequests.length === 0) return null;

  return (
    <View style={styles.joinRequestsSection}>
      <TouchableOpacity
        style={styles.joinRequestsHeader}
        onPress={onToggleShow}
      >
        <View style={styles.joinRequestsHeaderLeft}>
          <Icon name="people" size={20} color={COLORS.accent.blue} />
          <Text style={styles.joinRequestsTitle}>
            동승 요청 ({joinRequests.length})
          </Text>
        </View>
        <Icon
          name={showJoinRequests ? "chevron-up" : "chevron-down"}
          size={20}
          color={COLORS.text.secondary}
        />
      </TouchableOpacity>

      {showJoinRequests && (
        <View style={styles.joinRequestsList}>
          {joinRequests.map((request) => {
            const requesterName = displayNameMap[request.requesterId] || '익명';
            return (
              <View key={request.id} style={styles.joinRequestItem}>
                <View style={styles.joinRequestInfo}>
                  <Text style={styles.joinRequestName}>{requesterName} 님</Text>
                  <Text style={styles.joinRequestTime}>
                    {request.createdAt?.toDate?.()?.toLocaleString() || '방금 전'}
                  </Text>
                </View>
                <View style={styles.joinRequestActions}>
                  <TouchableOpacity
                    style={[styles.joinRequestButton, styles.acceptButton]}
                    onPress={() => onAccept(request.id, request.requesterId)}
                  >
                    <Text style={styles.acceptButtonText}>승인</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.joinRequestButton, styles.declineButton]}
                    onPress={() => onDecline(request.id)}
                  >
                    <Text style={styles.declineButtonText}>거절</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  joinRequestsSection: {
    backgroundColor: COLORS.background.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  joinRequestsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  joinRequestsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  joinRequestsTitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.accent.blue,
    fontWeight: '600',
  },
  joinRequestsList: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  joinRequestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
  },
  joinRequestInfo: {
    flex: 1,
  },
  joinRequestName: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  joinRequestTime: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  joinRequestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  joinRequestButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  acceptButton: {
    backgroundColor: COLORS.accent.green,
  },
  acceptButtonText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.buttonText,
    fontWeight: '600',
  },
  declineButton: {
    backgroundColor: COLORS.background.surface,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  declineButtonText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
});
