import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../../constants/theme';

interface SoundToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export const SoundToggle: React.FC<SoundToggleProps> = ({ enabled, onToggle }) => (
  <TouchableOpacity
    onPress={onToggle}
    activeOpacity={0.75}
    style={[styles.row, enabled && styles.rowActive]}
  >
    {/* Label side (RTL: right) */}
    <View style={styles.textGroup}>
      <Text style={[styles.title, enabled && styles.titleActive]}>
        {enabled ? 'الصوت مفعّل 🔊' : 'الصوت متوقف 🔇'}
      </Text>
      <Text style={styles.subtitle}>
        {enabled ? 'مؤثرات صوتية شغّالة' : 'وضع صامت'}
      </Text>
    </View>

    {/* Toggle pill */}
    <View style={[styles.track, enabled && styles.trackActive, enabled && Shadow.gold]}>
      <View style={[styles.thumb, enabled && styles.thumbActive]} />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: 'rgba(255,255,255,0.03)',
    gap: Spacing.md,
  },
  rowActive: {
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.goldDim,
  },
  textGroup: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 3,
  },
  title: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  titleActive: {
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  track: {
    width: 48,
    height: 26,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 3,
    justifyContent: 'center',
  },
  trackActive: {
    backgroundColor: Colors.gold,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.textTertiary,
    alignSelf: 'flex-start',
  },
  thumbActive: {
    backgroundColor: Colors.background,
    alignSelf: 'flex-end',
  },
});
