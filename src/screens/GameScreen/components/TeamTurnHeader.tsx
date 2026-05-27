import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CATEGORIES } from '../../../constants/categories';
import { Colors, Typography, Spacing, BorderRadius } from '../../../constants/theme';
import { CategoryId, Team } from '../../../types/game.types';

interface TeamTurnHeaderProps {
  team: Team;
  teamLabel: string;             // e.g. "الفريق الأول"
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
      {/* Team badge */}
      <LinearGradient
        colors={[Colors.goldLight, Colors.gold]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.teamBadge}
      >
        <Text style={styles.teamLabel}>{teamLabel}</Text>
        <Text style={styles.teamName} numberOfLines={1}>
          {team.name}
        </Text>
      </LinearGradient>

      {/* Spacer */}
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

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row-reverse',   // RTL
    alignItems: 'center',
    gap: Spacing.sm,
  },
  teamBadge: {
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems: 'flex-end',
    maxWidth: 160,
  },
  teamLabel: {
    ...Typography.caption,
    color: Colors.background,
    opacity: 0.75,
    letterSpacing: 0.8,
  },
  teamName: {
    ...Typography.subtitle,
    color: Colors.background,
    fontWeight: '700',
  },
  spacer: {
    flex: 1,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: Spacing.sm - 1,
    paddingHorizontal: Spacing.md - 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.goldDim,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryLabel: {
    ...Typography.label,
    color: Colors.gold,
    fontWeight: '600',
  },
});
