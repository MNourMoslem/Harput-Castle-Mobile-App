import React from 'react';
import { TouchableOpacity, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { Href } from 'expo-router';
import Colors from '@/constants/colors';
import Layout from '@/constants/layout';

interface ActionCardProps {
  icon: string;
  title: string;
  desc: string;
  route: string;
  fullWidth?: boolean;
  primary?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function ActionCard({
  icon,
  title,
  desc,
  route,
  fullWidth = false,
  primary = false,
  style,
}: ActionCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(route as Href)}
      style={[
        styles.card,
        fullWidth && styles.fullWidth,
        primary && styles.primaryCard,
        style,
      ]}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.title, primary && styles.titleLight]}>{title}</Text>
      <Text style={[styles.desc, primary && styles.descLight]}>{desc}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.radius.md,
    padding: Layout.spacing.base,
    alignItems: 'flex-start',
    elevation: 2,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  fullWidth: {
    flex: 0,
    alignSelf: 'stretch',
  },
  primaryCard: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  icon: {
    fontSize: 26,
    marginBottom: Layout.spacing.sm,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Layout.spacing.xs,
  },
  titleLight: {
    color: Colors.textLight,
  },
  desc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  descLight: {
    color: Colors.accent,
  },
});
