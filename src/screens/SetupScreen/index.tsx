import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { PrimaryButton }     from '../../components/common/PrimaryButton';
import { TeamInput }         from './components/TeamInput';
import { CategorySelector }  from './components/CategorySelector';
import { RulesToggle }       from './components/RulesToggle';
import { SoundToggle }       from './components/SoundToggle';
import { RoundPicker }       from './components/RoundPicker';
import { TimerPicker }       from './components/TimerPicker';
import { SkipLimitPicker }   from './components/SkipLimitPicker';
import { GameModePicker }    from './components/GameModePicker';
import { useSetupForm }      from './hooks/useSetupForm';
import { Colors, Spacing, Typography, BorderRadius, Shadow } from '../../constants/theme';
import { CategoryId }        from '../../types/game.types';

// ── Section header ─────────────────────────────────────────────────────────────

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <View style={sh.row}>
      <Text style={sh.icon}>{icon}</Text>
      <Text style={sh.text}>{title}</Text>
    </View>
  );
}
const sh = StyleSheet.create({
  row:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  icon: { fontSize: 18 },
  text: { ...Typography.label, color: Colors.textSecondary, letterSpacing: 1.2, textTransform: 'uppercase' },
});

// ── Divider ────────────────────────────────────────────────────────────────────

function Divider() {
  return <View style={{ height: 1, backgroundColor: Colors.borderSubtle, marginVertical: Spacing.sm }} />;
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export function SetupScreen() {
  const {
    teamA, teamB, selectedCategories, crazyRulesEnabled,
    maxRounds, isSoundEnabled, gameMode, roundDuration, skipLimit,
    setTeamName, toggleCategory, toggleCrazyRules, setMaxRounds,
    toggleSound, setGameMode, setRoundDuration, setSkipLimit,
    handleStartGame,
  } = useSetupForm();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const onStart = () => {
    const validationErrors = handleStartGame();
    if (validationErrors) setErrors(validationErrors);
  };

  const clearError = (field: string) => {
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  // ── Header animation ─────────────────────────────────────────────────────────
  const logoScale   = useRef(new Animated.Value(0.85)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale,   { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 500,             useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Background */}
      <LinearGradient
        colors={['#050510', '#0D0D22', '#06060F']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative glows */}
      <View style={styles.glowA} pointerEvents="none" />
      <View style={styles.glowB} pointerEvents="none" />
      <View style={styles.glowC} pointerEvents="none" />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >

            {/* ══════════════════ HERO HEADER ══════════════════ */}
            <Animated.View
              style={[styles.hero, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
            >
              <View style={styles.filmStrip}>
                {['●','●','●','●','●'].map((_, i) => (
                  <View key={i} style={styles.filmHole} />
                ))}
              </View>
              <Text style={styles.heroEmoji}>🎬</Text>
              <Text style={styles.heroTitle}>أكشن يابني</Text>
              <Text style={styles.heroSub}>الشاراد المصري</Text>
              <View style={styles.filmStrip}>
                {['●','●','●','●','●'].map((_, i) => (
                  <View key={i} style={styles.filmHole} />
                ))}
              </View>
            </Animated.View>

            {/* ══════════════════ TEAMS ══════════════════ */}
            <View style={styles.card}>
              <SectionHeader icon="👥" title="الفرق" />

              <View style={styles.teamRow}>
                {/* Team A */}
                <View style={[styles.teamBox, styles.teamBoxA]}>
                  <Text style={styles.teamBadgeA}>🏅 الفريق الأول</Text>
                  <TeamInput
                    label=""
                    value={teamA.name}
                    onChangeText={(t) => { setTeamName('A', t); clearError('teamA'); }}
                    placeholder="اسم الفريق"
                    accentColor={Colors.goldLight}
                  />
                  {errors.teamA ? <Text style={styles.errorText}>{errors.teamA}</Text> : null}
                </View>

                <View style={styles.vsContainer}>
                  <Text style={styles.vsText}>VS</Text>
                </View>

                {/* Team B */}
                <View style={[styles.teamBox, styles.teamBoxB]}>
                  <Text style={styles.teamBadgeB}>🥈 الفريق الثاني</Text>
                  <TeamInput
                    label=""
                    value={teamB.name}
                    onChangeText={(t) => { setTeamName('B', t); clearError('teamB'); }}
                    placeholder="اسم الفريق"
                    accentColor="rgba(180,180,255,0.85)"
                  />
                  {errors.teamB ? <Text style={styles.errorText}>{errors.teamB}</Text> : null}
                </View>
              </View>
            </View>

            {/* ══════════════════ CATEGORIES ══════════════════ */}
            <View style={styles.card}>
              <SectionHeader icon="🎭" title="الفئات" />
              <CategorySelector
                selected={selectedCategories as CategoryId[]}
                onToggle={(id) => { toggleCategory(id); clearError('categories'); }}
              />
              {errors.categories ? (
                <Text style={[styles.errorText, { marginTop: Spacing.xs }]}>
                  {errors.categories}
                </Text>
              ) : null}
            </View>

            {/* ══════════════════ GAME SETTINGS ══════════════════ */}
            <View style={styles.card}>
              <SectionHeader icon="⚙️" title="إعدادات اللعبة" />

              <RoundPicker value={maxRounds} onChange={setMaxRounds} />

              <Divider />

              <TimerPicker value={roundDuration} onChange={setRoundDuration} />

              <Divider />

              <SkipLimitPicker value={skipLimit} onChange={setSkipLimit} />
            </View>

            {/* ══════════════════ GAME MODE ══════════════════ */}
            <View style={styles.card}>
              <SectionHeader icon="🕹️" title="أسلوب اللعب" />
              <GameModePicker value={gameMode} onChange={setGameMode} />
            </View>

            {/* ══════════════════ EXTRAS ══════════════════ */}
            <View style={styles.card}>
              <SectionHeader icon="✨" title="إضافات" />
              <SoundToggle enabled={isSoundEnabled} onToggle={toggleSound} />
              <View style={styles.toggleDivider} />
              <RulesToggle enabled={crazyRulesEnabled} onToggle={toggleCrazyRules} />
            </View>

            {/* ══════════════════ START BUTTON ══════════════════ */}
            <TouchableOpacity
              onPress={onStart}
              activeOpacity={0.85}
              style={[styles.startOuter, Shadow.goldGlow]}
            >
              <LinearGradient
                colors={['#FFE066', Colors.goldLight, Colors.gold, '#B8860B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.startGradient}
              >
                <Text style={styles.startIcon}>▶</Text>
                <Text style={styles.startText}>ابدأ اللعبة</Text>
              </LinearGradient>
            </TouchableOpacity>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  safe: { flex: 1 },

  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },

  // ── Glow decorations ────────────────────────────────────────────────────────
  glowA: {
    position: 'absolute', top: -60, left: '20%',
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: 'rgba(201, 168, 76, 0.10)',
    transform: [{ scaleX: 1.6 }],
  },
  glowB: {
    position: 'absolute', bottom: '30%', right: -40,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(100, 60, 200, 0.09)',
  },
  glowC: {
    position: 'absolute', bottom: '10%', left: -30,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(0, 180, 120, 0.05)',
  },

  // ── Hero header ─────────────────────────────────────────────────────────────
  hero: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: 4,
  },
  filmStrip: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 6,
  },
  filmHole: {
    width: 10, height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,215,0,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.4)',
  },
  heroEmoji: {
    fontSize: 56,
    marginVertical: Spacing.sm,
  },
  heroTitle: {
    ...Typography.displayLarge,
    color: Colors.goldLight,
    fontSize: 38,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 215, 0, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  heroSub: {
    ...Typography.label,
    color: Colors.textTertiary,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: 2,
  },

  // ── Cards ───────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    padding: Spacing.lg,
    gap: Spacing.md,
  },

  // ── Teams ───────────────────────────────────────────────────────────────────
  teamRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  teamBox: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  teamBoxA: {
    backgroundColor: 'rgba(255,215,0,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.15)',
  },
  teamBoxB: {
    backgroundColor: 'rgba(180,180,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(180,180,255,0.15)',
  },
  teamBadgeA: {
    ...Typography.caption,
    color: Colors.goldLight,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  teamBadgeB: {
    ...Typography.caption,
    color: 'rgba(180,180,255,0.85)',
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  vsContainer: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xl,
  },
  vsText: {
    ...Typography.label,
    color: Colors.textTertiary,
    fontWeight: '900',
    letterSpacing: 2,
  },

  // ── Settings grid ────────────────────────────────────────────────────────────
  settingsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  settingCell: {
    flex: 1,
  },

  // ── Toggles ─────────────────────────────────────────────────────────────────
  toggleDivider: {
    height: 1,
    backgroundColor: Colors.borderSubtle,
    marginVertical: Spacing.xs,
  },

  // ── Validation ───────────────────────────────────────────────────────────────
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    textAlign: 'right',
    marginTop: -Spacing.xs,
  },

  // ── Start button ─────────────────────────────────────────────────────────────
  startOuter: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginTop: Spacing.sm,
    marginHorizontal: Spacing.sm,
  },
  startGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  startIcon: {
    fontSize: 20,
    color: Colors.background,
  },
  startText: {
    ...Typography.subtitle,
    color: Colors.background,
    fontWeight: '800',
    fontSize: 20,
    letterSpacing: 1,
  },
});
