import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Typography } from '../../../constants/theme';
import { successFeedback, errorFeedback } from '../../../utils/haptics';
import { playSuccessSound, playErrorSound } from '../../../utils/audio';

interface ActionButtonsProps {
  onSkip: () => void;
  onCorrect: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ onSkip, onCorrect }) => (
  <View style={styles.row}>
    {/* ── Skip ───────────────────────────────────────────────── */}
    <TouchableOpacity
      onPress={() => { errorFeedback(); playErrorSound(); onSkip(); }}
      activeOpacity={0.75}
      style={styles.btnWrapper}
    >
      <LinearGradient
        colors={['#FF5252', '#C62828']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={styles.btnIcon}>⏭️</Text>
        <Text style={styles.btnLabel}>تخطي</Text>
      </LinearGradient>
    </TouchableOpacity>

    {/* ── Correct ────────────────────────────────────────────── */}
    <TouchableOpacity
      onPress={() => { successFeedback(); playSuccessSound(); onCorrect(); }}
      activeOpacity={0.75}
      style={styles.btnWrapper}
    >
      <LinearGradient
        colors={['#00E676', '#00897B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={styles.btnIcon}>✅</Text>
        <Text style={[styles.btnLabel, styles.correctLabel]}>صح</Text>
      </LinearGradient>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  btnWrapper: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  gradient: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  btnIcon: {
    fontSize: 28,
  },
  btnLabel: {
    ...Typography.subtitle,
    color: Colors.textPrimary,
    fontWeight: '800',
    letterSpacing: 1,
    fontSize: 18,
  },
  correctLabel: {
    color: Colors.background,
  },
});
