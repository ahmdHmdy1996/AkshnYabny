/**
 * CountdownOverlay — 3-2-1 before each team turn.
 *
 * Fixes:
 *   • Fully opaque backdrop — no game content shows through
 *   • "يلا!" uses controlled font size (not 140px) — no overflow/cut-off
 *   • Emoji shown separately at fixed size (not inside giant text)
 *   • Clean layout that fits any screen
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';

const STEP_COLORS: Record<number, string> = {
  3: '#7B61FF',
  2: '#FFB800',
  1: '#FF3D71',
  0: '#00E676',
};

interface Props {
  countdown: number;  // 3 → 2 → 1 → 0 ("يلا!") → -1 (gone)
  teamName: string;
}

export function CountdownOverlay({ countdown, teamName }: Props) {
  const isGo = countdown === 0;
  const color = STEP_COLORS[countdown] ?? '#00E676';

  // ── Number animations ────────────────────────────────────────────────────────
  const numScale   = useRef(new Animated.Value(2.5)).current;
  const numOpacity = useRef(new Animated.Value(0)).current;
  const ring1      = useRef(new Animated.Value(0)).current;
  const ring2      = useRef(new Animated.Value(0)).current;
  const bgFlash    = useRef(new Animated.Value(0)).current;

  // ── Overlay exit (fades out after "يلا!") ────────────────────────────────────
  const overlayOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Reset per step
    numScale.setValue(2.5);
    numOpacity.setValue(0);
    ring1.setValue(0);
    ring2.setValue(0);
    bgFlash.setValue(0);

    Animated.sequence([
      Animated.parallel([
        Animated.spring(numScale, {
          toValue: 1,
          tension: 180,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(numOpacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(bgFlash, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(ring1, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(ring2, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    ]).start();
  }, [countdown]);

  // Fade out after "يلا!"
  useEffect(() => {
    if (!isGo) return;
    const t = setTimeout(() => {
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 700);
    return () => clearTimeout(t);
  }, [isGo]);

  // Derived
  const ring1Scale = ring1.interpolate({ inputRange: [0, 1], outputRange: [0.5, 2.0] });
  const ring1Op    = ring1.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.6, 0.3, 0] });
  const ring2Scale = ring2.interpolate({ inputRange: [0, 1], outputRange: [0.5, 2.8] });
  const ring2Op    = ring2.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.35, 0.15, 0] });
  const bgFlashOp  = bgFlash.interpolate({ inputRange: [0, 1], outputRange: [0, 0.15] });

  return (
    <Animated.View
      style={[styles.overlay, { opacity: overlayOpacity }]}
      pointerEvents={isGo ? 'none' : 'box-only'}
    >
      {/* ── Fully opaque dark backdrop (blocks all game content) ─── */}
      <View style={styles.backdrop} />

      {/* ── Subtle colour flash ────────────────────────────────────── */}
      <Animated.View
        style={[StyleSheet.absoluteFill, { backgroundColor: color, opacity: bgFlashOp }]}
        pointerEvents="none"
      />

      {/* ── Pulse rings ───────────────────────────────────────────── */}
      <Animated.View
        style={[styles.ring, {
          borderColor: color,
          opacity: ring1Op,
          transform: [{ scale: ring1Scale }],
        }]}
        pointerEvents="none"
      />
      <Animated.View
        style={[styles.ring, {
          borderColor: color,
          opacity: ring2Op,
          transform: [{ scale: ring2Scale }],
        }]}
        pointerEvents="none"
      />

      {/* ── Main content ──────────────────────────────────────────── */}
      <View style={styles.content} pointerEvents="none">

        {/* Team name (top) */}
        <Text style={styles.teamName} numberOfLines={1}>
          {teamName}
        </Text>

        {/* Number or "يلا!" */}
        {isGo ? (
          /* GO screen ─────────────────────────────────────────────── */
          <Animated.View
            style={[styles.goBox, { opacity: numOpacity, transform: [{ scale: numScale }] }]}
          >
            <Text style={styles.goEmoji}>🎬</Text>
            <Text style={[styles.goText, {
              color,
              textShadowColor: color,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 24,
            }]}>
              يلا!
            </Text>
          </Animated.View>
        ) : (
          /* Countdown number ───────────────────────────────────────── */
          <Animated.Text
            style={[
              styles.number,
              {
                color,
                opacity: numOpacity,
                transform: [{ scale: numScale }],
                textShadowColor: color,
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 36,
              },
            ]}
          >
            {countdown}
          </Animated.Text>
        )}

        {/* Sub-label */}
        <Text style={styles.subLabel} numberOfLines={1}>
          {isGo
            ? 'ابدأ التمثيل!'
            : countdown === 3 ? 'استعد...'
            : countdown === 2 ? 'جهز نفسك!'
            : 'يلا تمثل!'}
        </Text>

        {/* Progress dots */}
        <View style={styles.dots}>
          {[3, 2, 1].map((n) => (
            <View
              key={n}
              style={[
                styles.dot,
                (isGo || n >= countdown) && { backgroundColor: color },
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
    zIndex: 999,
  },
  // FULLY opaque — nothing bleeds through
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#04050C',
  },
  ring: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 2.5,
    alignSelf: 'center',
  },

  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },

  teamName: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.40)',
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },

  // Countdown number (3, 2, 1)
  number: {
    fontSize: 130,
    fontWeight: '900',
    lineHeight: 150,
    textAlign: 'center',
  },

  // "يلا!" container
  goBox: {
    alignItems: 'center',
    gap: 4,
  },
  goEmoji: {
    fontSize: 52,
    lineHeight: 60,
  },
  goText: {
    fontSize: 72,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 84,
  },

  subLabel: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '500',
    letterSpacing: 1,
    textAlign: 'center',
  },

  dots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
});
