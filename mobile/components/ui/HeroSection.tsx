import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import Layout from '@/constants/layout';
import { useLocale } from '@/services/i18n';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_HEIGHT = SCREEN_HEIGHT * 0.55;

// Battlements data: [width, height] pairs for the castle silhouette row
const MERLONS = [
  [16, 36], [10, 24], [16, 44], [12, 28], [20, 56], [12, 28],
  [16, 44], [10, 24], [16, 36], [12, 30], [18, 48], [10, 22],
  [14, 38], [12, 26], [16, 40],
];

export default function HeroSection() {
  const { t } = useLocale();

  return (
    <View style={[styles.container, { height: HERO_HEIGHT }]}>
      {/* Solid background */}
      <View style={styles.background} />

      {/* Castle silhouette — decorative battlements */}
      <View style={styles.silhouetteRow}>
        {MERLONS.map(([w, h], i) => (
          <View
            key={i}
            style={[
              styles.merlon,
              { width: w, height: h },
              i % 4 === 2 && styles.merlonAccent,
            ]}
          />
        ))}
      </View>

      {/* Gradient overlay — transparent top → dark bottom */}
      <LinearGradient
        colors={['transparent', Colors.overlay, Colors.primary]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Text content pinned to the bottom of the hero */}
      <View style={styles.textContainer}>
        <Text style={styles.appName}>{t('home', 'welcomeTitle')}</Text>
        <Text style={styles.subtitle}>{t('home', 'welcomeSubtitle')}</Text>
        <View style={styles.divider} />
        <Text style={styles.welcomeSentence}>{t('home', 'welcomeSentence')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.primary,
  },
  silhouetteRow: {
    position: 'absolute',
    top: Layout.spacing.xl + 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 3,
    opacity: 0.15,
    paddingHorizontal: Layout.spacing.base,
  },
  merlon: {
    backgroundColor: Colors.accent,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  merlonAccent: {
    backgroundColor: Colors.secondary,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xl,
  },
  appName: {
    fontSize: 34,
    fontWeight: '700',
    color: Colors.textLight,
    textAlign: 'center',
    letterSpacing: 0.8,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.accent,
    textAlign: 'center',
    marginTop: Layout.spacing.xs,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  divider: {
    width: 60,
    height: 1.5,
    backgroundColor: Colors.accent,
    marginVertical: Layout.spacing.md,
    opacity: 0.8,
  },
  welcomeSentence: {
    fontSize: 13,
    color: Colors.textLight,
    textAlign: 'center',
    opacity: 0.82,
    lineHeight: 20,
    maxWidth: 280,
  },
});
