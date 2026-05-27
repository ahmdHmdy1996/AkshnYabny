import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../../constants/theme';

interface TeamInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  accentColor?: string;
}

export const TeamInput: React.FC<TeamInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  accentColor = Colors.gold,
}) => (
  <View style={styles.wrapper}>
    <Text style={[styles.label, { color: accentColor }]}>{label}</Text>
    <View style={[styles.inputContainer, { borderColor: accentColor + '55' }]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textTertiary}
        style={styles.input}
        textAlign="right"
        maxLength={20}
        returnKeyType="done"
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.xs + 2,
  },
  label: {
    ...Typography.label,
    textAlign: 'right',
    marginRight: Spacing.xs,
    letterSpacing: 0.5,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  input: {
    ...Typography.body,
    color: Colors.textPrimary,
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
});
