import React from 'react';
import {useBottomSheetInternal} from '@gorhom/bottom-sheet';
import {
  type NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type TextInputFocusEventData,
  type TextInputProps,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  COLORS,
  RADIUS,
  SPACING,
} from '@/shared/design-system/tokens';

import {TaxiChatBottomSheet} from './TaxiChatBottomSheet';
import {TaxiCreateTimePicker} from './TaxiCreateTimePicker';

const KeyboardAwareBottomSheetTextInput = React.forwardRef<
  TextInput,
  TextInputProps
>(({onBlur, onFocus, ...rest}, ref) => {
  const {shouldHandleKeyboardEvents} = useBottomSheetInternal();

  const handleFocus = React.useCallback(
    (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
      shouldHandleKeyboardEvents.value = true;
      onFocus?.(event);
    },
    [onFocus, shouldHandleKeyboardEvents],
  );

  const handleBlur = React.useCallback(
    (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
      shouldHandleKeyboardEvents.value = false;
      onBlur?.(event);
    },
    [onBlur, shouldHandleKeyboardEvents],
  );

  React.useEffect(() => {
    return () => {
      shouldHandleKeyboardEvents.value = false;
    };
  }, [shouldHandleKeyboardEvents]);

  return <TextInput {...rest} onBlur={handleBlur} onFocus={handleFocus} ref={ref} />;
});

KeyboardAwareBottomSheetTextInput.displayName =
  'KeyboardAwareBottomSheetTextInput';

interface TaxiPartyEditSheetProps {
  initialDepartureTimeISO: string;
  initialDetail?: string;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: {departureTime: string; detail: string}) => void;
  visible: boolean;
}

const buildSummary = (date: Date) => {
  const now = new Date();
  const selectedMinutes = date.getHours() * 60 + date.getMinutes();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const isTomorrow = selectedMinutes < currentMinutes;
  const meridiem = date.getHours() >= 12 ? '오후' : '오전';
  const hour12 = date.getHours() % 12 || 12;
  const minute = `${date.getMinutes()}`.padStart(2, '0');
  const dayLabel = isTomorrow ? '내일' : '오늘';

  return {
    label: `${dayLabel} ${
      date.getMonth() + 1
    }월 ${date.getDate()}일 ${meridiem} ${`${hour12}`.padStart(
      2,
      '0',
    )}:${minute} 출발`,
    tone: isTomorrow ? ('tomorrow' as const) : ('today' as const),
  };
};

export const TaxiPartyEditSheet = ({
  initialDepartureTimeISO,
  initialDetail,
  loading = false,
  onClose,
  onSubmit,
  visible,
}: TaxiPartyEditSheetProps) => {
  const [detail, setDetail] = React.useState(initialDetail ?? '');
  const [selectedDate, setSelectedDate] = React.useState(() => {
    const parsed = new Date(initialDepartureTimeISO);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  });

  React.useEffect(() => {
    if (!visible) {
      return;
    }

    const parsed = new Date(initialDepartureTimeISO);
    setSelectedDate(Number.isNaN(parsed.getTime()) ? new Date() : parsed);
    setDetail(initialDetail ?? '');
  }, [initialDepartureTimeISO, initialDetail, visible]);

  const summary = React.useMemo(() => buildSummary(selectedDate), [selectedDate]);

  return (
    <TaxiChatBottomSheet onClose={onClose} visible={visible}>
      <View style={styles.headerRow}>
        <View style={styles.titleIconWrap}>
          <Icon color={COLORS.accent.blue} name="create-outline" size={16} />
        </View>
        <Text style={styles.title}>파티 수정</Text>
      </View>

      <View style={styles.timePickerWrap}>
        <TaxiCreateTimePicker
          hour={selectedDate.getHours()}
          minute={selectedDate.getMinutes()}
          summaryLabel={summary.label}
          summaryTone={summary.tone}
          onChangeHour={hour => {
            setSelectedDate(current => {
              const nextDate = new Date(current);
              nextDate.setHours(hour);
              return nextDate;
            });
          }}
          onChangeMinute={minute => {
            setSelectedDate(current => {
              const nextDate = new Date(current);
              nextDate.setMinutes(minute);
              return nextDate;
            });
          }}
        />
      </View>

      <View style={styles.detailSection}>
        <Text style={styles.fieldLabel}>상세 설명</Text>
        <KeyboardAwareBottomSheetTextInput
          multiline
          placeholder="파티 설명을 입력하세요"
          placeholderTextColor={COLORS.text.placeholder}
          selectionColor={COLORS.brand.primary}
          style={styles.detailInput}
          textAlignVertical="top"
          value={detail}
          onChangeText={setDetail}
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
              departureTime: selectedDate.toISOString(),
              detail: detail.trim(),
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
    lineHeight: 20,
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
