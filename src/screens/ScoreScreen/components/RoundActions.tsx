import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Typography, Shadow } from '../../../constants/theme';
import { Team } from '../../../types/game.types';
import { lightImpact } from '../../../utils/haptics';

interface RoundActionsProps {
  nextTeam: Team;
  isGameOver: boolean;
  onNextRound: () => void;
  onCrownWinner: () => void;
  onEndGame: () => void;
}

export const RoundActions: React.FC<RoundActionsProps> = ({
  nextTeam,
  isGameOver,
  onNextRound,
  onCrownWinner,
  onEndGame,
}) => {
  const slideAnim = useRef(new Animated.Value(40)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 8,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: opacityAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* ── Primary action (context-dependent) ──────────────── */}
      {isGameOver ? (
        <TouchableOpacity
          onPress={() => { lightImpact(); onCrownWinner(); }}
          activeOpacity={0.8}
          style={[styles.primaryWrapper, styles.crownShadow]}
        >
          <LinearGradient
            colors={['#FFE066', Colors.goldLight, Colors.gold]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryGradient}
          >
            <Text style={styles.primaryText}>تتويج البطل  🏆</Text>
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => { lightImpact(); onNextRound(); }}
          activeOpacity={0.8}
          style={[styles.primaryWrapper, Shadow.gold]}
        >
          <LinearGradient
            colors={[Colors.goldLight, Colors.gold, '#8B6914']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryGradient}
          >
            <Text style={styles.primaryText} numberOfLines={1} adjustsFontSizeToFit>
              {'الجولة القادمة: دور '}
              <Text style={styles.teamHighlight}>{nextTeam.name}</Text>
              {'  ▶️'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* ── Secondary: end game — intentionally no haptic (destructive) ── */}
      <TouchableOpacity
        onPress={onEndGame}
        activeOpacity={0.7}
        style={styles.secondaryBtn}
      >
        <Text style={styles.secondaryText}>إنهاء اللعبة  🛑</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  primaryWrapper: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  crownShadow: {
    shadowColor: '#FFE066',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 10,
  },
  primaryGradient: {
    paddingVertical: 17,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    ...Typography.subtitle,
    color: Colors.background,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  teamHighlight: {
    fontWeight: '900',
  },
  secondaryBtn: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 90, 90, 0.35)',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 80, 80, 0.06)',
  },
  secondaryText: {
    ...Typography.body,
    color: '#FF7070',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
