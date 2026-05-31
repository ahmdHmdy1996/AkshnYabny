/**
 * SwipeableCard — Tinder-style gesture card for CINEMA ROYALE
 *
 * Built entirely on React Native's built-in Animated + PanResponder APIs.
 * Zero external dependencies → works with Expo Go, no native rebuild needed.
 *
 * ── Gesture mechanics ─────────────────────────────────────────────────────────
 *   Pan RIGHT  →  "Correct"  emerald overlay + ✓ badge, flies off right
 *   Pan LEFT   →  "Skip"     crimson  overlay + ✗ badge, flies off left
 *                            (blocked when isSkipDisabled — shakes back)
 *   Short pan  →  Springs back, no action triggered
 *
 * ── Animation layers ──────────────────────────────────────────────────────────
 *   Outer Animated.View — entrance (scale 0.84→1, opacity 0→1)
 *     uses useNativeDriver: true  → runs on UI thread, silky 60 fps
 *
 *   Inner Animated.View — pan gesture (translateX, translateY, rotate)
 *     uses useNativeDriver: false → JS-driven; required because
 *     PanResponder events live on the JS thread.  Still visually smooth
 *     because pan is a direct 1:1 finger-follow (no computation needed).
 *
 * ── Exit sequence ─────────────────────────────────────────────────────────────
 *   Card flies off-screen (280 ms) → Animated callback fires
 *   → onSwipeRight | onSwipeLeft called
 *   → parent advances currentCard (store.advanceCard)
 *   → React swaps key → old instance unmounts (already off-screen)
 *   → new SwipeableCard mounts and plays entrance
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { BlurView } from 'expo-blur';

import { CATEGORIES }                    from '../../../constants/categories';
import { Colors, Spacing, BorderRadius } from '../../../constants/theme';
import { ContentItem }                   from '../../../types/game.types';

// ─── Motion constants ─────────────────────────────────────────────────────────

const { width: SW } = Dimensions.get('window');

/** Horizontal displacement (px) that commits the swipe. */
const SWIPE_THRESHOLD    = SW * 0.30;
/**
 * PanResponder gives velocity in px/ms, roughly normalised to ±1 for a
 * natural flick. 0.8 = fast enough to commit even if distance is short.
 */
const VELOCITY_THRESHOLD = 0.8;
/** How far off-screen the card travels on exit. */
const EXIT_DISTANCE      = SW * 1.55;
/** Exit slide duration (ms). */
const EXIT_DURATION      = 280;
/** Vertical drag is damped by this factor so the card mostly moves sideways. */
const VERTICAL_FOLLOW    = 0.18;

// ─── Film-strip perforation bar ───────────────────────────────────────────────

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

// ─── Platform-aware glassmorphism card body ───────────────────────────────────

function CardBody({ children }: { children: React.ReactNode }) {
  const inner = (
    <>
      <View style={styles.goldEdge} pointerEvents="none" />
      <View style={styles.cardInner}>{children}</View>
    </>
  );

  if (Platform.OS === 'ios') {
    return (
      <BlurView intensity={50} tint="dark" style={styles.cardBody}>
        {inner}
      </BlurView>
    );
  }
  return (
    <View style={[styles.cardBody, styles.cardBodyAndroid]}>
      {inner}
    </View>
  );
}

// ─── Swipe-direction badge ────────────────────────────────────────────────────

interface BadgeProps {
  icon:  string;
  label: string;
  color: string;
  side:  'left' | 'right';
}

function SwipeBadge({ icon, label, color, side }: BadgeProps) {
  return (
    <View style={[
      styles.badge,
      side === 'right' ? styles.badgeRight : styles.badgeLeft,
      { borderColor: color },
    ]}>
      <Text style={[styles.badgeIcon,  { color }]}>{icon}</Text>
      <Text style={[styles.badgeLabel, { color }]}>{label}</Text>
    </View>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SwipeableCardProps {
  card:           ContentItem | null;
  /** When true, leftward swipes bounce back without triggering the skip. */
  isSkipDisabled: boolean;
  /** Called after the exit animation finishes on a right swipe. */
  onSwipeRight:   () => void;
  /** Called after the exit animation finishes on a left swipe. */
  onSwipeLeft:    () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  card,
  isSkipDisabled,
  onSwipeRight,
  onSwipeLeft,
}) => {

  // ── Entrance values (native driver ✓) ─────────────────────────────────────
  const entranceScale   = useRef(new Animated.Value(0.84)).current;
  const entranceOpacity = useRef(new Animated.Value(0)).current;

  // ── Pan values (JS driver — required by PanResponder) ─────────────────────
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  /**
   * Prop refs — PanResponder is created exactly once (on mount) so its
   * callbacks close over the initial props. Refs give access to the LATEST
   * values without recreating the PanResponder on every render.
   */
  const isSkipDisabledRef = useRef(isSkipDisabled);
  const onSwipeRightRef   = useRef(onSwipeRight);
  const onSwipeLeftRef    = useRef(onSwipeLeft);

  // Update refs every render (no useEffect needed — this is synchronous)
  isSkipDisabledRef.current = isSkipDisabled;
  onSwipeRightRef.current   = onSwipeRight;
  onSwipeLeftRef.current    = onSwipeLeft;

  // ── Entrance animation (fires once per fresh mount) ────────────────────────
  useEffect(() => {
    Animated.parallel([
      Animated.spring(entranceScale, {
        toValue:  1,
        tension:  52,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(entranceOpacity, {
        toValue:  1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived animated values (all JS-driver, consistent with pan) ───────────

  const rotate = pan.x.interpolate({
    inputRange:  [-SW / 2, 0, SW / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  // Emerald overlay fades in as the card moves right
  const rightOverlayOpacity = pan.x.interpolate({
    inputRange:  [0, SWIPE_THRESHOLD * 0.55],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Crimson overlay fades in as the card moves left
  const leftOverlayOpacity = pan.x.interpolate({
    inputRange:  [-SWIPE_THRESHOLD * 0.55, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // ── PanResponder (created once) ────────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      /**
       * Don't claim the gesture immediately on touch-down — wait until there is
       * clear horizontal intent so taps on buttons still register correctly.
       */
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder:  (_, { dx, dy }) =>
        Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy),

      onPanResponderMove: (_, { dx, dy }) => {
        pan.setValue({ x: dx, y: dy * VERTICAL_FOLLOW });
      },

      onPanResponderRelease: (_, { dx, dy, vx }) => {
        const movedRight = dx > SWIPE_THRESHOLD || vx >  VELOCITY_THRESHOLD;
        const movedLeft  = dx < -SWIPE_THRESHOLD || vx < -VELOCITY_THRESHOLD;

        if (movedRight) {
          // ── Correct — fly off to the right ──────────────────────────────
          Animated.parallel([
            Animated.timing(pan.x, {
              toValue: EXIT_DISTANCE,
              duration: EXIT_DURATION,
              useNativeDriver: false,
            }),
            Animated.timing(pan.y, {
              toValue: dy * VERTICAL_FOLLOW * 2.5,
              duration: EXIT_DURATION,
              useNativeDriver: false,
            }),
          ]).start(() => onSwipeRightRef.current());

        } else if (movedLeft && !isSkipDisabledRef.current) {
          // ── Skip — fly off to the left ───────────────────────────────────
          Animated.parallel([
            Animated.timing(pan.x, {
              toValue: -EXIT_DISTANCE,
              duration: EXIT_DURATION,
              useNativeDriver: false,
            }),
            Animated.timing(pan.y, {
              toValue: dy * VERTICAL_FOLLOW * 2.5,
              duration: EXIT_DURATION,
              useNativeDriver: false,
            }),
          ]).start(() => onSwipeLeftRef.current());

        } else if (movedLeft && isSkipDisabledRef.current) {
          // ── Skip blocked — characteristic shake, then spring back ────────
          Animated.sequence([
            Animated.timing(pan.x, { toValue: -22, duration: 65, useNativeDriver: false }),
            Animated.timing(pan.x, { toValue:  16, duration: 55, useNativeDriver: false }),
            Animated.timing(pan.x, { toValue: -10, duration: 45, useNativeDriver: false }),
            Animated.spring (pan.x, { toValue: 0, tension: 320, friction: 14, useNativeDriver: false }),
          ]).start();
          Animated.spring(pan.y, { toValue: 0, tension: 320, friction: 14, useNativeDriver: false }).start();

        } else {
          // ── Not enough — snap back ───────────────────────────────────────
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            tension:  52,
            friction: 8,
            useNativeDriver: false,
          }).start();
        }
      },

      // Gesture was cancelled by the system (e.g. another touch started)
      onPanResponderTerminate: () => {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  // ── Render ─────────────────────────────────────────────────────────────────
  const category = CATEGORIES.find((c) => c.id === card?.category);

  return (
    /**
     * OUTER VIEW — entrance animation only (native driver ✓)
     * The outer view never moves; it just fades + scales in on mount.
     */
    <Animated.View
      style={[
        styles.root,
        {
          opacity:   entranceOpacity,
          transform: [{ scale: entranceScale }],
        },
      ]}
    >
      {/**
       * INNER VIEW — pan gesture (JS driver)
       * Receives panHandlers and applies all gesture-driven transforms.
       * Positioned absolute so it fills the outer view exactly.
       */}
      <Animated.View
        style={[
          styles.root,
          {
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
              { rotate },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* ── Film strip (top) ──────────────────────────────────────────── */}
        <FilmStripBar />

        {/* ── Glass card body ───────────────────────────────────────────── */}
        <View style={styles.cardGlow}>
          <CardBody>
            {/* Faint category emoji — decorative background */}
            {category && (
              <Text style={styles.watermark} pointerEvents="none">
                {category.emoji}
              </Text>
            )}

            {/* Hero title */}
            <Text
              style={styles.title}
              adjustsFontSizeToFit
              minimumFontScale={0.52}
              numberOfLines={3}
              textBreakStrategy="balanced"
            >
              {card?.name ?? '...'}
            </Text>

            {/* Category pill */}
            {category && (
              <View style={styles.pillRow}>
                <View style={styles.pill}>
                  <Text style={styles.pillEmoji}>{category.emoji}</Text>
                  <Text style={styles.pillLabel}>{category.label}</Text>
                </View>
              </View>
            )}
          </CardBody>
        </View>

        {/* ── Film strip (bottom) ───────────────────────────────────────── */}
        <FilmStripBar />

        {/* ── RIGHT overlay — emerald "correct" ─────────────────────────── */}
        <Animated.View
          style={[styles.overlay, styles.overlayRight, { opacity: rightOverlayOpacity }]}
          pointerEvents="none"
        >
          <SwipeBadge icon="✓" label="صح"    color={Colors.emerald} side="right" />
        </Animated.View>

        {/* ── LEFT overlay — crimson "skip" ──────────────────────────────── */}
        <Animated.View
          style={[styles.overlay, styles.overlayLeft, { opacity: leftOverlayOpacity }]}
          pointerEvents="none"
        >
          <SwipeBadge icon="✗" label="تخطي" color={Colors.crimson} side="left" />
        </Animated.View>

      </Animated.View>
    </Animated.View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  // Both Animated.View layers share flex:1 so they fill the parent
  root: {
    flex: 1,
  },

  // ── Film-strip bars ──────────────────────────────────────────────────────────
  filmStripBar: {
    flexDirection:  'row',
    justifyContent: 'space-evenly',
    alignItems:     'center',
    paddingVertical: 7,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  filmHole: {
    width:  14,
    height: 10,
    borderRadius: 2,
    backgroundColor: Colors.background,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 184, 0, 0.18)',
  },

  // ── Gold border wrapper (static glow; animated version required Reanimated) ──
  cardGlow: {
    flex: 1,
    borderLeftWidth:  1,
    borderRightWidth: 1,
    borderColor: Colors.goldBorder,
    shadowColor:   Colors.gold,
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius:  22,
    elevation:     14,
  },

  // ── Card body ─────────────────────────────────────────────────────────────────
  cardBody: {
    flex:     1,
    overflow: 'hidden',
  },
  cardBodyAndroid: {
    backgroundColor: 'rgba(6, 7, 18, 0.93)',
  },

  // 1-px gold shimmer along the top edge
  goldEdge: {
    position:        'absolute',
    top: 0, left: 0, right: 0,
    height:          1,
    zIndex:          1,
    backgroundColor: 'rgba(255, 184, 0, 0.38)',
  },

  // Very subtle glass tint over the blur
  cardInner: {
    flex: 1,
    backgroundColor:   'rgba(255, 255, 255, 0.035)',
    paddingHorizontal:  Spacing.xl,
    paddingVertical:    Spacing.lg,
    alignItems:        'center',
    justifyContent:    'center',
    gap:               Spacing.lg,
  },

  // ── Faint emoji watermark ─────────────────────────────────────────────────────
  watermark: {
    fontSize:  80,
    opacity:   0.07,
    position:  'absolute',
    top:       Spacing.md,
    right:     Spacing.md,
  },

  // ── Hero title ────────────────────────────────────────────────────────────────
  title: {
    fontSize:    52,
    fontWeight:  '800',
    color:       Colors.textPrimary,
    textAlign:   'center',
    lineHeight:  64,
    letterSpacing: 0.3,
    textShadowColor:  'rgba(255, 184, 0, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  // ── Category pill ─────────────────────────────────────────────────────────────
  pillRow: { alignItems: 'center' },
  pill: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
    paddingVertical:   Spacing.xs + 1,
    paddingHorizontal: Spacing.md,
    borderRadius:  BorderRadius.full,
    borderWidth:   1,
    borderColor:   Colors.goldBorder,
    backgroundColor: Colors.goldDim,
  },
  pillEmoji: { fontSize: 14 },
  pillLabel: {
    color:       Colors.gold,
    fontSize:    13,
    fontWeight:  '600',
    letterSpacing: 1,
  },

  // ── Swipe overlays (absoluteFill over entire card including film strips) ───────
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  overlayRight: {
    backgroundColor: 'rgba(0, 230, 118, 0.18)',
    justifyContent:  'flex-start',
    alignItems:      'flex-end',
    padding:         Spacing.lg,
    paddingTop:      Spacing.xl + Spacing.lg,
  },
  overlayLeft: {
    backgroundColor: 'rgba(255, 61, 113, 0.18)',
    justifyContent:  'flex-start',
    alignItems:      'flex-start',
    padding:         Spacing.lg,
    paddingTop:      Spacing.xl + Spacing.lg,
  },

  // ── Swipe badges ──────────────────────────────────────────────────────────────
  badge: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             6,
    paddingVertical:    8,
    paddingHorizontal: 16,
    borderRadius:   10,
    borderWidth:    2.5,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  badgeRight: { transform: [{ rotate:  '8deg' }] },
  badgeLeft:  { transform: [{ rotate: '-8deg' }] },
  badgeIcon: {
    fontSize:   26,
    fontWeight: '900',
    lineHeight: 30,
  },
  badgeLabel: {
    fontSize:    16,
    fontWeight:  '800',
    letterSpacing: 1.5,
  },
});
