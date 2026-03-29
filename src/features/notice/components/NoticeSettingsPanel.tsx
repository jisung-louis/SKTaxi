import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {ToggleSwitch} from '@/shared/design-system/components';
import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
} from '@/shared/design-system/tokens';

import {NOTICE_CATEGORIES, getCategorySettingKey} from '../model/constants';

interface NoticeSettingsPanelProps {
  visible: boolean;
  onClose: () => void;
  noticeSettings: {
    noticeNotifications: boolean;
    noticeNotificationsDetail?: Record<string, boolean>;
  };
  onUpdateMaster: (enabled: boolean) => void | Promise<void>;
  onUpdateDetail: (key: string, enabled: boolean) => void | Promise<void>;
  saving?: boolean;
}

interface NoticeItemVisualConfig {
  iconBackgroundColor: string;
  iconColor: string;
  iconName: string;
}

const SHEET_SNAP_POINTS = ['88%'];

const CATEGORY_VISUALS: Record<string, NoticeItemVisualConfig> = {
  news: {
    iconBackgroundColor: COLORS.accent.blueSoft,
    iconColor: COLORS.accent.blue,
    iconName: 'newspaper-outline',
  },
  academy: {
    iconBackgroundColor: COLORS.accent.blueSoft,
    iconColor: COLORS.accent.blue,
    iconName: 'school-outline',
  },
  student: {
    iconBackgroundColor: COLORS.accent.yellowSoft,
    iconColor: COLORS.accent.yellowStrong,
    iconName: 'people-outline',
  },
  scholarship: {
    iconBackgroundColor: COLORS.accent.purpleSoft,
    iconColor: COLORS.accent.purple,
    iconName: 'ribbon-outline',
  },
  admission: {
    iconBackgroundColor: COLORS.accent.blueSoft,
    iconColor: COLORS.accent.blue,
    iconName: 'person-add-outline',
  },
  career: {
    iconBackgroundColor: COLORS.accent.orangeSoft,
    iconColor: COLORS.accent.orange,
    iconName: 'briefcase-outline',
  },
  event: {
    iconBackgroundColor: COLORS.accent.pinkSoft,
    iconColor: COLORS.accent.pink,
    iconName: 'calendar-clear-outline',
  },
  education: {
    iconBackgroundColor: COLORS.brand.primaryTint,
    iconColor: COLORS.brand.primaryStrong,
    iconName: 'globe-outline',
  },
  general: {
    iconBackgroundColor: COLORS.background.subtle,
    iconColor: COLORS.text.secondary,
    iconName: 'notifications-outline',
  },
  procurement: {
    iconBackgroundColor: COLORS.accent.yellowSoft,
    iconColor: COLORS.accent.yellowStrong,
    iconName: 'cart-outline',
  },
  volunteer: {
    iconBackgroundColor: COLORS.accent.pinkSoft,
    iconColor: COLORS.accent.pink,
    iconName: 'heart-outline',
  },
  accessibility: {
    iconBackgroundColor: COLORS.accent.blueSoft,
    iconColor: COLORS.accent.blue,
    iconName: 'accessibility-outline',
  },
  dormitory: {
    iconBackgroundColor: COLORS.background.subtle,
    iconColor: COLORS.text.secondary,
    iconName: 'home-outline',
  },
  extracurricular: {
    iconBackgroundColor: COLORS.accent.orangeSoft,
    iconColor: COLORS.accent.orange,
    iconName: 'rocket-outline',
  },
};

const NoticeSettingsRow = ({
  accessibilityLabel,
  disabled = false,
  iconBackgroundColor,
  iconColor,
  iconName,
  onToggle,
  subtitle,
  title,
  toggleDisabled = false,
  toggleSize = 'compact',
  toggleValue,
  variant = 'default',
}: {
  accessibilityLabel?: string;
  disabled?: boolean;
  iconBackgroundColor: string;
  iconColor: string;
  iconName: string;
  onToggle: (nextValue: boolean) => void;
  subtitle?: string;
  title: string;
  toggleDisabled?: boolean;
  toggleSize?: 'compact' | 'default' | 'large';
  toggleValue: boolean;
  variant?: 'default' | 'highlight';
}) => {
  return (
    <View
      style={[
        styles.row,
        variant === 'highlight' ? styles.highlightRow : styles.defaultRow,
        disabled ? styles.rowDisabled : undefined,
      ]}>
      <View style={styles.rowLeft}>
        <View
          style={[
            styles.iconWrap,
            {backgroundColor: iconBackgroundColor},
            variant === 'highlight' ? styles.highlightIconWrap : undefined,
          ]}>
          <Icon
            color={iconColor}
            name={iconName}
            size={variant === 'highlight' ? 18 : 16}
          />
        </View>

        <View style={styles.textWrap}>
          <Text
            numberOfLines={1}
            style={[
              styles.rowTitle,
              variant === 'highlight' ? styles.highlightRowTitle : undefined,
            ]}>
            {title}
          </Text>

          {subtitle ? (
            <Text numberOfLines={1} style={styles.rowSubtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      <ToggleSwitch
        accessibilityLabel={accessibilityLabel ?? title}
        disabled={toggleDisabled || disabled}
        onValueChange={onToggle}
        size={toggleSize}
        value={toggleValue}
      />
    </View>
  );
};

export function NoticeSettingsPanel({
  visible,
  onClose,
  noticeSettings,
  onUpdateMaster,
  onUpdateDetail,
  saving = false,
}: NoticeSettingsPanelProps) {
  const insets = useSafeAreaInsets();
  const modalRef = React.useRef<BottomSheetModal>(null);

  const categoryItems = React.useMemo(
    () =>
      NOTICE_CATEGORIES.filter(category => category !== '전체').map(category => {
        const key = getCategorySettingKey(category);
        const visuals = CATEGORY_VISUALS[key] ?? CATEGORY_VISUALS.general;

        return {
          category,
          key,
          visuals,
        };
      }),
    [],
  );

  const renderBackdrop = React.useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.2}
        pressBehavior="close"
      />
    ),
    [],
  );

  React.useEffect(() => {
    const modal = modalRef.current;

    if (!modal) {
      return;
    }

    if (visible) {
      modal.present();
      return;
    }

    modal.dismiss();
  }, [visible]);

  const handleDismiss = React.useCallback(() => {
    if (visible) {
      onClose();
    }
  }, [onClose, visible]);

  const handleMasterToggle = React.useCallback(
    (nextValue: boolean) => {
      Promise.resolve(onUpdateMaster(nextValue)).catch(() => undefined);
    },
    [onUpdateMaster],
  );

  const handleDetailToggle = React.useCallback(
    (key: string, nextValue: boolean) => {
      Promise.resolve(onUpdateDetail(key, nextValue)).catch(() => undefined);
    },
    [onUpdateDetail],
  );

  const handleKeywordToggle = React.useCallback(() => {
    Alert.alert(
      '아직 만들고있어...',
      '키워드 알림은 아직 구현을 못했어요.\n조금만 기둘..',
    );
  }, []);

  const masterEnabled = noticeSettings.noticeNotifications;

  return (
    <BottomSheetModal
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      enableDynamicSizing={false}
      enableOverDrag={false}
      enablePanDownToClose
      handleComponent={null}
      onDismiss={handleDismiss}
      ref={modalRef}
      snapPoints={SHEET_SNAP_POINTS}
      stackBehavior="replace"
      style={styles.sheet}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>알림 설정</Text>
          <TouchableOpacity
            accessibilityLabel="알림 설정 닫기"
            accessibilityRole="button"
            activeOpacity={0.82}
            onPress={onClose}
            style={styles.closeButton}>
            <Icon color={COLORS.text.secondary} name="close" size={18} />
          </TouchableOpacity>
        </View>

        <BottomSheetScrollView
          bounces={false}
          contentContainerStyle={[
            styles.content,
            {paddingBottom: insets.bottom + SPACING.xl},
          ]}
          showsVerticalScrollIndicator={false}>
          <NoticeSettingsRow
            accessibilityLabel="전체 공지 알림"
            iconBackgroundColor={COLORS.brand.primary}
            iconColor={COLORS.text.inverse}
            iconName="notifications"
            onToggle={handleMasterToggle}
            subtitle="모든 공지 알림을 켜거나 끕니다"
            title="전체 알림"
            toggleDisabled={saving}
            toggleSize="large"
            toggleValue={masterEnabled}
            variant="highlight"
          />

          <Text style={styles.sectionTitle}>카테고리별 설정</Text>
          <View style={styles.sectionBody}>
            {categoryItems.map(({category, key, visuals}) => {
              const enabled =
                noticeSettings.noticeNotificationsDetail?.[key] !== false;
              const disabled = !masterEnabled;

              return (
                <NoticeSettingsRow
                  key={`${category}-${key}`}
                  accessibilityLabel={`${category} 알림`}
                  disabled={disabled}
                  iconBackgroundColor={visuals.iconBackgroundColor}
                  iconColor={visuals.iconColor}
                  iconName={visuals.iconName}
                  onToggle={nextValue => handleDetailToggle(key, nextValue)}
                  title={category}
                  toggleDisabled={saving || disabled}
                  toggleValue={enabled}
                />
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>키워드 알림</Text>
          <View style={styles.sectionBody}>
            <NoticeSettingsRow
              accessibilityLabel="키워드 알림 사용"
              iconBackgroundColor={COLORS.background.subtle}
              iconColor={COLORS.text.secondary}
              iconName="pricetags-outline"
              onToggle={handleKeywordToggle}
              subtitle="준비 중"
              title="키워드 알림 사용"
              toggleValue={false}
            />
          </View>
        </BottomSheetScrollView>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    ...SHADOWS.raised,
  },
  sheetBackground: {
    backgroundColor: COLORS.background.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: COLORS.border.subtle,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 18,
    paddingHorizontal: SPACING.xl,
    paddingTop: 18,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 28,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: COLORS.background.subtle,
    borderRadius: RADIUS.pill,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.text.muted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    lineHeight: 16,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
    paddingHorizontal: 4,
  },
  sectionBody: {
    gap: 4,
  },
  row: {
    alignItems: 'center',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  defaultRow: {
    backgroundColor: COLORS.background.surface,
    borderRadius: 12,
  },
  highlightRow: {
    backgroundColor: COLORS.brand.primaryTint,
    minHeight: 66,
  },
  rowDisabled: {
    opacity: 0.48,
  },
  rowLeft: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    marginRight: SPACING.md,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  highlightIconWrap: {
    height: 36,
    width: 36,
  },
  textWrap: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  rowTitle: {
    color: COLORS.text.strong,
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  highlightRowTitle: {
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  rowSubtitle: {
    color: COLORS.text.tertiary,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
});
