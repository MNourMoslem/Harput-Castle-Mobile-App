import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import Layout from '@/constants/layout';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export type InfoChipVariant = 'pill' | 'stat';

interface InfoChipProps {
  icon: IoniconName;
  value: string;
  label?: string;
  variant?: InfoChipVariant;
  style?: StyleProp<ViewStyle>;
}

export default function InfoChip({
  icon,
  value,
  label,
  variant = 'stat',
  style,
}: InfoChipProps) {
  const isPill = variant === 'pill';

  return (
    <View style={[isPill ? styles.pill : styles.stat, style]}>
      <Ionicons
        name={icon}
        size={isPill ? 16 : 20}
        color={Colors.primary}
      />
      <Text style={isPill ? styles.pillValue : styles.statValue}>{value}</Text>
      {!isPill && label ? <Text style={styles.statLabel}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 20,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    backgroundColor: '#eef3e4',
  },
  pillValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Layout.radius.sm,
    padding: Layout.spacing.md,
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
});
