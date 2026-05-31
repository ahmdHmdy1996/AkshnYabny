/**
 * ActionButtons — CINEMA ROYALE edition
 *
 * Skip   — deep crimson gradient (velvet-curtain red) with ✕ symbol + glow
 * Correct — vivid emerald gradient (green-room neon)  with ✓ symbol + glow
 *
 * Skip is locked (dims) until half-time passes or the skip limit is reached.
 * Hint text shows the −5 s penalty and half-time unlock rule.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Typography } from '../../../constants/theme';
import { successFeedback, errorFeedback } from '../../../utils/haptics';

interface ActionButtonsProps {
  onSkip: () => void;
  onCorrect: () => void;
  /** True while the skip button should be locked (half-time gate or limit hit). */
  isSkipDisabled?: boolean;
  /** Remaining skips for the current team, or null when limit is ∞. */
  skipsRemaining?: number | null;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onSkip,
  onCorrect,
  isSkipDisabled = false,
  skipsRemaining = null,
}) => (
  <View style={styles.container}>
    <View style={styles.row}>

      {/* ── Skip ─────────────────────────────────────────────────────────── */}
      <TouchableOpacity
        onPress={() => {
          if (!isSkipDisabled) {
            errorFeedback();
            onSkip();
          }
        }}
        activeOpacity={isSkipDisabled ? 1 : 0.72}
        disabled={isSkipDisabled}
        style={[
          styles.btnWrapper,
          !isSkipDisabled && styles.skipShadow,
          isSkipDisabled && styles.btnDisabled,
        ]}
      >
        <LinearGradient
          colors={
            isSkipDisabled
              ? ['#2A0A14', '#1A0509']
              : [Colors.crimson, Colors.crimsonDark]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Subtle inner highlight on active state */}
          {!isSkipDisabled && <View style={styles.innerHighlight} />}

          <Text style={[styles.symbol, styles.symbolSkip, isSkipDisabled && styles.symbolDim]}>
            ✕
          </Text>
          <Text style={[styles.btnLabel, isSkipDisabled && styles.btnLabelDim]}>
            {skipsRemaining !== null
              ? `تخطي (${skipsRemaining})`
              : 'تخطي'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* ── Correct ──────────────────────────────────────────────────────── */}
      <TouchableOpacity
        onPress={() => { successFeedback(); onCorrect(); }}
        activeOpacity={0.72}
        style={[styles.btnWrapper, styles.correctShadow]}
      >
        <LinearGradient
          colors={[Colors.emerald, Colors.emeraldDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Subtle inner highlight */}
          <View style={styles.innerHighlight} />

          <Text style={[styles.symbol, styles.symbolCorrect]}>✓</Text>
          <Text style={[styles.btnLabel, styles.correctLabel]}>صح!</Text>
        </LinearGradient>
      </TouchableOpacity>

    </View>

    {/* Contextual hint */}
    <Text style={styles.skipHint}>
      يخصم ٥ ثوانٍ  •  متاح بعد نصف الوقت
    </Text>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },

  // ── Button wrapper
  btnWrapper: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  btnDisabled: {
    opacity: 0.40,
  },
  skipShadow: {
    shadowColor: Colors.crimson,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 14,
  },
  correctShadow: {
    shadowColor: Colors.emerald,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 14,
  },

  // ── Gradient fill
  gradient: {
    paddingVertical: 26,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  // ── Top-left inner shimmer for depth
  innerHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },

  // ── Symbols
  symbol: {
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 34,
  },
  symbolSkip: {
    color: 'rgba(255, 255, 255, 0.92)',
  },
  symbolDim: {
    color: 'rgba(255, 255, 255, 0.28)',
  },
  symbolCorrect: {
    color: Colors.background,
  },

  // ── Labels
  btnLabel: {
    ...Typography.subtitle,
    color: 'rgba(255, 255, 255, 0.90)',
    fontWeight: '800',
    letterSpacing: 1.0,
    fontSize: 17,
  },
  btnLabelDim: {
    color: 'rgba(255, 255, 255, 0.28)',
  },
  correctLabel: {
    color: Colors.background,
    fontWeight: '900',
  },

  // ── Hint text below buttons
  skipHint: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
    letterSpacing: 0.4,
    marginTop: 2,
  },
});
