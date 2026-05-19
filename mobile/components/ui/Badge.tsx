/**
 * Badge — reusable pill/label component.
 *
 * Variants:
 *   visited   — green filled, used on PlaceCard when the user has been there
 *   favorite  — red filled, reserved for future use
 *   category  — muted background, used for place category labels
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import Layout from '@/constants/layout';

export type BadgeVariant = 'visited' | 'favorite' | 'category';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
}

const VARIANT_STYLES: Record<
  BadgeVariant,
  { bg: string; text: string; icon: string }
> = {
  visited: {
    bg: Colors.visited,
    text: '#fff',
    icon: '#fff',
  },
  favorite: {
    bg: '#E05252',
    text: '#fff',
    icon: '#fff',
  },
  category: {
    bg: Colors.background,
    text: Colors.primary,
    icon: Colors.primary,
  },
};

export default function Badge({ label, variant = 'category', icon }: BadgeProps) {
  const v = VARIANT_STYLES[variant];
  return (
    <View style={[styles.badge, { backgroundColor: v.bg }]}>
      {icon && <Ionicons name={icon} size={11} color={v.icon} />}
      <Text style={[styles.label, { color: v.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});
