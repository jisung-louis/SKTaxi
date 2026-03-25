import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import {COLORS, SPACING} from '../tokens';

interface FormFieldProps {
  children: React.ReactNode;
  counterLabel?: string;
  label: string;
  optionalLabel?: string;
  required?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const FormField = ({
  children,
  counterLabel,
  label,
  optionalLabel,
  required = false,
  style,
}: FormFieldProps) => {
  return (
    <View style={style}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {required ? <Text style={styles.required}>*</Text> : null}
        {optionalLabel ? <Text style={styles.optional}>{optionalLabel}</Text> : null}
      </View>

      {children}

      {counterLabel ? (
        <Text style={styles.counterLabel}>{counterLabel}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  labelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  label: {
    color: COLORS.text.strong,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  required: {
    color: COLORS.brand.primary,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    marginLeft: 2,
  },
  optional: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
    marginLeft: 6,
  },
  counterLabel: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
    textAlign: 'right',
  },
});
