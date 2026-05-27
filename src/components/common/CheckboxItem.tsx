import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Typography, Spacing } from '../../constants/theme';

interface CheckboxItemProps {
  label: string;
  emoji?: string;
  checked: boolean;
  onToggle: () => void;
  style?: ViewStyle;
}

export const CheckboxItem: React.FC<CheckboxItemProps> = ({
  label,
  emoji,
  checked,
  onToggle,
  style,
}) => (
  <TouchableOpacity
    onPress={onToggle}
    activeOpacity={0.7}
    style={[styles.row, checked && styles.rowChecked, style]}
  >
    <View style={[styles.box, checked && styles.boxChecked]}>
      {checked && <Text style={styles.tick}>✓</Text>}
    </View>

    {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}

    <Text style={[styles.label, checked && styles.labelChecked]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row-reverse',   // RTL: tick on the right for Arabic
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: 'rgba(255,255,255,0.03)',
    gap: Spacing.sm,
  },
  rowChecked: {
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.goldDim,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.sm - 2,
    borderWidth: 2,
    borderColor: Colors.textTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    borderColor: Colors.gold,
    backgroundColor: Colors.gold,
  },
  tick: {
    color: Colors.background,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 16,
  },
  emoji: {
    fontSize: 22,
  },
  label: {
    ...Typography.body,
    color: Colors.textSecondary,
    flex: 1,
    textAlign: 'right',
  },
  labelChecked: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
});
