/**
 * WelcomeScreen — CINEMA ROYALE edition
 *
 * Visual elements:
 *   • Void-black background (#04050C) — cinema before the projector fires
 *   • Projector beam cone — warm gold linear gradient emanating from top-center
 *   • 8 floating gold-dust particles — async loops with staggered delays
 *   • Film-strip bars — rows of perforation holes above and below the logo
 *   • Double-ring logo — outer glow ring + inner ring, intense amber shadow
 *   • Ornament tagline — ◆ line ◆ Arabic text ◆ line ◆
 *   • CTA — full-width glass button with intense gold aura
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';

import { Colors, Spacing, Typography, BorderRadius, Shadow } from '../../constants/theme';
import { lightImpact } from '../../utils/haptics';

const { width: SW } = Dimensions.get('window');

// ─── Logo ─────────────────────────────────────────────────────────────────────
// Swap to assets/logo.png when the final logo is ready.
const LOGO = require('../../../assets/icon.png');

// ─── Floating gold-dust particle config ───────────────────────────────────────
const PARTICLES: Array<{
  x: number; y: number; r: number; delay: number; dur: number;
}> = [
  { x: SW * 0.11, y: 110, r: 2.5, delay: 0,    dur: 2400 },
  { x: SW * 0.83, y: 145, r: 1.5, delay: 700,  dur: 2700 },
  { x: SW * 0.30, y:  75, r: 3.0, delay: 300,  dur: 2100 },
  { x: SW * 0.68, y:  88, r: 2.0, delay: 1100, dur: 2500 },
  { x: SW * 0.50, y:  55, r: 1.5, delay: 900,  dur: 2200 },
  { x: SW * 0.62, y: 210, r: 3.5, delay: 250,  dur: 2900 },
  { x: SW * 0.17, y: 235, r: 2.0, delay: 1400, dur: 2000 },
  { x: SW * 0.87, y: 260, r: 2.5, delay: 550,  dur: 2600 },
];

function FloatingParticle({
  x, y, r, delay, dur,
}: typeof PARTICLES[0]) {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;

    const timer = setTimeout(() => {
      animation = Animated.loop(
        Animated.sequence([
          // 1. Rise + appear
          Animated.parallel([
            Animated.timing(opacity,    { toValue: 0.80, duration: Math.round(dur * 0.35), useNativeDriver: true }),
            Animated.timing(translateY, { toValue: -20,  duration: Math.round(dur * 0.50), useNativeDriver: true }),
          ]),
          // 2. Dim slightly at peak
          Animated.timing(opacity, { toValue: 0.40, duration: Math.round(dur * 0.15), useNativeDriver: true }),
          // 3. Fade out while still rising
          Animated.parallel([
            Animated.timing(opacity,    { toValue: 0,   duration: Math.round(dur * 0.35), useNativeDriver: true }),
            Animated.timing(translateY, { toValue: -42, duration: Math.round(dur * 0.50), useNativeDriver: true }),
          ]),
          // 4. Invisible snap back to origin
          Animated.timing(translateY, { toValue: 0, duration: 80, useNativeDriver: true }),
        ])
      );
      animation.start();
    }, delay);

    return () => {
      clearTimeout(timer);
      animation?.stop();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x - r,
        top:  y - r,
        width:  r * 2,
        height: r * 2,
        borderRadius: r,
        backgroundColor: Colors.gold,
        opacity,
        transform: [{ translateY }],
      }}
    />
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function WelcomeScreen() {
  const router = useRouter();

  // ── Entrance animation values ─────────────────────────────────────────────
  const beamOpacity    = useRef(new Animated.Value(0)).current;
  const logoOpacity    = useRef(new Animated.Value(0)).current;
  const logoScale      = useRef(new Animated.Value(0.66)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const ctaOpacity     = useRef(new Animated.Value(0)).current;
  const ctaTranslateY  = useRef(new Animated.Value(36)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Projector beam fades in
      Animated.timing(beamOpacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
      // 2. Logo springs in from the beam
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(logoScale,   { toValue: 1, tension: 52, friction: 8, useNativeDriver: true }),
      ]),
      // 3. Tagline fades in
      Animated.timing(taglineOpacity, { toValue: 1, duration: 460, useNativeDriver: true }),
      // 4. CTA rises from below
      Animated.parallel([
        Animated.timing(ctaOpacity,   { toValue: 1, duration: 420, useNativeDriver: true }),
        Animated.spring(ctaTranslateY, { toValue: 0, tension: 60, friction: 9, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const handleStart = () => {
    lightImpact();
    router.push('/setup');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Void-black background ────────────────────────────────────────── */}
      <LinearGradient
        colors={['#04050C', '#060710', '#04050C']}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Projector beam cone — wide fan from top center ───────────────── */}
      <Animated.View
        pointerEvents="none"
        style={[styles.beamContainer, { opacity: beamOpacity }]}
      >
        <LinearGradient
          colors={[
            'rgba(255, 184, 0, 0.30)',
            'rgba(255, 184, 0, 0.12)',
            'rgba(255, 184, 0, 0.03)',
            'transparent',
          ]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.beam}
        />
      </Animated.View>

      {/* ── Floating gold-dust particles ─────────────────────────────────── */}
      {PARTICLES.map((p, i) => (
        <FloatingParticle key={i} {...p} />
      ))}

      {/* ── Ambient glow blob at logo position ───────────────────────────── */}
      <View style={styles.logoGlowBlob} pointerEvents="none" />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.layout}>

          {/* ── Hero section ──────────────────────────────────────────────── */}
          <View style={styles.heroSection}>

            {/* Film-strip perforation bar above logo */}
            <View style={styles.filmStripBar}>
              {Array.from({ length: 8 }).map((_, i) => (
                <View key={i} style={styles.filmHole} />
              ))}
            </View>

            {/* Logo with double-ring chrome bezel */}
            <Animated.View
              style={[
                styles.logoWrapper,
                { opacity: logoOpacity, transform: [{ scale: logoScale }] },
              ]}
            >
              {/* Outer glow ring */}
              <View style={styles.logoRingOuter}>
                {/* Inner delicate ring */}
                <View style={styles.logoRingInner}>
                  <Image
                    source={LOGO}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>
              </View>
            </Animated.View>

            {/* Film-strip perforation bar below logo */}
            <View style={styles.filmStripBar}>
              {Array.from({ length: 8 }).map((_, i) => (
                <View key={i} style={styles.filmHole} />
              ))}
            </View>

            {/* Ornament + tagline */}
            <Animated.View style={[styles.taglineGroup, { opacity: taglineOpacity }]}>
              <View style={styles.ornamentRow}>
                <View style={styles.ornamentLine} />
                <Text style={styles.ornamentGem}>◆</Text>
                <View style={styles.ornamentLine} />
              </View>
              <Text style={styles.tagline}>مثّل  •  خمّن  •  انبسط</Text>
              <View style={styles.ornamentRow}>
                <View style={styles.ornamentLine} />
                <Text style={styles.ornamentGem}>◆</Text>
                <View style={styles.ornamentLine} />
              </View>
            </Animated.View>
          </View>

          {/* ── Glassmorphism CTA ─────────────────────────────────────────── */}
          <Animated.View
            style={[
              styles.ctaSection,
              { opacity: ctaOpacity, transform: [{ translateY: ctaTranslateY }] },
            ]}
          >
            <TouchableOpacity
              onPress={handleStart}
              activeOpacity={0.82}
              style={[styles.ctaOuter, Shadow.goldGlow]}
            >
              {Platform.OS === 'ios' ? (
                <BlurView intensity={55} tint="dark" style={styles.ctaBlur}>
                  <LinearGradient
                    colors={['rgba(255,184,0,0.28)', 'rgba(255,184,0,0.08)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.ctaContent}
                  >
                    <Text style={styles.ctaLabel}>ابدأ اللعب</Text>
                    <Text style={styles.ctaIcon}>🎬</Text>
                  </LinearGradient>
                </BlurView>
              ) : (
                <View style={styles.ctaAndroid}>
                  <Text style={styles.ctaLabel}>ابدأ اللعب</Text>
                  <Text style={styles.ctaIcon}>🎬</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.ctaHint}>اختار الفرق والإعدادات وابدأ!</Text>
          </Animated.View>

        </View>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safe: { flex: 1 },
  layout: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // ── Projector beam
  beamContainer: {
    position: 'absolute',
    top: 0,
    left: '14%',
    right: '14%',
    height: '66%',
    // scaleX fans the narrow gradient beam into a wide cone
    transform: [{ scaleX: 2.4 }],
  },
  beam: {
    flex: 1,
    borderBottomLeftRadius: 320,
    borderBottomRightRadius: 320,
  },

  // ── Logo ambient glow
  logoGlowBlob: {
    position: 'absolute',
    top: '20%',
    alignSelf: 'center',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255, 184, 0, 0.13)',
    transform: [{ scaleX: 1.6 }],
  },

  // ── Hero section
  heroSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },

  // ── Film-strip perforation bar
  filmStripBar: {
    flexDirection: 'row',
    gap: 9,
    paddingVertical: 5,
    paddingHorizontal: Spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  filmHole: {
    width: 11,
    height: 8,
    borderRadius: 2,
    backgroundColor: Colors.background,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 184, 0, 0.20)',
  },

  // ── Logo rings
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.md,
  },
  logoRingOuter: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: Colors.goldBorder,
    backgroundColor: 'rgba(255, 184, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    // Intense cinematic glow
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 36,
    elevation: 22,
  },
  logoRingInner: {
    width: 146,
    height: 146,
    borderRadius: 73,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.18)',
    backgroundColor: 'rgba(255, 184, 0, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 114,
    height: 114,
    borderRadius: 57,
  },

  // ── Ornament + tagline
  taglineGroup: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  ornamentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  ornamentLine: {
    width: 52,
    height: 1,
    backgroundColor: Colors.borderSubtle,
  },
  ornamentGem: {
    color: Colors.gold,
    fontSize: 9,
  },
  tagline: {
    ...Typography.body,
    color: Colors.textTertiary,
    letterSpacing: 3.2,
    textAlign: 'center',
  },

  // ── CTA
  ctaSection: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.md,
  },
  ctaOuter: {
    width: '100%',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.goldBorder,
  },
  ctaBlur: {
    // BlurView clips inside ctaOuter's overflow:hidden
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  ctaAndroid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: Spacing.xl,
    backgroundColor: 'rgba(255, 184, 0, 0.16)',
    gap: Spacing.sm,
  },
  ctaLabel: {
    fontSize: 21,
    fontWeight: '700',
    color: Colors.goldLight,
    letterSpacing: 1.6,
  },
  ctaIcon: {
    fontSize: 22,
  },
  ctaHint: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
