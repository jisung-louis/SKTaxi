import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import {V2_COLORS, V2_SPACING} from '../tokens';

interface V2FormFieldProps {
  children: React.ReactNode;
  counterLabel?: string;
  label: string;
  optionalLabel?: string;
  required?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const V2FormField = ({
  children,
  counterLabel,
  label,
  optionalLabel,
  required = false,
  style,
}: V2FormFieldProps) => {
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
    marginBottom: V2_SPACING.sm,
  },
  label: {
    color: V2_COLORS.text.strong,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  required: {
    color: V2_COLORS.brand.primary,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    marginLeft: 2,
  },
  optional: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
    marginLeft: 6,
  },
  counterLabel: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
    textAlign: 'right',
  },
});
