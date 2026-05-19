import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { resolveImage } from '@/constants/assets';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import Colors from '@/constants/colors';
import Layout from '@/constants/layout';
import InfoChip from '@/components/ui/InfoChip';
import { useLocale } from '@/services/i18n';

interface QuizStartViewProps {
  questionCount: number;
  timeLimitSeconds: number;
  resumeProgress?: {
    answeredCount: number;
    totalQuestions: number;
  };
  onStart: () => void;
  onResume?: () => void;
  onRestart?: () => void;
}

export default function QuizStartView({
  questionCount,
  timeLimitSeconds,
  resumeProgress,
  onStart,
  onResume,
  onRestart,
}: QuizStartViewProps) {
  const { t } = useLocale();
  const hasResumeState = Boolean(resumeProgress && onResume && onRestart);

  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <Image
          source={resolveImage('media/Harput-kalesi.jpg')}
          style={styles.heroImage}
          contentFit="cover"
        />
        <LinearGradient
          colors={['rgba(8, 14, 5, 0.12)', 'rgba(8, 14, 5, 0.74)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroContent}>
          <Text style={styles.eyebrow}>{t('quiz', 'startEyebrow')}</Text>
          <Text style={styles.title}>{t('quiz', 'startTitle')}</Text>
        </View>
      </View>

      <View style={styles.sheet}>
        <Text style={styles.subtitle}>{t('quiz', 'startSubtitle')}</Text>

        <View style={styles.infoRow}>
          <InfoChip
            icon="help-buoy-outline"
            value={`${questionCount} ${t('quiz', 'sessionQuestions')}`}
            variant="pill"
          />
          <InfoChip
            icon="timer-outline"
            value={`${timeLimitSeconds} ${t('quiz', 'perQuestionTimer')}`}
            variant="pill"
          />
        </View>

        {hasResumeState && resumeProgress ? (
          <View style={styles.resumeCard}>
            <Text style={styles.resumeEyebrow}>{t('quiz', 'resumeEyebrow')}</Text>
            <Text style={styles.resumeTitle}>{t('quiz', 'resumeTitle')}</Text>
            <Text style={styles.resumeBody}>
              {resumeProgress.answeredCount} / {resumeProgress.totalQuestions} {t('quiz', 'resumeProgressSuffix')}
            </Text>

            <View style={styles.resumeActions}>
              <Pressable
                onPress={onResume}
                style={({ pressed }) => [styles.resumeButton, pressed && styles.resumeButtonPressed]}
              >
                <Text style={styles.resumeButtonText}>{t('quiz', 'resumeButton')}</Text>
              </Pressable>

              <Pressable
                onPress={onRestart}
                style={({ pressed }) => [styles.restartButton, pressed && styles.restartButtonPressed]}
              >
                <Text style={styles.restartButtonText}>{t('quiz', 'restartQuiz')}</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        <Pressable onPress={onStart} style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}>
          <Text style={styles.ctaText}>{t('quiz', 'startButton')}</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.white} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Layout.spacing.base,
    paddingTop: Layout.spacing.sm,
    paddingBottom: Layout.spacing.xl,
  },
  heroCard: {
    height: 280,
    borderRadius: 34,
    overflow: 'hidden',
    backgroundColor: '#dce4cd',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroContent: {
    position: 'absolute',
    left: Layout.spacing.lg,
    right: Layout.spacing.lg,
    bottom: Layout.spacing.lg,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.85)',
  },
  title: {
    marginTop: Layout.spacing.sm,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '800',
    color: Colors.white,
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
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
  infoRow: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
    marginTop: Layout.spacing.base,
    flexWrap: 'wrap',
  },
  cta: {
    marginTop: Layout.spacing.xl,
    borderRadius: 28,
    backgroundColor: '#5f8f27',
    minHeight: 56,
    paddingHorizontal: Layout.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Layout.spacing.sm,
  },
  ctaPressed: {
    opacity: 0.92,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  resumeCard: {
    marginTop: Layout.spacing.lg,
    borderRadius: 24,
    backgroundColor: '#f4efe0',
    padding: Layout.spacing.md,
    borderWidth: 1,
    borderColor: '#e7dfce',
  },
  resumeEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.textSecondary,
  },
  resumeTitle: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  resumeBody: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  resumeActions: {
    marginTop: Layout.spacing.base,
    flexDirection: 'row',
    gap: Layout.spacing.sm,
  },
  resumeButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 23,
    backgroundColor: '#5f8f27',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeButtonPressed: {
    opacity: 0.92,
  },
  resumeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  restartButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  restartButtonPressed: {
    opacity: 0.82,
  },
  restartButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
});