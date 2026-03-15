import React from 'react';

import {taxiRecruitRepository} from '../data/repositories/taxiRecruitRepository';
import {
  DEPARTURE_OPTIONS,
  DESTINATION_OPTIONS,
} from '../model/constants';
import type {
  TaxiRecruitDraft,
  TaxiRecruitLocationMode,
  TaxiRecruitSubmitResult,
} from '../model/taxiRecruitData';

const PRESET_TAG_OPTIONS = [
  '#여성전용',
  '#조용히',
  '#빠른출발',
  '#흡연자환영',
  '#짐많음',
  '#대화환영',
] as const;

const MAX_MEMBER_OPTIONS = [2, 3, 4, 5, 6, 7] as const;
const DAY_OFFSET_TOMORROW = 1 as const;
const DAY_OFFSET_TODAY = 0 as const;

const normalizeLocationLabel = (value: string) => value.trim();

const formatTagValue = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
};

const buildSelectedDate = (hour: number, minute: number, now: Date) => {
  const selectedDate = new Date(now);
  selectedDate.setHours(hour, minute, 0, 0);

  const selectedMinutes = hour * 60 + minute;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const isTomorrow = selectedMinutes < currentMinutes;

  if (isTomorrow) {
    selectedDate.setDate(selectedDate.getDate() + 1);
  }

  return {
    date: selectedDate,
    dayOffset: isTomorrow ? DAY_OFFSET_TOMORROW : DAY_OFFSET_TODAY,
    isTomorrow,
  };
};

const formatDepartureSummary = (date: Date, isTomorrow: boolean) => {
  const meridiem = date.getHours() >= 12 ? '오후' : '오전';
  const hour12 = date.getHours() % 12 || 12;
  const minute = `${date.getMinutes()}`.padStart(2, '0');
  const dayLabel = isTomorrow ? '내일' : '오늘';

  return `${dayLabel} ${date.getMonth() + 1}월 ${date.getDate()}일 ${meridiem} ${`${hour12}`.padStart(2, '0')}:${minute} 출발`;
};

const getLocationLabel = (
  mode: TaxiRecruitLocationMode,
  presetValue: string,
  customValue: string,
) => (mode === 'custom' ? normalizeLocationLabel(customValue) : presetValue);

export interface UseTaxiRecruitFormResult {
  canSubmit: boolean;
  customTagInput: string;
  departure: {
    customValue: string;
    disabledLabel: string | null;
    mode: TaxiRecruitLocationMode;
    options: typeof DEPARTURE_OPTIONS;
    selectedLabel: string;
  };
  departureTime: {
    hour: number;
    minute: number;
    summaryLabel: string;
    summaryTone: 'today' | 'tomorrow';
  };
  detail: string;
  destination: {
    customValue: string;
    disabledLabel: string | null;
    mode: TaxiRecruitLocationMode;
    options: typeof DESTINATION_OPTIONS;
    selectedLabel: string;
  };
  isSubmitting: boolean;
  maxMemberOptions: readonly number[];
  maxMembers: number;
  selectedTags: string[];
  tagOptions: readonly string[];
  addCustomTag: () => void;
  removeTag: (tag: string) => void;
  selectDepartureCustom: () => void;
  selectDeparturePreset: (label: string) => void;
  selectDestinationCustom: () => void;
  selectDestinationPreset: (label: string) => void;
  selectHour: (hour: number) => void;
  selectMaxMembers: (value: number) => void;
  selectMinute: (minute: number) => void;
  setCustomDepartureValue: (value: string) => void;
  setCustomDestinationValue: (value: string) => void;
  setCustomTagInput: (value: string) => void;
  setDetail: (value: string) => void;
  submitForm: () => Promise<TaxiRecruitSubmitResult>;
  togglePresetTag: (tag: string) => void;
}

export const useTaxiRecruitForm = (): UseTaxiRecruitFormResult => {
  const [departureMode, setDepartureMode] =
    React.useState<TaxiRecruitLocationMode>('preset');
  const [departurePreset, setDeparturePreset] = React.useState('');
  const [customDeparture, setCustomDeparture] = React.useState('');

  const [destinationMode, setDestinationMode] =
    React.useState<TaxiRecruitLocationMode>('preset');
  const [destinationPreset, setDestinationPreset] = React.useState('');
  const [customDestination, setCustomDestination] = React.useState('');

  const [customTagInput, setCustomTagInput] = React.useState('');
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [detail, setDetail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [maxMembers, setMaxMembers] = React.useState(4);

  const initialDate = React.useMemo(() => new Date(), []);
  const [selectedHour, setSelectedHour] = React.useState(initialDate.getHours());
  const [selectedMinute, setSelectedMinute] = React.useState(
    initialDate.getMinutes(),
  );
  const [now, setNow] = React.useState(() => new Date());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const departureLabel = React.useMemo(
    () =>
      getLocationLabel(departureMode, departurePreset, customDeparture),
    [customDeparture, departureMode, departurePreset],
  );
  const destinationLabel = React.useMemo(
    () =>
      getLocationLabel(destinationMode, destinationPreset, customDestination),
    [customDestination, destinationMode, destinationPreset],
  );

  const selectedDepartureDate = React.useMemo(
    () => buildSelectedDate(selectedHour, selectedMinute, now),
    [now, selectedHour, selectedMinute],
  );

  const summaryLabel = React.useMemo(
    () =>
      formatDepartureSummary(
        selectedDepartureDate.date,
        selectedDepartureDate.isTomorrow,
      ),
    [selectedDepartureDate.date, selectedDepartureDate.isTomorrow],
  );

  const normalizedDepartureLabel = React.useMemo(
    () => normalizeLocationLabel(departureLabel),
    [departureLabel],
  );
  const normalizedDestinationLabel = React.useMemo(
    () => normalizeLocationLabel(destinationLabel),
    [destinationLabel],
  );

  const canSubmit = React.useMemo(() => {
    if (!normalizedDepartureLabel || !normalizedDestinationLabel) {
      return false;
    }

    return normalizedDepartureLabel !== normalizedDestinationLabel;
  }, [normalizedDepartureLabel, normalizedDestinationLabel]);

  const draft = React.useMemo<TaxiRecruitDraft>(
    () => ({
      departure: {
        label: normalizedDepartureLabel,
        mode: departureMode,
      },
      departureAtISO: selectedDepartureDate.date.toISOString(),
      departureDayOffset: selectedDepartureDate.dayOffset,
      destination: {
        label: normalizedDestinationLabel,
        mode: destinationMode,
      },
      detail: detail.trim(),
      maxMembers,
      tags: selectedTags,
    }),
    [
      departureMode,
      detail,
      destinationMode,
      maxMembers,
      normalizedDepartureLabel,
      normalizedDestinationLabel,
      selectedDepartureDate.date,
      selectedDepartureDate.dayOffset,
      selectedTags,
    ],
  );

  const selectDeparturePreset = React.useCallback((label: string) => {
    setDepartureMode('preset');
    setDeparturePreset(label);
  }, []);

  const selectDestinationPreset = React.useCallback((label: string) => {
    setDestinationMode('preset');
    setDestinationPreset(label);
  }, []);

  const selectDepartureCustom = React.useCallback(() => {
    setDepartureMode('custom');
  }, []);

  const selectDestinationCustom = React.useCallback(() => {
    setDestinationMode('custom');
  }, []);

  const selectHour = React.useCallback((hour: number) => {
    React.startTransition(() => {
      setSelectedHour(hour);
    });
  }, []);

  const selectMinute = React.useCallback((minute: number) => {
    React.startTransition(() => {
      setSelectedMinute(minute);
    });
  }, []);

  const togglePresetTag = React.useCallback((tag: string) => {
    setSelectedTags(current =>
      current.includes(tag)
        ? current.filter(item => item !== tag)
        : [...current, tag],
    );
  }, []);

  const addCustomTag = React.useCallback(() => {
    const nextTag = formatTagValue(customTagInput);

    if (!nextTag) {
      return;
    }

    setSelectedTags(current => {
      if (current.includes(nextTag)) {
        return current;
      }

      return [...current, nextTag];
    });
    setCustomTagInput('');
  }, [customTagInput]);

  const removeTag = React.useCallback((tag: string) => {
    setSelectedTags(current => current.filter(item => item !== tag));
  }, []);

  const submitForm = React.useCallback(async () => {
    if (!canSubmit || isSubmitting) {
      return {
        message:
          '출발지와 도착지를 모두 입력하고 서로 다른 장소로 선택해주세요.',
        status: 'mocked' as const,
      };
    }

    setIsSubmitting(true);

    try {
      return await taxiRecruitRepository.submitRecruit(draft);
    } finally {
      setIsSubmitting(false);
    }
  }, [canSubmit, draft, isSubmitting]);

  return {
    addCustomTag,
    canSubmit,
    customTagInput,
    departure: {
      customValue: customDeparture,
      disabledLabel:
        destinationMode === 'preset' ? destinationPreset || null : null,
      mode: departureMode,
      options: DEPARTURE_OPTIONS,
      selectedLabel: departureLabel,
    },
    departureTime: {
      hour: selectedHour,
      minute: selectedMinute,
      summaryLabel,
      summaryTone: selectedDepartureDate.isTomorrow ? 'tomorrow' : 'today',
    },
    detail,
    destination: {
      customValue: customDestination,
      disabledLabel:
        departureMode === 'preset' ? departurePreset || null : null,
      mode: destinationMode,
      options: DESTINATION_OPTIONS,
      selectedLabel: destinationLabel,
    },
    isSubmitting,
    maxMemberOptions: MAX_MEMBER_OPTIONS,
    maxMembers,
    removeTag,
    selectDepartureCustom,
    selectDeparturePreset,
    selectDestinationCustom,
    selectDestinationPreset,
    selectHour,
    selectMaxMembers: setMaxMembers,
    selectMinute,
    selectedTags,
    setCustomDepartureValue: setCustomDeparture,
    setCustomDestinationValue: setCustomDestination,
    setCustomTagInput,
    setDetail,
    submitForm,
    tagOptions: PRESET_TAG_OPTIONS,
    togglePresetTag,
  };
};
