/**
 * CircularTimer — CINEMA ROYALE edition
 *
 * Upgrades vs. previous version:
 *   • SIZE 130  (up from 110) for more visual weight
 *   • STROKE_WIDTH 10  — thicker arc
 *   • Background glow circle changes color in warning (gold → crimson)
 *   • Dual-ring: dim outer track + vivid progress arc
 *   • Warning number turns crimson, ring pulses with intensity
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors, Typography } from '../../../constants/theme';

const SIZE         = 130;
const STROKE_WIDTH = 10;
const RADIUS       = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER       = SIZE / 2;

interface CircularTimerProps {
  timeLeft:  number;
  progress:  number;   // 1.0 → full  |  0.0 → empty
  isWarning: boolean;
}

export const CircularTimer: React.FC<CircularTimerProps> = ({
  timeLeft,
  progress,
  isWarning,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.6)).current;
  const pulseRef  = useRef<Animated.CompositeAnimation | null>(null);

  // Pulse scale + glow when in warning zone
  useEffect(() => {
    if (isWarning) {
      pulseRef.current = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseAnim, { toValue: 1.08, duration: 380, useNativeDriver: true }),
            Animated.timing(glowOpacity, { toValue: 1,  duration: 380, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(pulseAnim, { toValue: 1.00, duration: 380, useNativeDriver: true }),
            Animated.timing(glowOpacity, { toValue: 0.5, duration: 380, useNativeDriver: true }),
          ]),
        ])
      );
      pulseRef.current.start();
    } else {
      pulseRef.current?.stop();
      pulseAnim.setValue(1);
      glowOpacity.setValue(0.6);
    }
    return () => pulseRef.current?.stop();
  }, [isWarning, pulseAnim, glowOpacity]);

  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  const arcColor   = isWarning ? Colors.crimson : Colors.gold;
  const glowColor  = isWarning
    ? 'rgba(255, 61, 113, 0.22)'
    : 'rgba(255, 184, 0, 0.14)';

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale: pulseAnim }] }]}>
      {/* Ambient glow circle behind the SVG */}
      <Animated.View
        style={[styles.glowCircle, { backgroundColor: glowColor, opacity: glowOpacity }]}
        pointerEvents="none"
      />

      <Svg width={SIZE} height={SIZE}>
        {/* Track — dim base ring */}
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          stroke="rgba(255, 255, 255, 0.07)"
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        {/* Progress arc — starts at 12 o'clock */}
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          stroke={arcColor}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${CENTER}, ${CENTER}`}
        />
      </Svg>

      {/* Centred time display */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.center}>
          <Text style={[styles.number, isWarning && styles.numberWarning]}>
            {timeLeft}
          </Text>
          <Text style={[styles.unit, isWarning && styles.unitWarning]}>
            ثانية
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'center',
    width: SIZE,
    height: SIZE,
  },
  glowCircle: {
    position: 'absolute',
    top: -16,
    left: -16,
    right: -16,
    bottom: -16,
    borderRadius: 9999,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    ...Typography.displayLarge,
    fontSize: 36,
    color: Colors.textPrimary,
    lineHeight: 40,
    fontWeight: '800',
  },
  numberWarning: {
    color: Colors.crimson,
  },
  unit: {
    ...Typography.caption,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
  },
  unitWarning: {
    color: Colors.crimson,
    opacity: 0.7,
  },
});
