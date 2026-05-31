/**
 * ScoreScreen — CINEMA ROYALE edition
 *
 * Enhancements vs. previous version:
 *   • Projector-beam background (gold gradient from top)
 *   • "ROUND OVER" clapperboard header with staggered entrance
 *   • Score reveal animation — panels slide in from sides
 *   • More dramatic announcement typography
 *   • Final-round: gold burst badge
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { ScoreBanner }  from './components/ScoreBanner';
import { ScoreBoard }   from './components/ScoreBoard';
import { RoundActions } from './components/RoundActions';
import { useScoreScreen } from './hooks/useScoreScreen';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';
import { lightImpact } from '../../utils/haptics';

export function ScoreScreen() {
  const {
    teamA,
    teamB,
    leadingTeam,
    nextTeam,
    currentRound,
    maxRounds,
    isGameOver,
    handleNextRound,
    handleCrownWinner,
    handleEndGame,
  } = useScoreScreen();

  useEffect(() => { lightImpact(); }, []);

  const isTied = teamA.score === teamB.score && teamA.score > 0;

  // ── Entrance animations ────────────────────────────────────────────────────
  const headerSlide   = useRef(new Animated.Value(-40)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const boardScale    = useRef(new Animated.Value(0.90)).current;
  const boardOpacity  = useRef(new Animated.Value(0)).current;
  const actionsOpacity = useRef(new Animated.Value(0)).current;
  const tieOpacity    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Header drops in
      Animated.parallel([
        Animated.spring(headerSlide,   { toValue: 0, tension: 70, friction: 9, useNativeDriver: true }),
        Animated.timing(headerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      // 2. Score board scales in
      Animated.parallel([
        Animated.spring(boardScale,   { toValue: 1, tension: 65, friction: 8, useNativeDriver: true }),
        Animated.timing(boardOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]),
      // 3. Actions fade in
      Animated.timing(actionsOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start(() => {
      // 4. Tie badge fades in after everything else
      if (isTied) {
        Animated.timing(tieOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      }
    });
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Void background ─────────────────────────────────────────────── */}
      <LinearGradient
        colors={['#04050C', '#07080F', '#04050C']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Projector gold glow at top ───────────────────────────────────── */}
      <View style={styles.glowTop} pointerEvents="none" />
      <View style={styles.glowCenter} pointerEvents="none" />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.layout}>

          {/* ── Header section ──────────────────────────────────────────── */}
          <Animated.View
            style={[
              styles.bannerSection,
              { opacity: headerOpacity, transform: [{ translateY: headerSlide }] },
            ]}
          >
            <ScoreBanner />

            {/* Round progress badge */}
            <View style={[styles.roundBadge, isGameOver && styles.roundBadgeFinal]}>
              <Text style={[styles.roundBadgeText, isGameOver && styles.roundBadgeTextFinal]}>
                {isGameOver
                  ? '🏁  الجولة الأخيرة انتهت!'
                  : `الجولة ${currentRound} من ${maxRounds}`}
              </Text>
            </View>
          </Animated.View>

          {/* ── Tie / lead announcement ──────────────────────────────────── */}
          {isTied ? (
            <Animated.View style={[styles.announcementRow, { opacity: tieOpacity }]}>
              <View style={styles.tieBadge}>
                <Text style={styles.tieText}>🤝  تعادل مثير!</Text>
              </View>
            </Animated.View>
          ) : leadingTeam !== null ? (
            <Animated.View style={[styles.announcementRow, { opacity: headerOpacity }]}>
              <View style={styles.leadBadge}>
                <Text style={styles.leadText}>
                  🏆{'  '}
                  {leadingTeam === 'A' ? teamA.name : teamB.name}
                  {'  في المقدمة'}
                </Text>
              </View>
            </Animated.View>
          ) : null}

          {/* ── Score board ──────────────────────────────────────────────── */}
          <Animated.View
            style={[
              styles.boardSection,
              { opacity: boardOpacity, transform: [{ scale: boardScale }] },
            ]}
          >
            <ScoreBoard
              teamA={teamA}
              teamB={teamB}
              leadingTeam={leadingTeam}
            />
          </Animated.View>

          {/* ── Actions ──────────────────────────────────────────────────── */}
          <Animated.View style={[styles.actionsSection, { opacity: actionsOpacity }]}>
            <RoundActions
              nextTeam={nextTeam}
              isGameOver={isGameOver}
              onNextRound={handleNextRound}
              onCrownWinner={handleCrownWinner}
              onEndGame={handleEndGame}
            />
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
    paddingBottom: Spacing.md,
    gap: Spacing.lg,
    justifyContent: 'space-between',
  },

  // ── Decorative glows
  glowTop: {
    position: 'absolute',
    top: -80,
    alignSelf: 'center',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(255, 184, 0, 0.12)',
    transform: [{ scaleX: 2.2 }],
  },
  glowCenter: {
    position: 'absolute',
    top: '42%',
    left: '18%',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(80, 50, 200, 0.06)',
  },

  // ── Sections
  bannerSection: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  boardSection: {},
  actionsSection: {},

  // ── Round badge
  roundBadge: {
    paddingVertical: Spacing.xs + 1,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  roundBadgeFinal: {
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.goldDim,
    // Gold glow on final round
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  roundBadgeText: {
    ...Typography.label,
    color: Colors.textSecondary,
    letterSpacing: 0.8,
  },
  roundBadgeTextFinal: {
    color: Colors.gold,
    fontWeight: '700',
  },

  // ── Announcements
  announcementRow: {
    alignItems: 'center',
    marginTop: -Spacing.md,
  },
  tieBadge: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: Colors.borderMedium,
  },
  tieText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  leadBadge: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.goldDim,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  leadText: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.goldLight,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
