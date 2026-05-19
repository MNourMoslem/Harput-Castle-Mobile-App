import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { HistoryEntry } from '@/types/history';
import Colors from '@/constants/colors';
import Layout from '@/constants/layout';

interface HistoryCardProps {
  entry: HistoryEntry;
  onPress: () => void;
}

export default function HistoryCard({ entry, onPress }: HistoryCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={styles.card}
    >
      {/* ── Hero image ───────────────────────────────────── */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: entry.imageAsset }}
          style={styles.image}
          contentFit="cover"
        />

        {/* Dark gradient overlay at bottom of image */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.62)']}
          locations={[0.3, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* Period badge — top left */}
        <View style={styles.periodBadge}>
          <Text style={styles.periodText}>{entry.period}</Text>
        </View>
      </View>

      {/* ── Card body ────────────────────────────────────── */}
      <View style={styles.body}>
        <View style={styles.textRow}>
          <Text style={styles.title} numberOfLines={2}>
            {entry.title}
          </Text>
          <Ionicons
            name="chevron-forward-outline"
            size={18}
            color={Colors.textSecondary}
            style={styles.chevron}
          />
        </View>
        <Text style={styles.teaser} numberOfLines={3}>
          {entry.teaser}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.radius.lg,
    marginHorizontal: Layout.spacing.base,
    marginBottom: Layout.spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  imageContainer: {
    height: 200,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  periodBadge: {
    position: 'absolute',
    top: Layout.spacing.sm,
    left: Layout.spacing.sm,
    backgroundColor: Colors.accent,
    borderRadius: Layout.radius.sm,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
  },
  periodText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.4,
  },
  body: {
    padding: Layout.spacing.base,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Layout.spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  chevron: {
    marginTop: 2,
  },
  teaser: {
    marginTop: Layout.spacing.xs,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
});
