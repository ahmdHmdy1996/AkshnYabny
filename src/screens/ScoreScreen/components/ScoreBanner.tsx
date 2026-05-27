import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Spacing, Typography } from '../../../constants/theme';

export const ScoreBanner: React.FC = () => {
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Text style={styles.emoji}>⏳</Text>
      <Text style={styles.title}>انتهى الوقت!</Text>
      <Text style={styles.subtitle}>وقت حساب النقاط</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  emoji: {
    fontSize: 52,
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.displayLarge,
    color: Colors.goldLight,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.subtitle,
    color: Colors.textSecondary,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
});
