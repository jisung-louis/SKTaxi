import React from 'react';
import {
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import type {NoticeAttachment} from '../model/types';
import {COLORS, RADIUS, SHADOWS, SPACING} from '@/shared/design-system/tokens';

interface NoticeDetailAttachmentsProps {
  attachments: NoticeAttachment[];
}

export const NoticeDetailAttachments = ({
  attachments,
}: NoticeDetailAttachmentsProps) => {
  const openAttachmentUrl = React.useCallback(
    (url: string | undefined, errorMessage: string) => {
      const targetUrl = url?.trim();

      if (!targetUrl) {
        Alert.alert('안내', errorMessage);
        return;
      }

      Linking.openURL(targetUrl).catch(openError => {
        Alert.alert(
          '오류',
          openError instanceof Error ? openError.message : errorMessage,
        );
      });
    },
    [],
  );

  const handlePreviewAttachment = React.useCallback(
    (attachment: NoticeAttachment) => {
      openAttachmentUrl(
        attachment.previewUrl || attachment.downloadUrl,
        '첨부파일 미리보기를 열 수 없습니다.',
      );
    },
    [openAttachmentUrl],
  );

  const handleDownloadAttachment = React.useCallback(
    (attachment: NoticeAttachment) => {
      openAttachmentUrl(
        attachment.downloadUrl || attachment.previewUrl,
        '첨부파일 다운로드를 시작할 수 없습니다.',
      );
    },
    [openAttachmentUrl],
  );

  const getPreviewLabel = React.useCallback((attachment: NoticeAttachment) => {
    if (attachment.previewUrl?.trim()) {
      return '미리보기';
    }

    return '다운로드';
  }, []);

  if (attachments.length === 0) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Icon color={COLORS.text.primary} name="attach-outline" size={14} />
        <Text style={styles.headerTitle}>첨부파일 ({attachments.length})</Text>
      </View>

      {attachments.map((attachment, index) => (
        <View
          key={`${attachment.name}-${index}`}
          style={[
            styles.attachmentRow,
            index > 0 ? styles.attachmentSpacing : null,
          ]}>
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.86}
            onPress={() => handlePreviewAttachment(attachment)}
            style={styles.previewButton}>
            <View style={styles.attachmentInfo}>
              <View style={styles.fileIconWrap}>
                <Icon
                  color={COLORS.brand.primaryStrong}
                  name="document-text-outline"
                  size={16}
                />
              </View>
              <Text numberOfLines={1} style={styles.fileName}>
                {attachment.name}
              </Text>
            </View>

            <View style={styles.attachmentMeta}>
              <Text style={styles.actionLabel}>
                {getPreviewLabel(attachment)}
              </Text>
              <Icon
                color={COLORS.text.muted}
                name="chevron-forward-outline"
                size={14}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityLabel={`${attachment.name} 다운로드`}
            accessibilityRole="button"
            activeOpacity={0.86}
            onPress={() => handleDownloadAttachment(attachment)}
            style={styles.downloadButton}>
            <Icon
              color={COLORS.brand.primaryStrong}
              name="download-outline"
              size={16}
            />
          </TouchableOpacity>
        </View>
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
    gap: SPACING.sm,
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
  previewButton: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    gap: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  actionLabel: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  downloadButton: {
    alignItems: 'center',
    backgroundColor: COLORS.brand.primaryTint,
    borderRadius: RADIUS.sm,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
});
