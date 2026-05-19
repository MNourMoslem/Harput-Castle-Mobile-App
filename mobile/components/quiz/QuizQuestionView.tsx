import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import Colors from '@/constants/colors';
import Layout from '@/constants/layout';
import { useLocale } from '@/services/i18n';
import type {
  QuizAnswerRecord,
  QuizAnswerOption,
  QuizQuestion,
} from '@/types/quiz';

interface QuizQuestionViewProps {
  question: QuizQuestion;
  currentIndex: number;
  totalQuestions: number;
  questionStartedAt: number;
  questionTimeLimitSeconds: number;
  currentAnswer?: QuizAnswerRecord;
  onSelectAnswer: (answerId: string) => void;
  onTimeExpired: () => void;
  onNext: () => void;
  onQuit: () => void;
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const remaining = (seconds % 60).toString().padStart(2, '0');

  return `${minutes}:${remaining}`;
}

function OptionRow({
  option,
  index,
  question,
  currentAnswer,
  onPress,
}: {
  option: QuizAnswerOption;
  index: number;
  question: QuizQuestion;
  currentAnswer?: QuizAnswerRecord;
  onPress: () => void;
}) {
  const letters = ['A', 'B', 'C', 'D'];
  const isAnswered = Boolean(currentAnswer);
  const isSelected = currentAnswer?.selectedAnswerId === option.id;
  const isCorrectOption = question.correctAnswerId === option.id;

  let containerStyle = styles.optionButton;
  let textStyle = styles.optionText;
  let iconName: React.ComponentProps<typeof Ionicons>['name'] | null = null;
  let iconColor = Colors.textSecondary;
  let gradientColors: readonly [string, string] | null = null;

  if (isAnswered) {
    if (isSelected && currentAnswer?.isCorrect) {
      containerStyle = styles.optionButtonSelectedCorrect;
      gradientColors = ['#f2bf54', '#ef8c18'] as const;
      textStyle = styles.optionTextSelected;
      iconName = 'checkmark-circle';
      iconColor = Colors.white;
    } else if (isSelected && !currentAnswer?.isCorrect) {
      containerStyle = styles.optionButtonWrong;
      textStyle = styles.optionTextWrong;
      iconName = 'close-circle';
      iconColor = '#c05656';
    } else if (isCorrectOption) {
      containerStyle = styles.optionButtonCorrect;
      textStyle = styles.optionTextCorrect;
      iconName = 'checkmark-circle';
      iconColor = '#4f8f33';
    } else {
      containerStyle = styles.optionButtonMuted;
      textStyle = styles.optionTextMuted;
    }
  }

  const content = (
    <View style={[containerStyle, isAnswered && styles.optionDisabled]}>
      <View style={styles.optionLeading}>
        <View style={[styles.optionBadge, isSelected && styles.optionBadgeSelected]}>
          <Text style={[styles.optionBadgeText, isSelected && styles.optionBadgeTextSelected]}>
            {letters[index]}
          </Text>
        </View>
        <Text style={textStyle}>{option.label}</Text>
      </View>
      {iconName ? <Ionicons name={iconName} size={20} color={iconColor} /> : null}
    </View>
  );

  if (gradientColors) {
    return (
      <Pressable disabled={isAnswered} onPress={onPress}>
        <LinearGradient colors={gradientColors} style={styles.optionGradient}>
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable disabled={isAnswered} onPress={onPress}>
      {content}
    </Pressable>
  );
}

export default function QuizQuestionView({
  question,
  currentIndex,
  totalQuestions,
  questionStartedAt,
  questionTimeLimitSeconds,
  currentAnswer,
  onSelectAnswer,
  onTimeExpired,
  onNext,
  onQuit,
}: QuizQuestionViewProps) {
  const { t } = useLocale();
  const { height } = useWindowDimensions();
  const [now, setNow] = useState(Date.now());
  const progress = (currentIndex + 1) / totalQuestions;
  const heroHeight = Math.min(250, Math.max(200, Math.floor(height * 0.28)));
  const remainingSeconds = useMemo(() => {
    const elapsed = Math.floor((now - questionStartedAt) / 1000);
    return Math.max(0, questionTimeLimitSeconds - elapsed);
  }, [now, questionStartedAt, questionTimeLimitSeconds]);

  useEffect(() => {
    setNow(Date.now());

    if (currentAnswer) {
      return;
    }

    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [currentAnswer, question.id]);

  useEffect(() => {
    if (!currentAnswer && remainingSeconds === 0) {
      onTimeExpired();
    }
  }, [currentAnswer, onTimeExpired, remainingSeconds]);

  return (
    <View style={styles.container}>
      <View style={[styles.heroFrame, { height: heroHeight }]}>
        <Image source={question.imageSource} style={styles.heroImage} contentFit="cover" />
        <LinearGradient
          colors={['rgba(15, 20, 8, 0.1)', 'rgba(15, 20, 8, 0.58)']}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.topRow}>
          <View style={styles.progressColumn}>
            <Text style={styles.progressLabel}>{currentIndex + 1} {t('quiz', 'progressConnector')} {totalQuestions}</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
          </View>

          <View style={styles.topActions}>
            <View style={styles.timerPill}>
              <Ionicons name="timer-outline" size={16} color={Colors.white} />
              <Text style={styles.timerText}>{formatTime(remainingSeconds)}</Text>
            </View>

            <Pressable onPress={onQuit} style={styles.closeButton}>
              <Ionicons name="close" size={20} color={Colors.textPrimary} />
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.sheetShell}>
        <View style={styles.sheet}>
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.sheetContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.questionText}>{question.question}</Text>

            <View style={styles.optionsList}>
              {question.answers.map((option, index) => (
                <OptionRow
                  key={option.id}
                  option={option}
                  index={index}
                  question={question}
                  currentAnswer={currentAnswer}
                  onPress={() => onSelectAnswer(option.id)}
                />
              ))}
            </View>

            {currentAnswer?.timedOut ? (
              <View style={styles.feedbackRow}>
                <Ionicons name="time-outline" size={16} color="#ad6f22" />
                <Text style={styles.feedbackText}>{t('quiz', 'timeoutHint')}</Text>
              </View>
            ) : null}
          </ScrollView>

          <Pressable
            disabled={!currentAnswer}
            onPress={onNext}
            style={({ pressed }) => [
              styles.nextButton,
              !currentAnswer && styles.nextButtonDisabled,
              pressed && currentAnswer && styles.nextButtonPressed,
            ]}
          >
            <Text style={styles.nextButtonText}>
              {currentIndex === totalQuestions - 1 ? t('quiz', 'finishButton') : t('quiz', 'nextButton')}
            </Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.white} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroFrame: {
    borderRadius: 34,
    overflow: 'hidden',
    marginHorizontal: Layout.spacing.base,
    marginTop: Layout.spacing.sm,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  topRow: {
    position: 'absolute',
    top: Layout.spacing.base,
    left: Layout.spacing.base,
    right: Layout.spacing.base,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Layout.spacing.base,
  },
  progressColumn: {
    flex: 1,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  progressTrack: {
    marginTop: 6,
    height: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.34)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#f1b13e',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.34)',
  },
  timerText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetShell: {
    flex: 1,
    marginTop: Layout.spacing.base,
    marginHorizontal: Layout.spacing.base,
  },
  sheet: {
    flex: 1,
    backgroundColor: '#fffdf9',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(46, 74, 34, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 6,
  },
  scrollArea: {
    flex: 1,
  },
  sheetContent: {
    paddingBottom: 12,
  },
  questionText: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  optionsList: {
    marginTop: Layout.spacing.base,
    gap: 10,
  },
  optionGradient: {
    borderRadius: 18,
    padding: 1,
  },
  optionButton: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#ebe6db',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  optionButtonCorrect: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: '#eef6e7',
    borderWidth: 1,
    borderColor: '#c8e0b6',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionButtonSelectedCorrect: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowOpacity: 0,
    elevation: 0,
  },
  optionButtonWrong: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: '#fff2f0',
    borderWidth: 1,
    borderColor: '#f1c2bd',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionButtonMuted: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: '#fbf9f3',
    borderWidth: 1,
    borderColor: '#eee8db',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  optionLeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 8,
  },
  optionBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1ede1',
  },
  optionBadgeSelected: {
    backgroundColor: 'rgba(255,255,255,0.26)',
  },
  optionBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9d7a2a',
  },
  optionBadgeTextSelected: {
    color: Colors.white,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  optionTextSelected: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  optionTextCorrect: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#386d1f',
  },
  optionTextWrong: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#9e4747',
  },
  optionTextMuted: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#8f8a7e',
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
    marginTop: 12,
    backgroundColor: '#fff5e7',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  feedbackText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    color: '#8b6323',
  },
  nextButton: {
    marginTop: 10,
    minHeight: 52,
    borderRadius: 28,
    backgroundColor: '#5f8f27',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Layout.spacing.sm,
  },
  nextButtonDisabled: {
    opacity: 0.45,
  },
  nextButtonPressed: {
    opacity: 0.92,
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
});