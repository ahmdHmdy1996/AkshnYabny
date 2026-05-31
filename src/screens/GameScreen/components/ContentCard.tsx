/**
 * ContentCard — CINEMA ROYALE edition
 *
 * Layout (top → bottom):
 *   ┌──[▪][▪][▪][▪][▪][▪][▪]──┐  film-strip bar
 *   │                          │
 *   │   category watermark     │  large faint emoji
 *   │                          │
 *   │      HUGE TITLE          │  glass card body
 *   │                          │
 *   │   [  category pill  ]    │
 *   │                          │
 *   └──[▪][▪][▪][▪][▪][▪][▪]──┘  film-strip bar
 *
 * Card flip animation plays on every card change (fade + scale).
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { GlassCard } from '../../../components/common/GlassCard';
import { CATEGORIES } from '../../../constants/categories';
import { Colors, Spacing, BorderRadius } from '../../../constants/theme';
import { ContentItem } from '../../../types/game.types';

// ─── Film strip bar ───────────────────────────────────────────────────────────

const NUM_HOLES = 7;

function FilmStripBar() {
  return (
    <View style={styles.filmStripBar}>
      {Array.from({ length: NUM_HOLES }).map((_, i) => (
        <View key={i} style={styles.filmHole} />
      ))}
    </View>
  );
}

// ─── Content card ─────────────────────────────────────────────────────────────

interface ContentCardProps {
  card: ContentItem | null;
}

export const ContentCard: React.FC<ContentCardProps> = ({ card }) => {
  const fadeAnim  = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Quick fade+scale out → in on every card change
  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 0,    duration: 110, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.94, duration: 110, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 130, friction: 7, useNativeDriver: true }),
      ]),
    ]).start();
  }, [card?.id]);

  const category = CATEGORIES.find((c) => c.id === card?.category);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      {/* Top film-strip bar */}
      <FilmStripBar />

      {/* Main glass card body */}
      <GlassCard
        goldAccent
        style={styles.card}
        innerStyle={styles.cardInner}
        intensity={35}
      >
        {/* Category emoji watermark — very faint, purely decorative */}
        {category && (
          <Text style={styles.categoryWatermark} pointerEvents="none">
            {category.emoji}
          </Text>
        )}

        {/* ── Hero title ──────────────────────────────────────────────────── */}
        <Text
          style={styles.title}
          adjustsFontSizeToFit
          minimumFontScale={0.55}
          numberOfLines={3}
          textBreakStrategy="balanced"
        >
          {card?.name ?? '...'}
        </Text>

        {/* ── Category pill ──────────────────────────────────────────────── */}
        {category && (
          <View style={styles.categoryRow}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <Text style={styles.categoryText}>{category.label}</Text>
            </View>
          </View>
        )}
      </GlassCard>

      {/* Bottom film-strip bar */}
      <FilmStripBar />
    </Animated.View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 0,       // bars butt flush against the card
  },

  // ── Film strip
  filmStripBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 7,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  filmHole: {
    width: 14,
    height: 10,
    borderRadius: 2,
    backgroundColor: Colors.background,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 184, 0, 0.18)',
  },

  // ── Glass card
  card: {
    flex: 1,
    borderRadius: 0,           // flush with the film-strip bars
    borderColor: Colors.goldBorder,
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  cardInner: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },

  // ── Category watermark (decorative)
  categoryWatermark: {
    fontSize: 80,
    opacity: 0.07,
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
  },

  // ── Title — the hero
  title: {
    fontSize: 52,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 64,
    letterSpacing: 0.3,
  },

  // ── Category pill
  categoryRow: {
    alignItems: 'center',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.xs + 1,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.goldDim,
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryText: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
