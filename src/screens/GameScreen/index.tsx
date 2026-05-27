import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { CircularTimer } from './components/CircularTimer';
import { TeamTurnHeader } from './components/TeamTurnHeader';
import { ContentCard } from './components/ContentCard';
import { CrazyRuleCard } from './components/CrazyRuleCard';
import { ActionButtons } from './components/ActionButtons';
import { useGameLoop } from './hooks/useGameLoop';
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
    handleCorrectAnswer,
    handleSkip,
  } = useGameLoop();

  const teamLabel = currentTurn === 'A' ? 'الفريق الأول' : 'الفريق الثاني';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Cinematic background */}
      <LinearGradient
        colors={['#0D0D1A', '#1A0E2E', '#0D0D1A']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Warning glow bleeds in when time is low */}
      {isTimeWarning && <View style={styles.warningGlow} />}

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.layout}>

          {/* ── Top Bar ─────────────────────────────────────────── */}
          <View style={styles.topBar}>
            <TeamTurnHeader
              team={currentTeamData}
              teamLabel={teamLabel}
              activeCategoryId={currentCard?.categoryId}
            />
          </View>

          {/* ── Timer ───────────────────────────────────────────── */}
          <View style={styles.timerSection}>
            <CircularTimer
              timeLeft={timeLeft}
              progress={progress}
              isWarning={isTimeWarning}
            />
          </View>

          {/* ── Content Card (hero area) ─────────────────────────── */}
          <View style={styles.cardSection}>
            <ContentCard card={currentCard} />
          </View>

          {/* ── Crazy Rule (conditional) ─────────────────────────── */}
          {crazyRule ? (
            <View style={styles.ruleSection}>
              <CrazyRuleCard rule={crazyRule} />
            </View>
          ) : null}

          {/* ── Action Buttons ───────────────────────────────────── */}
          <View style={styles.actionsSection}>
            <ActionButtons onSkip={handleSkip} onCorrect={handleCorrectAnswer} />
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
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },

  // ── Sections
  topBar: {
    // fixed height, no flex
  },
  timerSection: {
    alignItems: 'center',
  },
  cardSection: {
    flex: 1,             // takes all remaining vertical space
    minHeight: 180,
  },
  ruleSection: {
    // sits between card and buttons
  },
  actionsSection: {
    // pinned to bottom by gap layout
  },

  // ── Warning glow overlay
  warningGlow: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderColor: 'rgba(255, 80, 80, 0.35)',
    borderRadius: 0,
    pointerEvents: 'none',
  },
});
