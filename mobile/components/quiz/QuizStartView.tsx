import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/colors';
import Layout from '@/constants/layout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocale } from '@/services/i18n';

interface QuizStartViewProps {
  resumeProgress?: {
    answeredCount: number;
    totalQuestions: number;
  };
  onStart: () => void;
  onResume?: () => void;
  onRestart?: () => void;
}

export default function QuizStartView({
  resumeProgress,
  onStart,
  onResume,
  onRestart,
}: QuizStartViewProps) {
  const { t } = useLocale();
  const insets = useSafeAreaInsets();
  const hasResumeState = Boolean(resumeProgress && onResume && onRestart);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.centeredContent}>
        <View style={styles.copyBlock}>
          <Text style={styles.eyebrow}>{t('quiz', 'startEyebrow')}</Text>
          <Text style={styles.title}>{t('quiz', 'startTitle')}</Text>
          <Text style={styles.subtitle}>{t('quiz', 'startSubtitle')}</Text>
          {hasResumeState && resumeProgress ? (
            <Text style={styles.resumeBody}>
              {resumeProgress.answeredCount} / {resumeProgress.totalQuestions} {t('quiz', 'resumeProgressSuffix')}
            </Text>
          ) : null}
        </View>

        {hasResumeState && resumeProgress ? (
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
        ) : (
          <Pressable onPress={onStart} style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}>
            <Text style={styles.ctaText}>{t('quiz', 'startButton')}</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.white} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.xl,
    paddingVertical: Layout.spacing.xl,
  },
  copyBlock: {
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
    maxWidth: 360,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
  },
  title: {
    marginTop: Layout.spacing.sm,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '800',
    color: Colors.white,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
    marginTop: Layout.spacing.sm,
  },
  cta: {
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
  resumeBody: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
  },
  resumeActions: {
    width: '100%',
    gap: Layout.spacing.sm,
    alignItems: 'stretch',
  },
  resumeButton: {
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