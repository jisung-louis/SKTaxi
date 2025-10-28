import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../../components/common/PageHeader';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import { useNotifications, Notification } from '../../hooks/useNotifications';

const formatTimeAgo = (timestamp: any) => {
  if (!timestamp) return '방금 전';
  
  const now = new Date();
  const createdAt = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diffMs = now.getTime() - createdAt.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) return `${diffDays}일 전`;
  if (diffHours > 0) return `${diffHours}시간 전`;
  if (diffMinutes > 0) return `${diffMinutes}분 전`;
  return '방금 전';
};

const getNotificationIcon = (type: string) => {
  const iconMap: { [key: string]: { icon: string; color: string } } = {
    'party_join_request': { icon: 'person-add', color: COLORS.accent.blue },
    'party_join_accepted': { icon: 'checkmark-circle', color: COLORS.accent.green },
    'party_join_rejected': { icon: 'close-circle', color: COLORS.accent.red },
    'party_deleted': { icon: 'car', color: COLORS.text.secondary },
    'party_closed': { icon: 'lock-closed', color: COLORS.accent.red },
    'party_arrived': { icon: 'checkmark-circle', color: COLORS.accent.green },
    'chat_message': { icon: 'chatbubble', color: COLORS.accent.blue },
    'notice': { icon: 'notifications', color: COLORS.accent.green },
    'settlement_completed': { icon: 'receipt', color: COLORS.accent.green },
    'member_kicked': { icon: 'exit', color: COLORS.accent.red },
    'board_post_comment': { icon: 'chatbubble', color: COLORS.accent.blue },
    'board_comment_reply': { icon: 'chatbubble-ellipses', color: COLORS.accent.green },
    'board_post_like': { icon: 'heart', color: COLORS.accent.red },
    'notice_post_comment': { icon: 'chatbubble', color: COLORS.accent.blue },
    'notice_comment_reply': { icon: 'chatbubble-ellipses', color: COLORS.accent.green },
  };
  
  return iconMap[type] || { icon: 'notifications', color: COLORS.text.secondary };
};

export const NotificationScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { notifications, loading, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications, unreadCount } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleNotificationPress = async (notification: Notification) => {
    // 읽음 처리
    await markAsRead(notification.id);
    // HomeTab 스택을 HomeScreen으로 우선 초기화
    navigation.popToTop();
    
    
    // 알림 타입에 따른 네비게이션
    switch (notification.type) {
      case 'party_join_request':
      case 'party_join_accepted':
      case 'party_deleted':
      case 'party_closed':
      case 'party_arrived':
      case 'chat_message':
      case 'settlement_completed':
        // 택시 탭으로 이동하고 채팅 화면으로 이동
        if (notification.data?.partyId) {
          (navigation as any).navigate('택시', {
            screen: 'Chat',
            params: { partyId: notification.data.partyId },
          });
        } else {
          (navigation as any).navigate('택시');
        }
        break;
      case 'member_kicked':
        // 강퇴 알림은 클릭해도 아무 동작 안함 (읽음 처리만)
        break;
      case 'notice':
        // 공지사항 상세 화면으로 이동
        (navigation as any).navigate('공지', {
          screen: 'NoticeDetail',
          params: {
            noticeId: notification.data?.noticeId,
          },
        });
        break;
      case 'board_post_comment':
      case 'board_comment_reply':
      case 'board_post_like':
        // 게시판 상세 화면으로 이동
        if (notification.data?.postId) {
          (navigation as any).navigate('게시판', {
            screen: 'BoardDetail',
            params: {
              postId: notification.data.postId,
            },
          });
        }
        break;
      case 'notice_post_comment':
      case 'notice_comment_reply':
        // 공지사항 상세 화면으로 이동
        if (notification.data?.noticeId) {
          (navigation as any).navigate('공지', {
            screen: 'NoticeDetail',
            params: {
              noticeId: notification.data.noticeId,
            },
          });
        }
        break;
      default:
        break;
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteNotification = async (notification: Notification) => {
    try {
      await deleteNotification(notification.id);
    } catch (error) {
      console.error('알림 삭제 실패:', error);
      Alert.alert('오류', '알림 삭제에 실패했습니다.');
    }
  };
  const handleDeleteAllNotifications = async () => {
    Alert.alert(
      '모든 알림 삭제',
      '모든 알림을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAllNotifications();
            } catch (error) {
              console.error('알림 삭제 실패:', error);
              Alert.alert('오류', '알림 삭제에 실패했습니다.');
            }
          }
        }
      ]
    );
  };

  const renderNotificationItem = (notification: Notification) => {
    const { icon, color } = getNotificationIcon(notification.type);
    const timeAgo = formatTimeAgo(notification.createdAt);
    
    return (
      <TouchableOpacity
        key={notification.id}
        style={[
          styles.notificationItem,
          !notification.isRead && styles.unreadNotification
        ]}
        onPress={() => handleNotificationPress(notification)}
      >
        <View style={styles.notificationLeft}>
          <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
            <Icon name={icon} size={20} color={color} />
          </View>
          <View style={styles.notificationContent}>
            <Text style={[styles.notificationTitle, !notification.isRead && styles.unreadText]}>
              {notification.title}
            </Text>
            <Text style={styles.notificationMessage} numberOfLines={2}>
              {notification.message}
            </Text>
            <Text style={styles.notificationTime}>{timeAgo}</Text>
          </View>
        </View>
        {!notification.isRead && <View style={styles.unreadDot} />}
        <TouchableOpacity style={styles.notificationDeleteButton} onPress={() => handleDeleteNotification(notification)}>
          <Icon name="trash" size={20} color={COLORS.text.tertiary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <PageHeader 
        onBack={() => navigation.goBack()} 
        title="알림" 
        borderBottom
        rightButtons={[
            <Icon name="checkmark-circle" size={30} color={COLORS.text.primary} />,
            <Icon name="trash" size={30} color={COLORS.text.primary} />,
        ]}
        onRightButtonsPress={(index) => {
          if (index === 0) {
            handleMarkAllAsRead();
          } else if (index === 1) {
            handleDeleteAllNotifications();
          }
        }}
      />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.accent.green}
          />
        }
      >
        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyMessage}>알림을 불러오는 중...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="notifications-off" size={64} color={COLORS.text.disabled} />
            <Text style={styles.emptyTitle}>알림이 없어요</Text>
            <Text style={styles.emptyMessage}>
              새로운 알림이 오면 여기에 표시됩니다
            </Text>
          </View>
        ) : (
          <View style={styles.notificationsList}>
            {unreadCount > 0 && (
              <View style={styles.unreadHeader}>
                <Text style={styles.unreadHeaderText}>
                  읽지 않은 알림 {unreadCount}개
                </Text>
              </View>
            )}
            {notifications.map(renderNotificationItem)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
  },
  emptyTitle: {
    ...TYPOGRAPHY.title2,
    color: COLORS.text.primary,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  notificationsList: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  unreadHeader: {
    backgroundColor: COLORS.accent.green + '10',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 16,
  },
  unreadHeaderText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.accent.green,
    fontWeight: '600',
    textAlign: 'center',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: COLORS.background.card,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  unreadNotification: {
    backgroundColor: COLORS.background.primary,
    borderWidth: 1,
    borderColor: COLORS.accent.green + '30',
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: '700',
  },
  notificationMessage: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: 6,
  },
  notificationTime: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.disabled,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent.green,
    marginTop: 8,
    marginLeft: 8,
  },
  notificationDeleteButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    zIndex: 1000,
    padding: 16,
  },
});