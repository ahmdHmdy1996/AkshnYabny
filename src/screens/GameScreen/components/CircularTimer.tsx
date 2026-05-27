import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors, Typography } from '../../../constants/theme';

const SIZE = 110;
const STROKE_WIDTH = 7;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = SIZE / 2;

interface CircularTimerProps {
  timeLeft: number;
  progress: number;   // 1.0 → full, 0.0 → empty
  isWarning: boolean;
}

export const CircularTimer: React.FC<CircularTimerProps> = ({
  timeLeft,
  progress,
  isWarning,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  // Pulse the ring + number when the warning kicks in
  useEffect(() => {
    if (isWarning) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.06,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.current.start();
    } else {
      pulseLoop.current?.stop();
      pulseAnim.setValue(1);
    }
    return () => pulseLoop.current?.stop();
  }, [isWarning, pulseAnim]);

  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  const strokeColor = isWarning ? '#FF4444' : Colors.gold;

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale: pulseAnim }] }]}>
      <Svg width={SIZE} height={SIZE}>
        {/* Track */}
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        {/* Progress arc — rotated to start from 12 o'clock */}
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          stroke={strokeColor}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${CENTER}, ${CENTER}`}
        />
      </Svg>

      {/* Centred number */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.center}>
          <Text style={[styles.number, isWarning && styles.numberWarning]}>
            {timeLeft}
          </Text>
          <Text style={styles.unit}>ثانية</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    ...Typography.displayLarge,
    fontSize: 30,
    color: Colors.textPrimary,
    lineHeight: 34,
  },
  numberWarning: {
    color: '#FF4444',
  },
  unit: {
    ...Typography.caption,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
  },
});
