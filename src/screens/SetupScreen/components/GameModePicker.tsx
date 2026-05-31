import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, Shadow } from '../../../constants/theme';

type GameMode = 'single' | 'multiple';

interface GameModePickerProps {
  value: GameMode;
  onChange: (mode: GameMode) => void;
}

interface ModeOption {
  mode: GameMode;
  emoji: string;
  label: string;
  hint: string;
}

const OPTIONS: ModeOption[] = [
  {
    mode: 'single',
    emoji: '🎬',
    label: 'فيلم واحد',
    hint: 'الصح يوقف العداد فوراً',
  },
  {
    mode: 'multiple',
    emoji: '⏱️',
    label: 'أفلام متعددة',
    hint: 'أكبر عدد في ٦٠ ثانية',
  },
];

export const GameModePicker: React.FC<GameModePickerProps> = ({ value, onChange }) => (
  <View style={styles.wrapper}>
    <Text style={styles.heading}>نمط اللعب</Text>

    <View style={styles.pillRow}>
      {OPTIONS.map((opt) => {
        const isActive = value === opt.mode;
        return (
          <TouchableOpacity
            key={opt.mode}
            onPress={() => onChange(opt.mode)}
            activeOpacity={0.75}
            style={[styles.pill, isActive && styles.pillActive, isActive && Shadow.gold]}
          >
            <Text style={styles.pillEmoji}>{opt.emoji}</Text>
            <Text style={[styles.pillLabel, isActive && styles.pillLabelActive]}>
              {opt.label}
            </Text>
            {isActive && <View style={styles.activeDot} />}
          </TouchableOpacity>
        );
      })}
    </View>

    {/* Contextual hint beneath the pills */}
    <Text style={styles.hint}>
      {OPTIONS.find((o) => o.mode === value)?.hint}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.sm,
  },
  heading: {
    ...Typography.label,
    color: Colors.textTertiary,
    textAlign: 'right',
    marginBottom: Spacing.xs,
  },
  pillRow: {
    flexDirection: 'row-reverse',   // RTL: right pill is first visually
    gap: Spacing.sm,
  },
  pill: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  pillActive: {
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.goldDim,
  },
  pillEmoji: {
    fontSize: 28,
  },
  pillLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  pillLabelActive: {
    color: Colors.goldLight,
    fontWeight: '700',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.gold,
    marginTop: 2,
  },
  hint: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'right',
    marginTop: -Spacing.xs,
  },
});
