/**
 * WinnerScreen — CINEMA ROYALE edition
 *
 * New visual elements:
 *   • Gold particle burst — 16 shards explode outward from the trophy
 *   • Void-black background with intense amber gold beam at top
 *   • Trophy springs in with dramatic overshoot spring
 *   • Winner name in bright gold with gold glow shadow
 *   • Score chips use emerald highlight for the winner
 *   • CTA uses solid gold gradient — the biggest moment in the game
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { useAudioPlayer } from 'expo-audio';
import { useGameStore } from '../../store/useGameStore';
import { Colors, Spacing, BorderRadius, Typography, Shadow } from '../../constants/theme';
import { successFeedback, lightImpact } from '../../utils/haptics';

// ─── Particle burst config ─────────────────────────────────────────────────────

const NUM_PARTICLES = 16;

// Pre-compute particle end positions (radiating outward from center)
const BURST_DATA = Array.from({ length: NUM_PARTICLES }, (_, i) => {
  const angle = (i / NUM_PARTICLES) * 2 * Math.PI - Math.PI / 2; // start at top
  const dist  = i % 2 === 0 ? 115 : 88;
  return {
    id:    i,
    dx:    Math.round(Math.cos(angle) * dist),
    dy:    Math.round(Math.sin(angle) * dist),
    size:  ([7, 4, 6, 3] as const)[i % 4],
    delay: i * 38,
    color: (['#FFD340', '#FFB800', '#FFC420', '#F5A800'] as const)[i % 4],
  };
});

function BurstParticle({
  dx, dy, size, delay, color,
}: typeof BURST_DATA[0]) {
  const x       = useRef(new Animated.Value(0)).current;
  const y       = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(x, { toValue: dx, duration: 950, useNativeDriver: true }),
        Animated.timing(y, { toValue: dy, duration: 950, useNativeDriver: true }),
        Animated.sequence([
          Animated.parallel([
            Animated.timing(opacity, { toValue: 1,   duration: 180, useNativeDriver: true }),
            Animated.spring(scale,   { toValue: 1, tension: 200, friction: 6, useNativeDriver: true }),
          ]),
          Animated.timing(opacity, { toValue: 0, duration: 770, useNativeDriver: true }),
        ]),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity,
        transform: [{ translateX: x }, { translateY: y }, { scale }],
      }}
    />
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function WinnerScreen() {
  const router = useRouter();
  const { teamA, teamB, resetGame, isSoundEnabled } = useGameStore();
  const cheerPlayer = useAudioPlayer(require('../../../assets/sounds/cheer.mp3'));

  const winner =
    teamA.score > teamB.score ? teamA :
    teamB.score > teamA.score ? teamB :
    null; // null = tie

  const isTie = winner === null;

  // ── Entrance animations ──────────────────────────────────────────────────
  const headerOpacity    = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-36)).current;
  const trophyScale      = useRef(new Animated.Value(0.2)).current;
  const trophyOpacity    = useRef(new Animated.Value(0)).current;
  const nameScale        = useRef(new Animated.Value(0.55)).current;
  const nameOpacity      = useRef(new Animated.Value(0)).current;
  const footerOpacity    = useRef(new Animated.Value(0)).current;

  // Trophy idle pulse (runs after entrance)
  const idlePulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    isTie ? lightImpact() : successFeedback();
    if (!isTie && isSoundEnabled) {
      try { cheerPlayer.seekTo(0); cheerPlayer.play(); } catch { /* ignore */ }
    }

    Animated.sequence([
      // 1. Header drops in
      Animated.parallel([
        Animated.timing(headerOpacity,    { toValue: 1, duration: 480, useNativeDriver: true }),
        Animated.spring(headerTranslateY, { toValue: 0, tension: 72, friction: 8, useNativeDriver: true }),
      ]),
      // 2. Trophy bursts in with dramatic overshoot
      Animated.parallel([
        Animated.spring(trophyScale,   { toValue: 1, tension: 50, friction: 5, useNativeDriver: true }),
        Animated.timing(trophyOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]),
      // 3. Winner name springs in
      Animated.parallel([
        Animated.spring(nameScale,   { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }),
        Animated.timing(nameOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
      // 4. Footer fades in
      Animated.timing(footerOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
    ]).start(() => {
      // 5. Gentle idle pulse on the trophy, starts 400 ms after reveal
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(idlePulse, { toValue: 1.14, duration: 750, useNativeDriver: true }),
            Animated.timing(idlePulse, { toValue: 1.00, duration: 750, useNativeDriver: true }),
          ])
        ).start();
      }, 400);
    });
  }, []);

  const handleNewGame = () => {
    resetGame();
    router.dismissAll();
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Void black + warm gold shift ────────────────────────────────── */}
      <LinearGradient
        colors={['#04050C', '#0E0900', '#04050C']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Gold burst blob behind trophy ───────────────────────────────── */}
      <View style={styles.glowBurst} pointerEvents="none" />
      <View style={styles.glowLower} pointerEvents="none" />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.layout}>

          {/* ── Header ───────────────────────────────────────────────────── */}
          <Animated.View
            style={[
              styles.header,
              { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] },
            ]}
          >
            <Text style={styles.headerLabel}>
              {isTie ? '🤝  تعادل مذهل!' : '🎉  تهانينا!'}
            </Text>
            <Text style={styles.headerSub}>
              {isTie ? 'كلا الفريقين فائزان' : 'لقد حُسم الفائز'}
            </Text>
          </Animated.View>

          {/* ── Trophy + particle burst + winner name ────────────────────── */}
          <View style={styles.centerSection}>

            {/* Trophy — particles burst from its center */}
            <View style={styles.trophyWrapper}>
              <Animated.Text
                style={[
                  styles.trophy,
                  { opacity: trophyOpacity, transform: [{ scale: Animated.multiply(trophyScale, idlePulse) }] },
                ]}
              >
                🏆
              </Animated.Text>

              {/* Absolute overlay fills the trophy bounds; flex-centered inner
                  anchor is where particles originate */}
              <View style={styles.particleOverlay} pointerEvents="none">
                <View>
                  {BURST_DATA.map((p) => (
                    <BurstParticle key={p.id} {...p} />
                  ))}
                </View>
              </View>
            </View>

            {/* Winner name card */}
            <Animated.View
              style={[
                styles.winnerCard,
                { opacity: nameOpacity, transform: [{ scale: nameScale }] },
              ]}
            >
              {isTie ? (
                <Text style={styles.tieLabel}>
                  {teamA.name}{'  🤝  '}{teamB.name}
                </Text>
              ) : (
                <>
                  <Text style={styles.winnerEyebrow}>بطل اللعبة</Text>
                  <Text
                    style={styles.winnerName}
                    adjustsFontSizeToFit
                    numberOfLines={2}
                  >
                    {winner!.name}
                  </Text>
                </>
              )}
            </Animated.View>

            {/* Final score summary */}
            <Animated.View style={[styles.scoreRow, { opacity: nameOpacity }]}>
              <View style={[
                styles.scoreChip,
                teamA.score > teamB.score && styles.scoreChipWinner,
              ]}>
                <Text style={styles.scoreChipName} numberOfLines={1}>
                  {teamA.name}
                </Text>
                <Text style={[
                  styles.scoreChipNum,
                  teamA.score > teamB.score && styles.scoreChipNumWinner,
                ]}>
                  {teamA.score}
                </Text>
              </View>

              <Text style={styles.scoreSep}>–</Text>

              <View style={[
                styles.scoreChip,
                teamB.score > teamA.score && styles.scoreChipWinner,
              ]}>
                <Text style={styles.scoreChipName} numberOfLines={1}>
                  {teamB.name}
                </Text>
                <Text style={[
                  styles.scoreChipNum,
                  teamB.score > teamA.score && styles.scoreChipNumWinner,
                ]}>
                  {teamB.score}
                </Text>
              </View>
            </Animated.View>
          </View>

          {/* ── New Game CTA ──────────────────────────────────────────────── */}
          <Animated.View style={{ opacity: footerOpacity }}>
            <TouchableOpacity
              onPress={handleNewGame}
              activeOpacity={0.80}
              style={[styles.newGameWrapper, Shadow.gold]}
            >
              <LinearGradient
                colors={[Colors.goldLight, Colors.gold, Colors.goldDeep]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.newGameGradient}
              >
                {/* Top shimmer */}
                <View style={styles.newGameShimmer} />
                <Text style={styles.newGameText}>لعبة جديدة  🔄</Text>
              </LinearGradient>
            </TouchableOpacity>
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    justifyContent: 'space-between',
  },

  // ── Glow blobs
  glowBurst: {
    position: 'absolute',
    top: '18%',
    alignSelf: 'center',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(255, 184, 0, 0.16)',
    transform: [{ scaleX: 1.7 }],
  },
  glowLower: {
    position: 'absolute',
    bottom: '12%',
    alignSelf: 'center',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(100, 55, 220, 0.07)',
  },

  // ── Header
  header: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  headerLabel: {
    ...Typography.displayMedium,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  headerSub: {
    ...Typography.body,
    color: Colors.textSecondary,
    letterSpacing: 1.2,
    textAlign: 'center',
  },

  // ── Center section
  centerSection: {
    alignItems: 'center',
    gap: Spacing.lg,
  },

  // ── Trophy wrapper — relative container for the particle overlay
  trophyWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Particle overlay — fills trophyWrapper, centers the burst origin
  particleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Trophy
  trophy: {
    fontSize: 100,
    textAlign: 'center',
  },

  // ── Winner card
  winnerCard: {
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  winnerEyebrow: {
    ...Typography.label,
    color: Colors.gold,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  winnerName: {
    fontSize: 54,
    fontWeight: '900',
    color: Colors.goldLight,
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: 64,
    // Warm gold text glow
    textShadowColor: 'rgba(255, 184, 0, 0.45)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  tieLabel: {
    ...Typography.displayMedium,
    color: Colors.textPrimary,
    textAlign: 'center',
  },

  // ── Score summary
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  scoreChip: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.glass,
    gap: 2,
    minWidth: 84,
  },
  scoreChipWinner: {
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.goldDim,
  },
  scoreChipName: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  scoreChipNum: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.textSecondary,
    lineHeight: 34,
  },
  scoreChipNumWinner: {
    color: Colors.goldLight,
  },
  scoreSep: {
    ...Typography.displayMedium,
    color: Colors.textTertiary,
  },

  // ── New game CTA
  newGameWrapper: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  newGameGradient: {
    paddingVertical: 18,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newGameShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  newGameText: {
    ...Typography.subtitle,
    color: Colors.background,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
