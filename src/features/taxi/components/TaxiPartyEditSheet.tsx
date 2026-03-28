import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  COLORS,
  RADIUS,
  SPACING,
} from '@/shared/design-system/tokens';

import {
  buildTaxiInitialPickerDate,
  buildTaxiSelectedDepartureDate,
  formatTaxiDepartureSummary,
} from '../model/taxiDepartureTime';
import {useBottomSheetInputVisibility} from '../hooks/useBottomSheetInputVisibility';
import {TaxiChatBottomSheet} from './TaxiChatBottomSheet';
import {TaxiCreateTimePicker} from './TaxiCreateTimePicker';

interface TaxiPartyEditSheetProps {
  initialDepartureTimeISO: string;
  initialDetail?: string;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: {departureTime: string; detail: string}) => void;
  visible: boolean;
}

const resolveInitialDeparturePickerDate = (initialDepartureTimeISO: string) => {
  const parsed = new Date(initialDepartureTimeISO);
  return Number.isNaN(parsed.getTime()) ? buildTaxiInitialPickerDate() : parsed;
};

export const TaxiPartyEditSheet = ({
  initialDepartureTimeISO,
  initialDetail,
  loading = false,
  onClose,
  onSubmit,
  visible,
}: TaxiPartyEditSheetProps) => {
  const detailDraftRef = React.useRef(initialDetail ?? '');
  const [detailInputKey, setDetailInputKey] = React.useState(0);
  const [selectedHour, setSelectedHour] = React.useState(() => {
    return resolveInitialDeparturePickerDate(initialDepartureTimeISO).getHours();
  });
  const [selectedMinute, setSelectedMinute] = React.useState(() => {
    return resolveInitialDeparturePickerDate(initialDepartureTimeISO).getMinutes();
  });
  const [now, setNow] = React.useState(() => new Date());
  const detailInputRef = React.useRef<TextInput>(null);
  const {createFocusHandler, handleBlur, handleScroll, scrollRef} =
    useBottomSheetInputVisibility(visible);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (!visible) {
      return;
    }

    const nextDate = resolveInitialDeparturePickerDate(initialDepartureTimeISO);
    setSelectedHour(nextDate.getHours());
    setSelectedMinute(nextDate.getMinutes());
    setNow(new Date());
    detailDraftRef.current = initialDetail ?? '';
    setDetailInputKey(current => current + 1);
  }, [initialDepartureTimeISO, initialDetail, visible]);

  const selectedDepartureDate = React.useMemo(
    () =>
      buildTaxiSelectedDepartureDate({
        hour: selectedHour,
        minute: selectedMinute,
        now,
      }),
    [now, selectedHour, selectedMinute],
  );

  const summary = React.useMemo(
    () => ({
      label: formatTaxiDepartureSummary({
        date: selectedDepartureDate.date,
        isTomorrow: selectedDepartureDate.isTomorrow,
      }),
      tone: selectedDepartureDate.isTomorrow ? ('tomorrow' as const) : ('today' as const),
    }),
    [selectedDepartureDate.date, selectedDepartureDate.isTomorrow],
  );

  return (
    <TaxiChatBottomSheet
      enableContentPanningGesture={false}
      onClose={onClose}
      onScroll={handleScroll}
      scrollRef={scrollRef}
      visible={visible}>
      <View style={styles.headerRow}>
        <View style={styles.titleIconWrap}>
          <Icon color={COLORS.accent.blue} name="create-outline" size={16} />
        </View>
        <Text style={styles.title}>파티 수정</Text>
      </View>

      <View style={styles.timePickerWrap}>
        <TaxiCreateTimePicker
          hour={selectedHour}
          minute={selectedMinute}
          summaryLabel={summary.label}
          summaryTone={summary.tone}
          onChangeHour={hour => {
            setSelectedHour(hour);
          }}
          onChangeMinute={minute => {
            setSelectedMinute(minute);
          }}
        />
      </View>

      <View style={styles.detailSection}>
        <Text style={styles.fieldLabel}>상세 설명</Text>
        <TextInput
          autoCorrect={false}
          defaultValue={detailDraftRef.current}
          key={detailInputKey}
          multiline
          onBlur={handleBlur}
          onFocus={createFocusHandler(detailInputRef)}
          placeholder="파티 설명을 입력하세요"
          placeholderTextColor={COLORS.text.placeholder}
          ref={detailInputRef}
          selectionColor={COLORS.brand.primary}
          spellCheck={false}
          style={styles.detailInput}
          textAlignVertical="top"
          onChangeText={text => {
            detailDraftRef.current = text;
          }}
        />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.84}
          onPress={onClose}
          style={[styles.button, styles.cancelButton]}>
          <Text style={styles.cancelButtonLabel}>취소</Text>
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={loading ? 1 : 0.84}
          disabled={loading}
          onPress={() => {
            onSubmit({
              departureTime: selectedDepartureDate.date.toISOString(),
              detail: detailDraftRef.current.trim(),
            });
          }}
          style={[styles.button, styles.submitButton]}>
          <Text style={styles.submitButtonLabel}>
            {loading ? '수정 중...' : '수정하기'}
          </Text>
        </TouchableOpacity>
      </View>
    </TaxiChatBottomSheet>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    flex: 1,
    height: 48,
    justifyContent: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xl,
  },
  cancelButton: {
    backgroundColor: COLORS.background.subtle,
  },
  cancelButtonLabel: {
    color: COLORS.text.secondary,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  detailInput: {
    backgroundColor: COLORS.background.page,
    borderColor: COLORS.border.subtle,
    borderRadius: 12,
    borderWidth: 1,
    color: COLORS.text.primary,
    fontSize: 14,
    lineHeight: 16,
    minHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  detailSection: {
    marginTop: SPACING.lg,
  },
  fieldLabel: {
    color: COLORS.text.secondary,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    marginBottom: 6,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  submitButton: {
    backgroundColor: COLORS.brand.primary,
  },
  submitButtonLabel: {
    color: COLORS.text.inverse,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  timePickerWrap: {
    marginTop: SPACING.lg,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  titleIconWrap: {
    alignItems: 'center',
    backgroundColor: COLORS.accent.blueSoft,
    borderRadius: RADIUS.pill,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
});
