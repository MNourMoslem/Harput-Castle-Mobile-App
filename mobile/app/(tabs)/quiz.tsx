import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import QuizQuestionView from '@/components/quiz/QuizQuestionView';
import QuizResultView from '@/components/quiz/QuizResultView';
import QuizStartView from '@/components/quiz/QuizStartView';
import Colors from '@/constants/colors';
import { useQuiz } from '@/contexts/QuizContext';
import { QUIZ_SESSION_QUESTION_COUNT, QUIZ_QUESTION_TIME_LIMIT_SECONDS } from '@/services/quiz';
import { useLocale } from '@/services/i18n';

export default function QuizScreen() {
  const { locale } = useLocale();
  const [hasEnteredActiveSession, setHasEnteredActiveSession] = useState(false);
  const {
    isHydrated,
    session,
    currentQuestion,
    currentAnswer,
    startQuiz,
    submitAnswer,
    goToNextQuestion,
    resetQuizProgress,
    restartQuiz,
  } = useQuiz();

  const elapsedSeconds = useMemo(() => {
    if (!session.startedAt) {
      return 0;
    }

    const endTime = session.completedAt ?? Date.now();
    return Math.max(0, Math.floor((endTime - session.startedAt) / 1000));
  }, [session.completedAt, session.startedAt]);

  const answeredCount = useMemo(
    () => Object.keys(session.answers).length,
    [session.answers],
  );

  useEffect(() => {
    if (session.status !== 'inProgress') {
      setHasEnteredActiveSession(false);
    }
  }, [session.status]);

  if (!isHydrated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (session.status === 'idle' || (session.status === 'inProgress' && !hasEnteredActiveSession)) {
    return (
      <SafeAreaView style={styles.container}>
        <QuizStartView
          questionCount={QUIZ_SESSION_QUESTION_COUNT}
          timeLimitSeconds={QUIZ_QUESTION_TIME_LIMIT_SECONDS}
          resumeProgress={
            session.status === 'inProgress'
              ? {
                  answeredCount,
                  totalQuestions: session.questions.length,
                }
              : undefined
          }
          onStart={() => {
            startQuiz(locale);
            setHasEnteredActiveSession(true);
          }}
          onResume={
            session.status === 'inProgress'
              ? () => setHasEnteredActiveSession(true)
              : undefined
          }
          onRestart={
            session.status === 'inProgress'
              ? () => {
                  restartQuiz(locale);
                  setHasEnteredActiveSession(true);
                }
              : undefined
          }
        />
      </SafeAreaView>
    );
  }

  if (session.status === 'completed') {
    return (
      <SafeAreaView style={styles.container}>
        <QuizResultView
          score={session.score}
          totalQuestions={session.questions.length}
          elapsedSeconds={elapsedSeconds}
          onRestart={() => restartQuiz(locale)}
          onReset={resetQuizProgress}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {currentQuestion && session.questionStartedAt ? (
        <QuizQuestionView
          question={currentQuestion}
          currentIndex={session.currentIndex}
          totalQuestions={session.questions.length}
          questionStartedAt={session.questionStartedAt}
          questionTimeLimitSeconds={session.questionTimeLimitSeconds}
          currentAnswer={currentAnswer}
          onSelectAnswer={submitAnswer}
          onTimeExpired={() => submitAnswer(null)}
          onNext={goToNextQuestion}
          onQuit={() => setHasEnteredActiveSession(false)}
        />
      ) : (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4efe4',
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
