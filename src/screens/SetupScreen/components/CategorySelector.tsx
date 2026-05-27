import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckboxItem } from '../../../components/common/CheckboxItem';
import { CATEGORIES } from '../../../constants/categories';
import { Colors, Typography, Spacing } from '../../../constants/theme';
import { CategoryId } from '../../../types/game.types';

interface CategorySelectorProps {
  selected: CategoryId[];
  onToggle: (id: CategoryId) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selected,
  onToggle,
}) => (
  <View style={styles.wrapper}>
    <Text style={styles.heading}>اختار الفئات</Text>
    <View style={styles.list}>
      {CATEGORIES.map((cat) => (
        <CheckboxItem
          key={cat.id}
          label={cat.label}
          emoji={cat.emoji}
          checked={selected.includes(cat.id)}
          onToggle={() => onToggle(cat.id)}
        />
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.sm,
  },
  heading: {
    ...Typography.label,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginRight: Spacing.xs,
    letterSpacing: 0.5,
  },
  list: {
    gap: Spacing.sm - 2,
  },
});
