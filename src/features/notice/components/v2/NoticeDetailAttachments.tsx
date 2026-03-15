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
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
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
          color={V2_COLORS.text.primary}
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
                color={V2_COLORS.brand.primaryStrong}
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
              color={V2_COLORS.text.muted}
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
    backgroundColor: V2_COLORS.background.surface,
    borderRadius: V2_RADIUS.lg,
    padding: V2_SPACING.lg,
    ...V2_SHADOWS.card,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginBottom: V2_SPACING.md,
  },
  headerTitle: {
    color: V2_COLORS.text.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  attachmentRow: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.page,
    borderRadius: V2_RADIUS.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: V2_SPACING.md,
  },
  attachmentSpacing: {
    marginTop: V2_SPACING.sm,
  },
  attachmentInfo: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: V2_SPACING.sm,
    marginRight: V2_SPACING.sm,
  },
  fileIconWrap: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.brand.primarySoft,
    borderRadius: V2_RADIUS.sm,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  fileName: {
    color: V2_COLORS.text.strong,
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  attachmentMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: V2_SPACING.sm,
  },
  fileSize: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
});
