/**
 * GlassCard — CINEMA ROYALE glassmorphism container
 *
 * iOS  : expo-blur <BlurView> for true frosted glass.
 * Android: deep dark semi-transparent View with a top highlight shimmer.
 *
 * Props:
 *   intensity   — BlurView strength (iOS only). Default: 45.
 *   goldAccent  — Replace neutral top-edge shimmer with a gold accent line.
 *
 * Usage:
 *   <GlassCard goldAccent innerStyle={...}>...</GlassCard>
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, BorderRadius } from '../../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  innerStyle?: ViewStyle;
  /** BlurView strength (iOS only). Default: 45. */
  intensity?: number;
  /** Replace neutral shimmer with a gold accent line on the top edge. */
  goldAccent?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  innerStyle,
  intensity = 45,
  goldAccent = false,
}) => {
  const edgeColor = goldAccent
    ? 'rgba(255, 184, 0, 0.40)'
    : 'rgba(255, 255, 255, 0.13)';

  if (Platform.OS === 'android') {
    return (
      <View style={[styles.androidCard, style]}>
        {/* Top shimmer — simulates real glass reflection */}
        <View
          style={[styles.topEdge, { backgroundColor: edgeColor }]}
          pointerEvents="none"
        />
        <View style={[styles.inner, innerStyle]}>{children}</View>
      </View>
    );
  }

  return (
    <BlurView intensity={intensity} tint="dark" style={[styles.blurCard, style]}>
      <View
        style={[styles.topEdge, { backgroundColor: edgeColor }]}
        pointerEvents="none"
      />
      <View style={[styles.inner, innerStyle]}>{children}</View>
    </BlurView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── iOS — real blur
  blurCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },

  // ── Android — deep dark surface
  androidCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: 'rgba(8, 10, 22, 0.94)',
  },

  // ── Top edge highlight (1 px)
  topEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    zIndex: 1,
  },

  // ── Content layer — very subtle tint over the blur
  inner: {
    backgroundColor: Colors.glass,
  },
});
