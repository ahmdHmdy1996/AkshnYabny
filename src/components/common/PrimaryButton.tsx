import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Typography, Shadow } from '../../constants/theme';
import { lightImpact } from '../../utils/haptics';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const isInert = disabled || loading;

  const handlePress = () => {
    lightImpact();
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isInert}
      activeOpacity={0.75}
      style={[styles.wrapper, isInert && styles.disabled, !isInert && Shadow.gold, style]}
    >
      <LinearGradient
        colors={isInert ? ['#3A3A3A', '#252525'] : [Colors.goldLight, Colors.gold, '#8B6914']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color={Colors.textPrimary} size="small" />
        ) : (
          <Text style={[styles.label, textStyle]}>{label}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: 17,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...Typography.subtitle,
    color: Colors.background,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  disabled: {
    opacity: 0.45,
  },
});
