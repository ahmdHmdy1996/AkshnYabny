import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../../../constants/theme';

const OPTIONS = [60, 70, 80, 90] as const;
type TimerOption = typeof OPTIONS[number];

interface TimerPickerProps {
  value: number;
  onChange: (seconds: TimerOption) => void;
}

export const TimerPicker: React.FC<TimerPickerProps> = ({ value, onChange }) => (
  <View style={styles.wrapper}>
    <Text style={styles.label}>مدة الجولة</Text>
    <View style={styles.row}>
      {OPTIONS.map((opt) => {
        const active = value === opt;
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => onChange(opt)}
            activeOpacity={0.7}
            style={[styles.pill, active && styles.pillActive]}
          >
            <Text style={[styles.pillNumber, active && styles.pillNumberActive]}>
              {opt}
            </Text>
            <Text style={[styles.pillSub, active && styles.pillSubActive]}>
              ثانية
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
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
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
  pillNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textTertiary,
    lineHeight: 26,
  },
  pillNumberActive: {
    color: Colors.goldLight,
  },
  pillSub: {
    ...Typography.caption,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
  },
  pillSubActive: {
    color: Colors.gold,
  },
});
