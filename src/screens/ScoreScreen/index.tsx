import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { ScoreBanner } from './components/ScoreBanner';
import { ScoreBoard } from './components/ScoreBoard';
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

  // Subtle haptic on mount — round has ended, scores are revealed
  useEffect(() => {
    lightImpact();
  }, []);

  const isTied = teamA.score === teamB.score && teamA.score > 0;
  const tieOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isTied) {
      Animated.timing(tieOpacity, {
        toValue: 1,
        duration: 600,
        delay: 700,
        useNativeDriver: true,
      }).start();
    }
  }, [isTied, tieOpacity]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <LinearGradient
        colors={['#0D0D1A', '#1A0E2E', '#0D0D1A']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glowTop} />
      <View style={styles.glowCenter} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.layout}>

          {/* ── Header ───────────────────────────────────────── */}
          <View style={styles.bannerSection}>
            <ScoreBanner />

            {/* Round progress badge */}
            <View style={[styles.roundBadge, isGameOver && styles.roundBadgeFinal]}>
              <Text style={[styles.roundBadgeText, isGameOver && styles.roundBadgeTextFinal]}>
                {isGameOver
                  ? '🏁  الجولة الأخيرة انتهت!'
                  : `الجولة ${currentRound} من ${maxRounds}`}
              </Text>
            </View>
          </View>

          {/* ── Tie / lead announcements ─────────────────────── */}
          {isTied ? (
            <Animated.View style={[styles.announcementRow, { opacity: tieOpacity }]}>
              <Text style={styles.tieText}>🤝  تعادل مثير!</Text>
            </Animated.View>
          ) : leadingTeam !== null ? (
            <View style={styles.announcementRow}>
              <Text style={styles.leadText}>
                🏆{'  '}
                {leadingTeam === 'A' ? teamA.name : teamB.name}
                {'  في المقدمة'}
              </Text>
            </View>
          ) : null}

          {/* ── Score Board ──────────────────────────────────── */}
          <View style={styles.boardSection}>
            <ScoreBoard
              teamA={teamA}
              teamB={teamB}
              leadingTeam={leadingTeam}
            />
          </View>

          {/* ── Actions ──────────────────────────────────────── */}
          <View style={styles.actionsSection}>
            <RoundActions
              nextTeam={nextTeam}
              isGameOver={isGameOver}
              onNextRound={handleNextRound}
              onCrownWinner={handleCrownWinner}
              onEndGame={handleEndGame}
            />
          </View>

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
  safe: {
    flex: 1,
  },
  layout: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.lg,
    justifyContent: 'space-between',
  },

  // ── Glow
  glowTop: {
    position: 'absolute',
    top: -60,
    alignSelf: 'center',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(201, 168, 76, 0.14)',
    transform: [{ scaleX: 2 }],
  },
  glowCenter: {
    position: 'absolute',
    top: '40%',
    left: '20%',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(100, 60, 200, 0.07)',
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
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  roundBadgeFinal: {
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.goldDim,
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
  tieText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  leadText: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.gold,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
