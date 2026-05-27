import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../../../constants/theme';

interface CrazyRuleCardProps {
  rule: string;
}

export const CrazyRuleCard: React.FC<CrazyRuleCardProps> = ({ rule }) => (
  <View style={styles.container}>
    <Text style={styles.icon}>🎲</Text>
    <View style={styles.textGroup}>
      <Text style={styles.eyebrow}>حكم الجولة</Text>
      <Text style={styles.rule}>{rule}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',   // RTL
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 200, 0, 0.5)',
    backgroundColor: 'rgba(255, 180, 0, 0.08)',
  },
  icon: {
    fontSize: 28,
  },
  textGroup: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 3,
  },
  eyebrow: {
    ...Typography.caption,
    color: Colors.gold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  rule: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    textAlign: 'right',
    lineHeight: 22,
  },
});
