import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';
import Layout from '@/constants/layout';
import { useLocale } from '@/services/i18n';

interface ProgressCardProps {
  visited: number;
  total: number;
}

export default function ProgressCard({ visited, total }: ProgressCardProps) {
  const { t } = useLocale();
  const [trackWidth, setTrackWidth] = useState(0);
  const progress = total > 0 ? visited / total : 0;
  const fillWidth = trackWidth * progress;

  return (
    <View style={styles.card}>
      {/* Label */}
      <Text style={styles.cardTitle}>{t('home', 'progressTitle')}</Text>

      {/* Count */}
      <View style={styles.countRow}>
        <Text style={styles.countNumber}>{visited}</Text>
        <Text style={styles.countSep}> {t('home', 'progressOf')} </Text>
        <Text style={styles.countNumber}>{total}</Text>
      </View>

      <Text style={styles.visitedLabel}>{t('home', 'progressVisited')}</Text>

      {/* Progress bar */}
      <View
        style={styles.barTrack}
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      >
        {fillWidth > 0 && (
          <View style={[styles.barFill, { width: fillWidth }]} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(46, 27, 14, 0.88)',
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: Layout.radius.md,
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.lg,
  },
  cardTitle: {
    fontSize: 9,
    color: Colors.accent,
    letterSpacing: 3.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: Layout.spacing.md,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: Layout.spacing.xs,
  },
  countNumber: {
    fontSize: 34,
    fontWeight: '700',
    color: Colors.textLight,
    letterSpacing: 1,
  },
  countSep: {
    fontSize: 18,
    color: Colors.accent,
    letterSpacing: 1,
  },
  visitedLabel: {
    fontSize: 10,
    color: Colors.textLight,
    opacity: 0.6,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: Layout.spacing.md,
  },
  barTrack: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 99,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 99,
  },
});
