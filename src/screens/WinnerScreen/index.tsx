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
import { useGameStore } from '../../store/useGameStore';
import { Colors, Spacing, BorderRadius, Typography, Shadow } from '../../constants/theme';
import { successFeedback, lightImpact } from '../../utils/haptics';
import { playCheerSound } from '../../utils/audio';

export function WinnerScreen() {
  const router = useRouter();
  const { teamA, teamB, resetGame } = useGameStore();

  const winner =
    teamA.score > teamB.score ? teamA :
    teamB.score > teamA.score ? teamB :
    null; // null = tie

  const isTie = winner === null;

  // ── Entrance animations ──────────────────────────────────────────────────
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-30)).current;
  const nameScale = useRef(new Animated.Value(0.5)).current;
  const nameOpacity = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;

  // ── Trophy pulse loop ────────────────────────────────────────────────────
  const trophyScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Celebratory haptic + cheer sound fire the moment the winner is revealed
    isTie ? lightImpact() : successFeedback();
    if (!isTie) playCheerSound();

    // Staggered entrance sequence
    Animated.sequence([
      // 1. Header fades down in
      Animated.parallel([
        Animated.timing(headerOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(headerTranslateY, { toValue: 0, tension: 70, friction: 8, useNativeDriver: true }),
      ]),
      // 2. Winner name pops in with spring
      Animated.parallel([
        Animated.spring(nameScale, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }),
        Animated.timing(nameOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
      // 3. Footer slides up
      Animated.timing(footerOpacity, { toValue: 1, duration: 400, delay: 100, useNativeDriver: true }),
    ]).start();

    // Trophy pulse runs independently, starts after a short delay
    const pulseTimer = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(trophyScale, { toValue: 1.18, duration: 700, useNativeDriver: true }),
          Animated.timing(trophyScale, { toValue: 1,    duration: 700, useNativeDriver: true }),
        ])
      ).start();
    }, 600);

    return () => clearTimeout(pulseTimer);
  }, [headerOpacity, headerTranslateY, nameScale, nameOpacity, footerOpacity, trophyScale]);

  const handleNewGame = () => {
    resetGame();
    router.dismissAll();
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Cinematic background */}
      <LinearGradient
        colors={['#0D0D1A', '#1F1200', '#0D0D1A']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Intense gold glow behind trophy */}
      <View style={styles.glowBurst} />
      <View style={styles.glowLower} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.layout}>

          {/* ── Header ───────────────────────────────────────── */}
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

          {/* ── Trophy + Winner ──────────────────────────────── */}
          <View style={styles.center}>
            {/* Pulsating trophy */}
            <Animated.Text
              style={[styles.trophy, { transform: [{ scale: trophyScale }] }]}
            >
              🏆
            </Animated.Text>

            {/* Winner name */}
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
                  <Text style={styles.winnerName} adjustsFontSizeToFit numberOfLines={2}>
                    {winner!.name}
                  </Text>
                </>
              )}
            </Animated.View>

            {/* Final score summary */}
            <Animated.View style={[styles.scoreRow, { opacity: nameOpacity }]}>
              <View style={styles.scoreChip}>
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

              <View style={styles.scoreChip}>
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

          {/* ── New Game Button ───────────────────────────────── */}
          <Animated.View style={{ opacity: footerOpacity }}>
            <TouchableOpacity
              onPress={handleNewGame}
              activeOpacity={0.8}
              style={[styles.newGameWrapper, Shadow.gold]}
            >
              <LinearGradient
                colors={[Colors.goldLight, Colors.gold, '#8B6914']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.newGameGradient}
              >
                <Text style={styles.newGameText}>لعب جيم جديد  🔄</Text>
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

  // ── Glow decoration
  glowBurst: {
    position: 'absolute',
    top: '20%',
    alignSelf: 'center',
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: 'rgba(201, 168, 76, 0.18)',
    transform: [{ scaleX: 1.6 }],
  },
  glowLower: {
    position: 'absolute',
    bottom: '10%',
    alignSelf: 'center',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(120, 60, 220, 0.08)',
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
    letterSpacing: 1,
    textAlign: 'center',
  },

  // ── Trophy
  center: {
    alignItems: 'center',
    gap: Spacing.lg,
  },
  trophy: {
    fontSize: 96,
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
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  winnerName: {
    fontSize: 52,
    fontWeight: '900',
    color: Colors.goldLight,
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 62,
  },
  tieLabel: {
    ...Typography.displayMedium,
    color: Colors.textPrimary,
    textAlign: 'center',
  },

  // ── Score summary row
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
    minWidth: 80,
  },
  scoreChipName: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  scoreChipNum: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textSecondary,
    lineHeight: 32,
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
    paddingVertical: 17,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newGameText: {
    ...Typography.subtitle,
    color: Colors.background,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});
