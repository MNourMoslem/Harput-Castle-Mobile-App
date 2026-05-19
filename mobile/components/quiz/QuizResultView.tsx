import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import Colors from '@/constants/colors';
import Layout from '@/constants/layout';
import { useLocale } from '@/services/i18n';

interface QuizResultViewProps {
  score: number;
  totalQuestions: number;
  elapsedSeconds: number;
  onRestart: () => void;
  onReset: () => void;
}

function formatElapsed(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;

  if (minutes === 0) {
    return `${remaining}s`;
  }

  return `${minutes}m ${remaining}s`;
}

export default function QuizResultView({
  score,
  totalQuestions,
  elapsedSeconds,
  onRestart,
  onReset,
}: QuizResultViewProps) {
  const { t } = useLocale();
  const percentage = Math.round((score / totalQuestions) * 100);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={['#708e3d', '#2f4d22']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.eyebrow}>{t('quiz', 'scoreEyebrow')}</Text>
        <Text style={styles.title}>{t('quiz', 'scoreTitle')}</Text>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreValue}>{score}</Text>
          <Text style={styles.scoreDivider}>/ {totalQuestions}</Text>
        </View>
        <Text style={styles.percentText}>{percentage}%</Text>
      </LinearGradient>

      <View style={styles.sheet}>
        <View style={styles.statCardRow}>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={20} color={Colors.primary} />
            <Text style={styles.statLabel}>{t('quiz', 'correctAnswers')}</Text>
            <Text style={styles.statValue}>{score}</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="timer-outline" size={20} color={Colors.primary} />
            <Text style={styles.statLabel}>{t('quiz', 'elapsedTime')}</Text>
            <Text style={styles.statValue}>{formatElapsed(elapsedSeconds)}</Text>
          </View>
        </View>

        <Pressable onPress={onRestart} style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}>
          <Text style={styles.primaryButtonText}>{t('quiz', 'playAgain')}</Text>
          <Ionicons name="refresh" size={18} color={Colors.white} />
        </Pressable>

        <Pressable onPress={onReset} style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}>
          <Text style={styles.secondaryButtonText}>{t('quiz', 'resetProgress')}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Layout.spacing.base,
    paddingTop: Layout.spacing.sm,
    paddingBottom: 96,
  },
  hero: {
    minHeight: 228,
    borderRadius: 34,
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.82)',
  },
  title: {
    marginTop: Layout.spacing.sm,
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
  },
  scoreCircle: {
    marginTop: Layout.spacing.lg,
    width: 122,
    height: 122,
    borderRadius: 61,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  scoreValue: {
    fontSize: 40,
    fontWeight: '800',
    color: Colors.white,
  },
  scoreDivider: {
    marginLeft: 6,
    marginTop: 14,
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
  },
  percentText: {
    marginTop: Layout.spacing.base,
    fontSize: 18,
    fontWeight: '700',
    color: '#e8f2d3',
  },
  sheet: {
    marginTop: Layout.spacing.base,
    backgroundColor: '#fffdf8',
    borderRadius: 30,
    paddingHorizontal: Layout.spacing.lg,
    paddingTop: Layout.spacing.lg,
    paddingBottom: Layout.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(46, 74, 34, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 6,
  },
  statCardRow: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#eef3e4',
    borderRadius: 22,
    padding: 14,
  },
  statLabel: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statValue: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  primaryButton: {
    marginTop: Layout.spacing.lg,
    minHeight: 54,
    borderRadius: 28,
    backgroundColor: '#5f8f27',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Layout.spacing.sm,
  },
  primaryButtonPressed: {
    opacity: 0.92,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  secondaryButton: {
    marginTop: Layout.spacing.sm,
    minHeight: 50,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonPressed: {
    opacity: 0.82,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
});