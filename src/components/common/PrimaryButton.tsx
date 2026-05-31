/**
 * PrimaryButton — CINEMA ROYALE edition
 *
 * Variants:
 *   default (solid) — rich gold gradient (bright → warm → deep)
 *   glassVariant    — frosted glass with gold border, for dark overlaid surfaces
 *
 * The disabled state collapses to a flat dark surface (no glow, low opacity).
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors, BorderRadius, Typography, Shadow } from '../../constants/theme';
import { lightImpact } from '../../utils/haptics';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  /** Render as a frosted-glass gold-border button instead of solid gradient. */
  glassVariant?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
  glassVariant = false,
}) => {
  const isInert = disabled || loading;

  const handlePress = () => {
    if (isInert) return;
    lightImpact();
    onPress();
  };

  // ── Glass variant ──────────────────────────────────────────────────────────
  if (glassVariant) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={isInert}
        activeOpacity={0.82}
        style={[
          styles.glassOuter,
          isInert && styles.disabled,
          !isInert && Shadow.goldGlow,
          style,
        ]}
      >
        {Platform.OS === 'ios' ? (
          <BlurView intensity={60} tint="dark" style={styles.blurInner}>
            <LinearGradient
              colors={['rgba(255,184,0,0.22)', 'rgba(255,184,0,0.06)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.glassContent}
            >
              {loading ? (
                <ActivityIndicator color={Colors.goldLight} size="small" />
              ) : (
                <Text style={[styles.glassLabel, textStyle]}>{label}</Text>
              )}
            </LinearGradient>
          </BlurView>
        ) : (
          <View style={styles.glassAndroid}>
            {loading ? (
              <ActivityIndicator color={Colors.goldLight} size="small" />
            ) : (
              <Text style={[styles.glassLabel, textStyle]}>{label}</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // ── Solid gradient variant (default) ──────────────────────────────────────
  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isInert}
      activeOpacity={0.78}
      style={[
        styles.wrapper,
        isInert && styles.disabled,
        !isInert && Shadow.gold,
        style,
      ]}
    >
      <LinearGradient
        colors={
          isInert
            ? ['#1A1C2A', '#0F1018']
            : [Colors.goldLight, Colors.gold, Colors.goldDeep]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color={Colors.background} size="small" />
        ) : (
          <Text style={[styles.solidLabel, textStyle]}>{label}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Solid gradient
  wrapper: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: 17,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  solidLabel: {
    ...Typography.subtitle,
    color: '#04050C',
    fontWeight: '700',
    letterSpacing: 1.2,
  },

  // ── Glass variant outer shell
  glassOuter: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.goldBorder,
  },
  blurInner: {
    borderRadius: BorderRadius.full,
  },
  glassContent: {
    paddingVertical: 17,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassAndroid: {
    paddingVertical: 17,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,184,0,0.14)',
  },
  glassLabel: {
    ...Typography.subtitle,
    color: Colors.goldLight,
    fontWeight: '700',
    letterSpacing: 1.4,
  },

  // ── Shared disabled state
  disabled: {
    opacity: 0.40,
  },
});
