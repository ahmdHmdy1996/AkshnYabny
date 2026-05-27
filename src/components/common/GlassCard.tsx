import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, BorderRadius } from '../../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  innerStyle?: ViewStyle;
  /** BlurView intensity (iOS). On Android falls back to a semi-opaque layer. */
  intensity?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  innerStyle,
  intensity = 25,
}) => {
  if (Platform.OS === 'android') {
    return (
      <View style={[styles.androidFallback, style]}>
        <View style={[styles.inner, innerStyle]}>{children}</View>
      </View>
    );
  }

  return (
    <BlurView intensity={intensity} tint="dark" style={[styles.blur, style]}>
      <View style={[styles.inner, innerStyle]}>{children}</View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  blur: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  androidFallback: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: 'rgba(20, 20, 40, 0.85)',
  },
  inner: {
    backgroundColor: Colors.glass,
  },
});
