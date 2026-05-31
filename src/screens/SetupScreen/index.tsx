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
  Image,
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

const LOGO = require('../../../assets/icon.png');

// ── Section card wrapper ───────────────────────────────────────────────────────

function Section({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={sec.card}>
      {/* Header row — icon + title on the RIGHT */}
      <View style={sec.header}>
        <Text style={sec.title}>{title}</Text>
        <Text style={sec.icon}>{icon}</Text>
      </View>
      <View style={sec.line} />
      {children}
    </View>
  );
}

const sec = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',   // icon + title pushed to RIGHT
    gap: Spacing.sm,
  },
  icon: { fontSize: 20 },
  title: {
    ...Typography.subtitle,
    color: Colors.textSecondary,
    fontWeight: '700',
    textAlign: 'right',
  },
  line: {
    height: 1,
    backgroundColor: Colors.borderSubtle,
    marginTop: -Spacing.xs,
  },
});

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
    const errs = handleStartGame();
    if (errs) setErrors(errs);
  };

  const clearError = (field: string) => {
    if (errors[field]) setErrors((p) => { const n = { ...p }; delete n[field]; return n; });
  };

  // Logo entrance animation
  const logoAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(logoAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const logoOpacity   = logoAnim;
  const logoTranslate = logoAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <LinearGradient
        colors={['#04050F', '#0A0A20', '#04050F']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* Ambient glows */}
      <View style={styles.glowTop}    pointerEvents="none" />
      <View style={styles.glowBottom} pointerEvents="none" />

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

            {/* ══ LOGO HEADER ══════════════════════════════════════ */}
            <Animated.View
              style={[
                styles.hero,
                { opacity: logoOpacity, transform: [{ translateY: logoTranslate }] },
              ]}
            >
              <Image source={LOGO} style={styles.logo} resizeMode="contain" />
              <Text style={styles.heroTitle}>أكشن يابني</Text>
            </Animated.View>

            {/* ══ TEAMS ════════════════════════════════════════════ */}
            <Section icon="👥" title="الفرق">
              {/* Team A */}
              <View style={styles.teamBlock}>
                <Text style={styles.teamLabel}>🏅 الفريق الأول</Text>
                <TeamInput
                  label=""
                  value={teamA.name}
                  onChangeText={(t) => { setTeamName('A', t); clearError('teamA'); }}
                  placeholder="اسم الفريق الأول"
                  accentColor={Colors.goldLight}
                />
                {errors.teamA ? <Text style={styles.errorText}>{errors.teamA}</Text> : null}
              </View>

              <View style={styles.teamDivider} />

              {/* Team B */}
              <View style={styles.teamBlock}>
                <Text style={[styles.teamLabel, { color: 'rgba(180,180,255,0.85)' }]}>
                  🥈 الفريق الثاني
                </Text>
                <TeamInput
                  label=""
                  value={teamB.name}
                  onChangeText={(t) => { setTeamName('B', t); clearError('teamB'); }}
                  placeholder="اسم الفريق الثاني"
                  accentColor="rgba(180,180,255,0.85)"
                />
                {errors.teamB ? <Text style={styles.errorText}>{errors.teamB}</Text> : null}
              </View>
            </Section>

            {/* ══ CATEGORIES ═══════════════════════════════════════ */}
            <Section icon="🎭" title="الفئات">
              <CategorySelector
                selected={selectedCategories as CategoryId[]}
                onToggle={(id) => { toggleCategory(id); clearError('categories'); }}
              />
              {errors.categories ? (
                <Text style={styles.errorText}>{errors.categories}</Text>
              ) : null}
            </Section>

            {/* ══ GAME SETTINGS ════════════════════════════════════ */}
            <Section icon="⚙️" title="إعدادات اللعبة">
              <RoundPicker value={maxRounds} onChange={setMaxRounds} />
              <View style={styles.innerDivider} />
              <TimerPicker value={roundDuration} onChange={setRoundDuration} />
              <View style={styles.innerDivider} />
              <SkipLimitPicker value={skipLimit} onChange={setSkipLimit} />
            </Section>

            {/* ══ GAME MODE ════════════════════════════════════════ */}
            <Section icon="🕹️" title="أسلوب اللعب">
              <GameModePicker value={gameMode} onChange={setGameMode} />
            </Section>

            {/* ══ EXTRAS ═══════════════════════════════════════════ */}
            <Section icon="✨" title="إضافات">
              <SoundToggle enabled={isSoundEnabled} onToggle={toggleSound} />
              <View style={styles.innerDivider} />
              <RulesToggle enabled={crazyRulesEnabled} onToggle={toggleCrazyRules} />
            </Section>

            {/* ══ START BUTTON ══════════════════════════════════════ */}
            <TouchableOpacity
              onPress={onStart}
              activeOpacity={0.85}
              style={[styles.startBtn, Shadow.goldGlow]}
            >
              <LinearGradient
                colors={['#FFE066', Colors.goldLight, Colors.gold]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.startGrad}
              >
                <Text style={styles.startText}>ابدأ اللعبة  ▶</Text>
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
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },

  // ── Ambient glows ─────────────────────────────────────────────────────────
  glowTop: {
    position: 'absolute', top: -80, alignSelf: 'center',
    width: 320, height: 320, borderRadius: 160,
    backgroundColor: 'rgba(201,168,76,0.09)',
    transform: [{ scaleX: 1.8 }],
  },
  glowBottom: {
    position: 'absolute', bottom: '15%', right: -60,
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: 'rgba(90,60,200,0.07)',
  },

  // ── Logo header ───────────────────────────────────────────────────────────
  hero: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 22,
  },
  heroTitle: {
    ...Typography.displayLarge,
    color: Colors.goldLight,
    textAlign: 'center',
    textShadowColor: 'rgba(255,215,0,0.35)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },

  // ── Teams ─────────────────────────────────────────────────────────────────
  teamBlock: { gap: Spacing.xs },
  teamLabel: {
    ...Typography.label,
    color: Colors.goldLight,
    textAlign: 'right',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  teamDivider: {
    height: 1,
    backgroundColor: Colors.borderSubtle,
  },

  // ── Shared divider inside sections ────────────────────────────────────────
  innerDivider: {
    height: 1,
    backgroundColor: Colors.borderSubtle,
  },

  // ── Validation ────────────────────────────────────────────────────────────
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    textAlign: 'right',
  },

  // ── Start button ──────────────────────────────────────────────────────────
  startBtn: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginTop: Spacing.sm,
  },
  startGrad: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startText: {
    ...Typography.subtitle,
    color: Colors.background,
    fontWeight: '800',
    fontSize: 19,
    letterSpacing: 1,
  },
});
