import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import { Course } from '../../types/timetable';

interface TimetableShareModalProps {
  visible: boolean;
  onClose: () => void;
  courses: Course[];
  semester: string;
}

export const TimetableShareModal: React.FC<TimetableShareModalProps> = ({
  visible,
  onClose,
  courses,
  semester,
}) => {
  const [shareCode, setShareCode] = useState<string>('');

  const generateShareCode = () => {
    // 간단한 공유 코드 생성 (실제로는 서버에서 생성)
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setShareCode(code);
    return code;
  };

  const handleShare = async () => {
    try {
      const courseList = courses.map(course => 
        `• ${course.name} (${course.code}) - ${course.professor}`
      ).join('\n');

      const shareText = `📅 ${semester}학기 시간표\n\n${courseList}\n\n#SKTaxi #시간표`;

      await Share.share({
        message: shareText,
        title: '내 시간표 공유',
      });
    } catch (error) {
      console.error('공유 실패:', error);
      Alert.alert('공유 실패', '시간표 공유에 실패했습니다.');
    }
  };

  const handleCopyCode = () => {
    if (!shareCode) {
      const code = generateShareCode();
      Alert.alert('공유 코드 생성', `공유 코드: ${code}\n\n이 코드를 다른 사용자에게 알려주세요.`);
    } else {
      Alert.alert('공유 코드', `공유 코드: ${shareCode}\n\n이 코드를 다른 사용자에게 알려주세요.`);
    }
  };

  const handleImportCode = () => {
    Alert.prompt(
      '시간표 가져오기',
      '공유 코드를 입력하세요:',
      (text) => {
        if (text && text.trim()) {
          // TODO: 공유 코드로 시간표 가져오기
          Alert.alert('가져오기', `공유 코드 "${text}"로 시간표를 가져옵니다.`);
        }
      }
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>시간표 공유</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>

        {/* 컨텐츠 */}
        <View style={styles.content}>
          {/* 공유 옵션 */}
          <View style={styles.shareOptions}>
            <TouchableOpacity style={styles.shareOption} onPress={handleShare}>
              <View style={styles.shareIconContainer}>
                <Icon name="share-outline" size={24} color={COLORS.accent.blue} />
              </View>
              <View style={styles.shareTextContainer}>
                <Text style={styles.shareTitle}>다른 앱으로 공유</Text>
                <Text style={styles.shareSubtitle}>카카오톡, 문자 등으로 시간표 공유</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={COLORS.text.secondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareOption} onPress={handleCopyCode}>
              <View style={styles.shareIconContainer}>
                <Icon name="copy-outline" size={24} color={COLORS.accent.green} />
              </View>
              <View style={styles.shareTextContainer}>
                <Text style={styles.shareTitle}>공유 코드 생성</Text>
                <Text style={styles.shareSubtitle}>코드로 시간표 공유하기</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={COLORS.text.secondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareOption} onPress={handleImportCode}>
              <View style={styles.shareIconContainer}>
                <Icon name="download-outline" size={24} color={COLORS.accent.orange} />
              </View>
              <View style={styles.shareTextContainer}>
                <Text style={styles.shareTitle}>시간표 가져오기</Text>
                <Text style={styles.shareSubtitle}>공유 코드로 시간표 가져오기</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={COLORS.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* 현재 시간표 정보 */}
          <View style={styles.timetableInfo}>
            <Text style={styles.infoTitle}>현재 시간표</Text>
            <Text style={styles.infoSubtitle}>{semester}학기 • {courses.length}개 수업</Text>
            
            {courses.length > 0 && (
              <View style={styles.courseList}>
                {courses.slice(0, 3).map((course, index) => (
                  <Text key={course.id} style={styles.courseItem}>
                    {course.name} ({course.code})
                  </Text>
                ))}
                {courses.length > 3 && (
                  <Text style={styles.moreText}>외 {courses.length - 3}개 수업</Text>
                )}
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  headerTitle: {
    ...TYPOGRAPHY.title2,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  shareOptions: {
    gap: 12,
    marginBottom: 24,
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  shareIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  shareTextContainer: {
    flex: 1,
  },
  shareTitle: {
    ...TYPOGRAPHY.title3,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  shareSubtitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
  },
  timetableInfo: {
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  infoTitle: {
    ...TYPOGRAPHY.title3,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoSubtitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginBottom: 12,
  },
  courseList: {
    gap: 4,
  },
  courseItem: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
  },
  moreText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
});



