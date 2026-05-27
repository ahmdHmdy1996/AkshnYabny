import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { GlassCard } from '../../../components/common/GlassCard';
import { CATEGORIES } from '../../../constants/categories';
import { Colors, Spacing, BorderRadius } from '../../../constants/theme';
import { ContentItem } from '../../../types/game.types';

interface ContentCardProps {
  card: ContentItem | null;
}

export const ContentCard: React.FC<ContentCardProps> = ({ card }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Animate a quick fade+scale out→in whenever the card changes
  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.94,
          duration: 120,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 120,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [card?.id, fadeAnim, scaleAnim]);

  const category = CATEGORIES.find((c) => c.id === card?.categoryId);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <GlassCard style={styles.card} innerStyle={styles.cardInner} intensity={30}>
        {/* Category watermark */}
        {category && (
          <Text style={styles.categoryWatermark}>{category.emoji}</Text>
        )}

        {/* The title — the hero element */}
        <Text
          style={styles.title}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
          numberOfLines={3}
          textBreakStrategy="balanced"
        >
          {card?.title ?? '...'}
        </Text>

        {/* Bottom category label */}
        {category && (
          <View style={styles.categoryRow}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>{category.label}</Text>
            </View>
          </View>
        )}
      </GlassCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    flex: 1,
    borderColor: 'rgba(201, 168, 76, 0.2)',
  },
  cardInner: {
    flex: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  categoryWatermark: {
    fontSize: 64,
    opacity: 0.12,
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
  },
  title: {
    fontSize: 46,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 60,
    letterSpacing: 0.5,
  },
  categoryRow: {
    alignItems: 'center',
  },
  categoryPill: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.goldDim,
  },
  categoryText: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
