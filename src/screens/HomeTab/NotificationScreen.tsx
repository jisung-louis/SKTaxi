import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../../components/common/PageHeader';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { TYPOGRAPHY } from '../../constants/typhograpy';

// SKTaxi: 임시 알림 데이터 (추후 실제 데이터로 교체)
const mockNotifications = [
  {
    id: '1',
    type: 'party_join',
    title: '파티 참여 승인',
    message: '홍길동님이 당신의 택시 파티 참여를 승인했어요!',
    time: '2분 전',
    isRead: false,
    icon: 'checkmark-circle',
    iconColor: COLORS.accent.green,
  },
  {
    id: '2',
    type: 'party_created',
    title: '새로운 파티 생성',
    message: '김철수님이 새로운 택시 파티를 만들었어요. 참여해보세요!',
    time: '1시간 전',
    isRead: true,
    icon: 'car',
    iconColor: COLORS.accent.blue,
  },
  {
    id: '3',
    type: 'system',
    title: '앱 업데이트',
    message: '새로운 기능이 추가되었어요. 지금 업데이트해보세요!',
    time: '3시간 전',
    isRead: true,
    icon: 'download',
    iconColor: COLORS.text.secondary,
  },
  {
    id: '4',
    type: 'party_reminder',
    title: '파티 출발 알림',
    message: '10분 후에 출발하는 택시 파티가 있어요. 준비해주세요!',
    time: '1일 전',
    isRead: true,
    icon: 'time',
    iconColor: COLORS.accent.red,
  },
  {
    id: '5',
    type: 'payment',
    title: '정산 완료',
    message: '택시비 정산이 완료되었어요. 감사합니다!',
    time: '2일 전',
    isRead: true,
    icon: 'card',
    iconColor: COLORS.accent.green,
  },
];

export const NotificationScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    // SKTaxi: 실제로는 서버에서 새 알림을 가져옴
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleNotificationPress = (notification: any) => {
    // SKTaxi: 알림을 읽음 처리
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notification.id 
          ? { ...notif, isRead: true }
          : notif
      )
    );
    
    // SKTaxi: 알림 타입에 따른 네비게이션 처리
    switch (notification.type) {
      case 'party_join':
      case 'party_created':
        // 파티 관련 알림은 택시 탭으로 이동
        break;
      case 'system':
        // 시스템 알림은 설정으로 이동
        navigation.navigate('Setting');
        break;
      default:
        break;
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  const renderNotificationItem = (notification: any) => (
    <TouchableOpacity
      key={notification.id}
      style={[
        styles.notificationItem,
        !notification.isRead && styles.unreadNotification
      ]}
      onPress={() => handleNotificationPress(notification)}
    >
      <View style={styles.notificationLeft}>
        <View style={[styles.iconContainer, { backgroundColor: notification.iconColor + '20' }]}>
          <Icon name={notification.icon} size={20} color={notification.iconColor} />
        </View>
        <View style={styles.notificationContent}>
          <Text style={[styles.notificationTitle, !notification.isRead && styles.unreadText]}>
            {notification.title}
          </Text>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {notification.message}
          </Text>
          <Text style={styles.notificationTime}>{notification.time}</Text>
        </View>
      </View>
      {!notification.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <PageHeader 
        onBack={() => navigation.goBack()} 
        title="알림" 
        borderBottom 
        rightButton
        onRightButtonPress={handleMarkAllAsRead}
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
        {notifications.length === 0 ? (
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
    paddingVertical: 16,
    paddingHorizontal: 16,
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
});