/**
 * TeamTurnHeader — CINEMA ROYALE edition
 *
 * RTL layout: Team badge on the right, category chip on the left.
 * Team badge: gold gradient pill with team label + name.
 * Category chip: dark glass pill with gold emoji + label.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CATEGORIES } from '../../../constants/categories';
import { Colors, Typography, Spacing, BorderRadius } from '../../../constants/theme';
import { CategoryId, Team } from '../../../types/game.types';

interface TeamTurnHeaderProps {
  team: Team;
  teamLabel: string;            // e.g. "الفريق الأول"
  activeCategoryId: CategoryId | undefined;
}

export const TeamTurnHeader: React.FC<TeamTurnHeaderProps> = ({
  team,
  teamLabel,
  activeCategoryId,
}) => {
  const category = CATEGORIES.find((c) => c.id === activeCategoryId);

  return (
    <View style={styles.row}>
      {/* Team badge — gold gradient pill */}
      <LinearGradient
        colors={[Colors.goldLight, Colors.gold, Colors.goldDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.teamBadge}
      >
        {/* Top shimmer */}
        <View style={styles.badgeShimmer} />
        <Text style={styles.teamLabel}>{teamLabel}</Text>
        <Text style={styles.teamName} numberOfLines={1}>
          {team.name}
        </Text>
      </LinearGradient>

      {/* Flexible gap */}
      <View style={styles.spacer} />

      {/* Category chip */}
      {category && (
        <View style={styles.categoryChip}>
          <Text style={styles.categoryEmoji}>{category.emoji}</Text>
          <Text style={styles.categoryLabel}>{category.label}</Text>
        </View>
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row-reverse',   // RTL
    alignItems: 'center',
    gap: Spacing.sm,
  },

  // ── Team badge
  teamBadge: {
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems: 'flex-end',
    maxWidth: 164,
    overflow: 'hidden',
    // Gold glow
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.40,
    shadowRadius: 10,
    elevation: 8,
  },
  badgeShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  teamLabel: {
    ...Typography.caption,
    color: Colors.background,
    opacity: 0.70,
    letterSpacing: 0.9,
  },
  teamName: {
    ...Typography.subtitle,
    color: Colors.background,
    fontWeight: '800',
  },

  spacer: {
    flex: 1,
  },

  // ── Category chip
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: Spacing.xs + 1,
    paddingHorizontal: Spacing.md - 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.goldDim,
  },
  categoryEmoji: {
    fontSize: 15,
  },
  categoryLabel: {
    ...Typography.label,
    color: Colors.gold,
    fontWeight: '600',
  },
});
