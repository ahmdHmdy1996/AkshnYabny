/**
 * CountdownOverlay — dramatic 3-2-1 animation before each team's turn.
 *
 * Each number:
 *   1. Slams in from large scale with a spring
 *   2. Holds for ~300 ms
 *   3. Crushes down and fades out
 *
 * After 1 → "يلا!" pulse fades in and the overlay exits.
 *
 * Color per step:
 *   3 → blue-purple  (#7B61FF)
 *   2 → amber        (#FFB800)
 *   1 → crimson      (#FF3D71)
 *   GO → emerald     (#00E676)
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

const STEP_COLORS: Record<number | string, string> = {
  3: '#7B61FF',
  2: '#FFB800',
  1: '#FF3D71',
  0: '#00E676',   // "يلا!" step
};

interface Props {
  countdown: number;        // 3 → 2 → 1 → 0
  teamName: string;
}

export function CountdownOverlay({ countdown, teamName }: Props) {
  // ── Per-number animation values ─────────────────────────────────────────────
  const scale   = useRef(new Animated.Value(3.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const ring1   = useRef(new Animated.Value(0)).current;   // pulse ring
  const ring2   = useRef(new Animated.Value(0)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;

  // Track which "step" we're displaying: 3/2/1 → show number, 0 → show "يلا!"
  const isGo = countdown === 0;
  const color = STEP_COLORS[countdown] ?? '#fff';

  // ── Run slam animation whenever countdown changes ────────────────────────────
  useEffect(() => {
    // Reset
    scale.setValue(3.5);
    opacity.setValue(0);
    ring1.setValue(0);
    ring2.setValue(0);
    bgOpacity.setValue(0);

    Animated.sequence([
      // 1. Slam in
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          tension: 200,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(bgOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      // 2. Pulse rings
      Animated.parallel([
        Animated.timing(ring1, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(ring2, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    ]).start();
  }, [countdown]);

  // ── When "يلا!" appears, schedule overlay fade-out ──────────────────────────
  useEffect(() => {
    if (!isGo) return;
    const t = setTimeout(() => {
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 600);
    return () => clearTimeout(t);
  }, [isGo]);

  // Derived ring styles
  const ringBase = { borderRadius: 999, borderWidth: 3, position: 'absolute' as const };

  const ring1Scale = ring1.interpolate({ inputRange: [0, 1], outputRange: [0.6, 2.2] });
  const ring1Op    = ring1.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0.7, 0.4, 0] });
  const ring2Scale = ring2.interpolate({ inputRange: [0, 1], outputRange: [0.6, 3.0] });
  const ring2Op    = ring2.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0.4, 0.2, 0] });

  const bgColorOp = bgOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.18] });

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} pointerEvents="none">
      {/* Dark backdrop */}
      <View style={styles.backdrop} />

      {/* Color flash overlay */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: color, opacity: bgColorOp },
        ]}
      />

      {/* Pulse rings */}
      <Animated.View
        style={[
          ringBase,
          styles.ring,
          {
            borderColor: color,
            opacity: ring1Op,
            transform: [{ scale: ring1Scale }],
          },
        ]}
      />
      <Animated.View
        style={[
          ringBase,
          styles.ring,
          {
            borderColor: color,
            opacity: ring2Op,
            transform: [{ scale: ring2Scale }],
          },
        ]}
      />

      {/* Content */}
      <View style={styles.content}>
        {!isGo && (
          <Text style={styles.teamName}>{teamName}</Text>
        )}

        <Animated.Text
          style={[
            styles.number,
            {
              color,
              opacity,
              transform: [{ scale }],
              textShadowColor: color,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 40,
            },
          ]}
        >
          {isGo ? 'يلا! 🎬' : countdown}
        </Animated.Text>

        {isGo && (
          <Animated.Text style={[styles.goSub, { opacity }]}>
            {teamName}  ابدأ التمثيل!
          </Animated.Text>
        )}

        {!isGo && (
          <Text style={styles.label}>
            {countdown === 3 ? 'ابدأ بعد...' : countdown === 2 ? 'استعد...' : 'جهز نفسك!'}
          </Text>
        )}

        {/* Progress dots */}
        <View style={styles.dots}>
          {[3, 2, 1].map((n) => (
            <View
              key={n}
              style={[
                styles.dot,
                n >= countdown && !isGo && { backgroundColor: color },
                isGo && { backgroundColor: STEP_COLORS[0] },
              ]}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4, 5, 12, 0.93)',
  },
  ring: {
    width: 200,
    height: 200,
    alignSelf: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  teamName: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: -8,
  },
  number: {
    fontSize: 140,
    fontWeight: '900',
    lineHeight: 160,
  },
  goSub: {
    fontSize: 20,
    color: '#00E676',
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: -12,
    textShadowColor: '#00E676',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  label: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '500',
    letterSpacing: 1,
    marginTop: -8,
  },
  dots: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
});
