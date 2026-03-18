import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import type {ContentDetailAttachmentViewData} from '@/shared/types/contentDetailViewData';
import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
} from '@/shared/design-system/tokens';

interface NoticeDetailAttachmentsProps {
  attachments: ContentDetailAttachmentViewData[];
}

export const NoticeDetailAttachments = ({
  attachments,
}: NoticeDetailAttachmentsProps) => {
  const handlePressAttachment = React.useCallback(() => {
    Alert.alert(
      '준비 중',
      '첨부파일 다운로드는 Spring REST API 연동 단계에서 연결할 예정입니다.',
    );
  }, []);

  if (attachments.length === 0) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Icon
          color={COLORS.text.primary}
          name="attach-outline"
          size={14}
        />
        <Text style={styles.headerTitle}>첨부파일 ({attachments.length})</Text>
      </View>

      {attachments.map((attachment, index) => (
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.86}
          key={attachment.id}
          onPress={handlePressAttachment}
          style={[
            styles.attachmentRow,
            index > 0 ? styles.attachmentSpacing : null,
          ]}>
          <View style={styles.attachmentInfo}>
            <View style={styles.fileIconWrap}>
              <Icon
                color={COLORS.brand.primaryStrong}
                name="document-text-outline"
                size={16}
              />
            </View>
            <Text numberOfLines={1} style={styles.fileName}>
              {attachment.fileName}
            </Text>
          </View>

          <View style={styles.attachmentMeta}>
            <Text style={styles.fileSize}>{attachment.sizeLabel}</Text>
            <Icon
              color={COLORS.text.muted}
              name="download-outline"
              size={16}
            />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.card,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginBottom: SPACING.md,
  },
  headerTitle: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  attachmentRow: {
    alignItems: 'center',
    backgroundColor: COLORS.background.page,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  attachmentSpacing: {
    marginTop: SPACING.sm,
  },
  attachmentInfo: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: SPACING.sm,
    marginRight: SPACING.sm,
  },
  fileIconWrap: {
    alignItems: 'center',
    backgroundColor: COLORS.brand.primarySoft,
    borderRadius: RADIUS.sm,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  fileName: {
    color: COLORS.text.strong,
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  attachmentMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  fileSize: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
});
