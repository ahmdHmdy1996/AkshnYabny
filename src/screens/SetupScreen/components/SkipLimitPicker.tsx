import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../../../constants/theme';

interface SkipOption {
  value: number | null;
  label: string;
  sub: string;
}

const OPTIONS: SkipOption[] = [
  { value: 0,    label: '٠',  sub: 'بدون تخطي' },
  { value: 1,    label: '١',  sub: 'تخطي' },
  { value: 2,    label: '٢',  sub: 'تخطيات' },
  { value: 3,    label: '٣',  sub: 'تخطيات' },
  { value: null, label: '∞',  sub: 'بلا حد' },
];

interface SkipLimitPickerProps {
  value: number | null;
  onChange: (limit: number | null) => void;
}

export const SkipLimitPicker: React.FC<SkipLimitPickerProps> = ({ value, onChange }) => (
  <View style={styles.wrapper}>
    <Text style={styles.label}>التخطي المسموح</Text>
    <View style={styles.row}>
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        const isInfinity = opt.value === null;
        const isZero = opt.value === 0;
        return (
          <TouchableOpacity
            key={String(opt.value)}
            onPress={() => onChange(opt.value)}
            activeOpacity={0.7}
            style={[
              styles.pill,
              active && styles.pillActive,
              isZero && active && styles.pillZeroActive,
            ]}
          >
            <Text
              style={[
                styles.pillNumber,
                active && styles.pillNumberActive,
                isInfinity && styles.pillInfinity,
                isZero && styles.pillZeroNumber,
                isZero && active && styles.pillZeroNumberActive,
              ]}
            >
              {opt.label}
            </Text>
            <Text style={[styles.pillSub, active && styles.pillSubActive]}>
              {opt.sub}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.sm,
  },
  label: {
    ...Typography.label,
    color: Colors.textTertiary,
    textAlign: 'right',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  pill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.borderSubtle,
    backgroundColor: 'rgba(255,255,255,0.03)',
    gap: 2,
  },
  pillActive: {
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.goldDim,
  },
  pillZeroActive: {
    borderColor: 'rgba(255,100,100,0.5)',
    backgroundColor: 'rgba(255,80,80,0.1)',
  },
  pillNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textTertiary,
    lineHeight: 24,
  },
  pillNumberActive: {
    color: Colors.goldLight,
  },
  pillZeroNumber: {
    fontSize: 20,
  },
  pillZeroNumberActive: {
    color: '#FF7070',
  },
  pillInfinity: {
    fontSize: 26,
    lineHeight: 30,
  },
  pillSub: {
    ...Typography.caption,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
    fontSize: 9,
    textAlign: 'center',
  },
  pillSubActive: {
    color: Colors.gold,
  },
});
