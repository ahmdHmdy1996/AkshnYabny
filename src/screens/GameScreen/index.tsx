/**
 * GameScreen — CINEMA ROYALE edition
 *
 * Changes:
 *   • 3-2-1 countdown overlay before the round starts
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { CircularTimer }   from './components/CircularTimer';
import { TeamTurnHeader }  from './components/TeamTurnHeader';
import { SwipeableCard }   from './components/SwipeableCard';
import { CrazyRuleCard }   from './components/CrazyRuleCard';
import { ActionButtons }   from './components/ActionButtons';
import { useGameLoop }     from './hooks/useGameLoop';
import { Colors, Spacing } from '../../constants/theme';

export function GameScreen() {
  const {
    currentTurn,
    currentTeamData,
    currentCard,
    timeLeft,
    crazyRule,
    isTimeWarning,
    progress,
    isSkipDisabled,
    skipsRemaining,
    countdown,
    countdownDone,
    handleCorrectAnswer,
    handleSkip,
  } = useGameLoop();

  const teamLabel = currentTurn === 'A' ? 'الفريق الأول' : 'الفريق الثاني';

  // ── Warning pulse animation ──────────────────────────────────────────────────
  const warningAnim = useRef(new Animated.Value(0)).current;
  const warningLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isTimeWarning) {
      warningLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(warningAnim, { toValue: 1, duration: 420, useNativeDriver: true }),
          Animated.timing(warningAnim, { toValue: 0, duration: 420, useNativeDriver: true }),
        ])
      );
      warningLoop.current.start();
    } else {
      warningLoop.current?.stop();
      warningAnim.setValue(0);
    }
    return () => warningLoop.current?.stop();
  }, [isTimeWarning, warningAnim]);

  // ── Countdown number animation ───────────────────────────────────────────────
  const countdownScale  = useRef(new Animated.Value(1.4)).current;
  const countdownOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (countdown <= 0) return;
    countdownScale.setValue(1.4);
    countdownOpacity.setValue(1);
    Animated.parallel([
      Animated.timing(countdownScale,   { toValue: 0.6, duration: 900, useNativeDriver: true }),
      Animated.timing(countdownOpacity, { toValue: 0,   duration: 900, useNativeDriver: true }),
    ]).start();
  }, [countdown]);

  const warningOpacity = warningAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.18],
  });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Deep void base ─────────────────────────────────────────────────── */}
      <LinearGradient
        colors={['#04050C', '#060810', '#04050C']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Depth blob ─────────────────────────────────────────────────────── */}
      <View style={styles.depthBlob} pointerEvents="none" />

      {/* ── Warning crimson overlay ─────────────────────────────────────────── */}
      {isTimeWarning && (
        <>
          <Animated.View
            style={[styles.warningFill, { opacity: warningOpacity }]}
            pointerEvents="none"
          />
          <View style={styles.warningBorder} pointerEvents="none" />
        </>
      )}

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.layout}>

          {/* ── Top bar ──────────────────────────────────────────────────── */}
          <View style={styles.topBar}>
            <TeamTurnHeader
              team={currentTeamData}
              teamLabel={teamLabel}
              activeCategoryId={currentCard?.category}
            />
          </View>

          {/* ── Timer ────────────────────────────────────────────────────── */}
          <View style={styles.timerSection}>
            <CircularTimer
              timeLeft={timeLeft}
              progress={progress}
              isWarning={isTimeWarning}
            />
          </View>

          {/* ── Content card ─────────────────────────────────────────────── */}
          <View style={styles.cardSection}>
            <SwipeableCard
              key={currentCard?.id ?? '__empty__'}
              card={currentCard}
              isSkipDisabled={isSkipDisabled}
              onSwipeRight={handleCorrectAnswer}
              onSwipeLeft={handleSkip}
            />
          </View>

          {/* ── Crazy rule (conditional) ──────────────────────────────────── */}
          {crazyRule ? (
            <View style={styles.ruleSection}>
              <CrazyRuleCard rule={crazyRule} />
            </View>
          ) : null}

          {/* ── Action buttons ────────────────────────────────────────────── */}
          <View style={styles.actionsSection}>
            <ActionButtons
              onSkip={handleSkip}
              onCorrect={handleCorrectAnswer}
              isSkipDisabled={isSkipDisabled}
              skipsRemaining={skipsRemaining}
            />
          </View>

        </View>
      </SafeAreaView>

      {/* ── 3-2-1 Countdown overlay ────────────────────────────────────────── */}
      {!countdownDone && (
        <View style={styles.countdownOverlay} pointerEvents="none">
          <LinearGradient
            colors={['rgba(4,5,12,0.92)', 'rgba(4,5,12,0.97)', 'rgba(4,5,12,0.92)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.countdownContent}>
            <Text style={styles.countdownLabel}>ابدأ التمثيل بعد...</Text>
            <Animated.Text
              style={[
                styles.countdownNumber,
                { transform: [{ scale: countdownScale }], opacity: countdownOpacity },
              ]}
            >
              {countdown}
            </Animated.Text>
            <Text style={styles.countdownTeam}>{currentTeamData.name}</Text>
          </View>
        </View>
      )}
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
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },

  depthBlob: {
    position: 'absolute',
    top: '25%',
    left: '15%',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(60, 40, 160, 0.07)',
  },

  warningFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.crimson,
  } as any,
  warningBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderColor: 'rgba(255, 61, 113, 0.50)',
  } as any,

  topBar: {},
  timerSection: { alignItems: 'center' },
  cardSection: { flex: 1, minHeight: 180 },
  ruleSection: {},
  actionsSection: {},

  // ── Countdown overlay ──────────────────────────────────────────────────────
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  countdownContent: {
    alignItems: 'center',
    gap: 16,
  },
  countdownLabel: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
    letterSpacing: 1,
  },
  countdownNumber: {
    fontSize: 120,
    fontWeight: '900',
    color: '#FFD700',
    lineHeight: 130,
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  countdownTeam: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 8,
  },
});
