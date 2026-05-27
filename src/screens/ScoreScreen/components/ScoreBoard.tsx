import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, Shadow } from '../../../constants/theme';
import { Team } from '../../../types/game.types';

// ─── Score counter: animates from 0 → target on mount ────────────────────────

function useCountUp(target: number): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const STEPS = 24;
    const INTERVAL = 600 / STEPS;  // ~600 ms total
    let current = 0;
    const id = setInterval(() => {
      current = Math.min(current + Math.ceil(target / STEPS), target);
      setCount(current);
      if (current >= target) clearInterval(id);
    }, INTERVAL);
    return () => clearInterval(id);
  }, [target]);
  return count;
}

// ─── Individual team card ─────────────────────────────────────────────────────

interface TeamCardProps {
  team: Team;
  isLeading: boolean;
  isTied: boolean;
  slideFrom: 'left' | 'right';
}

const TeamCard: React.FC<TeamCardProps> = ({ team, isLeading, isTied, slideFrom }) => {
  const displayScore = useCountUp(team.score);
  const translateX = useRef(new Animated.Value(slideFrom === 'left' ? -60 : 60)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        tension: 70,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        delay: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateX, opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        isLeading && styles.cardWrapperLeading,
        { opacity: opacityAnim, transform: [{ translateX }] },
      ]}
    >
      {/* Crown sits above the card for the leader */}
      <Text style={[styles.crown, !isLeading && styles.crownHidden]}>👑</Text>

      <View style={[styles.card, isLeading && styles.cardLeading]}>
        <Text style={styles.teamName} numberOfLines={2} adjustsFontSizeToFit>
          {team.name}
        </Text>

        <Text style={[styles.score, isLeading && styles.scoreLeading]}>
          {displayScore}
        </Text>

        {isLeading && (
          <View style={styles.leadingBadge}>
            <Text style={styles.leadingBadgeText}>يقود الآن</Text>
          </View>
        )}

        {isTied && (
          <View style={styles.tieBadge}>
            <Text style={styles.tieBadgeText}>تعادل</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

// ─── Board: two cards + VS ────────────────────────────────────────────────────

interface ScoreBoardProps {
  teamA: Team;
  teamB: Team;
  leadingTeam: 'A' | 'B' | null;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  teamA,
  teamB,
  leadingTeam,
}) => {
  const isTied = teamA.score === teamB.score && teamA.score > 0;

  return (
    <View style={styles.board}>
      <TeamCard
        team={teamA}
        isLeading={leadingTeam === 'A'}
        isTied={isTied}
        slideFrom="left"
      />

      {/* VS divider */}
      <View style={styles.vsDivider}>
        <View style={styles.vsLine} />
        <View style={styles.vsCircle}>
          <Text style={styles.vsText}>VS</Text>
        </View>
        <View style={styles.vsLine} />
      </View>

      <TeamCard
        team={teamB}
        isLeading={leadingTeam === 'B'}
        isTied={isTied}
        slideFrom="right"
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  board: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },

  // ── Card wrapper (handles crown + shadow positioning)
  cardWrapper: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs - 2,
  },
  cardWrapperLeading: {
    ...Shadow.gold,
  },

  crown: {
    fontSize: 26,
  },
  crownHidden: {
    opacity: 0,        // preserve layout height
  },

  // ── The glass card itself
  card: {
    width: '100%',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.glass,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    gap: Spacing.sm,
    overflow: 'hidden',
  },
  cardLeading: {
    borderColor: Colors.goldBorder,
    backgroundColor: 'rgba(201, 168, 76, 0.1)',
  },

  teamName: {
    ...Typography.label,
    color: Colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.5,
    minHeight: 36,
  },
  score: {
    fontSize: 64,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 70,
    letterSpacing: -1,
  },
  scoreLeading: {
    color: Colors.goldLight,
  },

  leadingBadge: {
    paddingVertical: 3,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.goldDim,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  leadingBadgeText: {
    ...Typography.caption,
    color: Colors.gold,
    fontWeight: '600',
    letterSpacing: 0.8,
  },

  tieBadge: {
    paddingVertical: 3,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  tieBadgeText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    letterSpacing: 0.8,
  },

  // ── VS divider
  vsDivider: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Spacing.md,
  },
  vsLine: {
    width: 1,
    height: 28,
    backgroundColor: Colors.borderSubtle,
  },
  vsCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    backgroundColor: Colors.glassDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
