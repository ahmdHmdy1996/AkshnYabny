import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { GlassCard } from '../../components/common/GlassCard';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { TeamInput } from './components/TeamInput';
import { CategorySelector } from './components/CategorySelector';
import { RulesToggle } from './components/RulesToggle';
import { SoundToggle } from './components/SoundToggle';
import { RoundPicker } from './components/RoundPicker';
import { useSetupForm } from './hooks/useSetupForm';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { CategoryId } from '../../types/game.types';

export function SetupScreen() {
  const {
    teamA,
    teamB,
    selectedCategories,
    crazyRulesEnabled,
    maxRounds,
    isSoundEnabled,
    setTeamName,
    toggleCategory,
    toggleCrazyRules,
    setMaxRounds,
    toggleSound,
    handleStartGame,
  } = useSetupForm();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const onStart = () => {
    const validationErrors = handleStartGame();
    if (validationErrors) {
      setErrors(validationErrors);
    }
  };

  const clearError = (field: string) => {
    if (errors[field]) setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Cinematic background gradient */}
      <LinearGradient
        colors={['#0D0D1A', '#1A0E2E', '#0D0D1A']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative glow blobs */}
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kav}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Header ──────────────────────────────────────────── */}
            <View style={styles.header}>
              <Text style={styles.clapperEmoji}>🎬</Text>
              <Text style={styles.title}>أكشن يابني</Text>
              <Text style={styles.subtitle}>الشاراد المصري</Text>
            </View>

            {/* ── Teams Card ──────────────────────────────────────── */}
            <GlassCard style={styles.card} innerStyle={styles.cardInner}>
              <Text style={styles.sectionLabel}>الفرق</Text>

              <TeamInput
                label="🏅 الفريق الأول"
                value={teamA.name}
                onChangeText={(text) => {
                  setTeamName('A', text);
                  clearError('teamA');
                }}
                placeholder="اسم الفريق"
                accentColor={Colors.goldLight}
              />
              {errors.teamA ? <Text style={styles.errorText}>{errors.teamA}</Text> : null}

              <View style={styles.divider} />

              <TeamInput
                label="🥈 الفريق الثاني"
                value={teamB.name}
                onChangeText={(text) => {
                  setTeamName('B', text);
                  clearError('teamB');
                }}
                placeholder="اسم الفريق"
                accentColor="rgba(200, 200, 255, 0.85)"
              />
              {errors.teamB ? <Text style={styles.errorText}>{errors.teamB}</Text> : null}
            </GlassCard>

            {/* ── Categories Card ─────────────────────────────────── */}
            <GlassCard style={styles.card} innerStyle={styles.cardInner}>
              <CategorySelector
                selected={selectedCategories as CategoryId[]}
                onToggle={(id) => {
                  toggleCategory(id);
                  clearError('categories');
                }}
              />
              {errors.categories ? (
                <Text style={[styles.errorText, { marginTop: Spacing.xs }]}>
                  {errors.categories}
                </Text>
              ) : null}
            </GlassCard>

            {/* ── Rounds Card ─────────────────────────────────────── */}
            <GlassCard style={styles.card} innerStyle={styles.cardInner}>
              <RoundPicker
                value={maxRounds}
                onChange={setMaxRounds}
              />
            </GlassCard>

            {/* ── Sound + Rules Card ──────────────────────────────── */}
            <GlassCard style={styles.card} innerStyle={styles.cardInnerFlush}>
              <SoundToggle enabled={isSoundEnabled} onToggle={toggleSound} />
              <View style={styles.toggleDivider} />
              <RulesToggle enabled={crazyRulesEnabled} onToggle={toggleCrazyRules} />
            </GlassCard>

            {/* ── Start Button ────────────────────────────────────── */}
            <PrimaryButton
              label="ابدأ اللعبة  ▶"
              onPress={onStart}
              style={styles.startButton}
            />
          </ScrollView>
        </KeyboardAvoidingView>
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
  kav: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },

  // ── Glow decorations
  glowTop: {
    position: 'absolute',
    top: -80,
    left: '25%',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(201, 168, 76, 0.12)',
    transform: [{ scaleX: 1.8 }],
  },
  glowBottom: {
    position: 'absolute',
    bottom: -100,
    right: '10%',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(100, 60, 200, 0.1)',
    transform: [{ scaleX: 1.5 }],
  },

  // ── Header
  header: {
    alignItems: 'center',
    paddingBottom: Spacing.md,
    gap: Spacing.xs,
  },
  clapperEmoji: {
    fontSize: 52,
    marginBottom: Spacing.xs,
  },
  title: {
    ...Typography.displayLarge,
    color: Colors.goldLight,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.subtitle,
    color: Colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // ── Cards
  card: {
    borderColor: Colors.borderSubtle,
  },
  cardInner: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  cardInnerFlush: {
    padding: 0,
  },
  toggleDivider: {
    height: 1,
    backgroundColor: Colors.borderSubtle,
    marginHorizontal: Spacing.md,
  },
  sectionLabel: {
    ...Typography.label,
    color: Colors.textTertiary,
    textAlign: 'right',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: -Spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderSubtle,
    marginHorizontal: -Spacing.lg,
  },

  // ── Validation
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    textAlign: 'right',
    marginTop: -Spacing.xs,
  },

  // ── CTA
  startButton: {
    marginTop: Spacing.sm,
    marginHorizontal: Spacing.xl,
  },
});
