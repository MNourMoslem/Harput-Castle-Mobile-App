import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { SupportedLocale } from '@/services/i18n';
import {
  createQuizSession,
  QUIZ_QUESTION_TIME_LIMIT_SECONDS,
} from '@/services/quiz';
import type {
  QuizAnswerRecord,
  QuizQuestion,
  QuizSessionState,
} from '@/types/quiz';

const QUIZ_STORAGE_KEY = 'quiz_progress_v1';

const DEFAULT_QUIZ_STATE: QuizSessionState = {
  status: 'idle',
  locale: null,
  questions: [],
  currentIndex: 0,
  answers: {},
  score: 0,
  startedAt: null,
  questionStartedAt: null,
  questionTimeLimitSeconds: QUIZ_QUESTION_TIME_LIMIT_SECONDS,
  completedAt: null,
};

interface QuizContextValue {
  isHydrated: boolean;
  session: QuizSessionState;
  currentQuestion?: QuizQuestion;
  currentAnswer?: QuizAnswerRecord;
  startQuiz: (locale: SupportedLocale) => void;
  submitAnswer: (answerId: string | null) => void;
  goToNextQuestion: () => void;
  resetQuizProgress: () => void;
  restartQuiz: (locale: SupportedLocale) => void;
}

const QuizContext = createContext<QuizContextValue | null>(null);

function buildFreshQuizState(locale: SupportedLocale): QuizSessionState {
  return {
    status: 'inProgress',
    locale,
    questions: createQuizSession(locale),
    currentIndex: 0,
    answers: {},
    score: 0,
    startedAt: Date.now(),
    questionStartedAt: Date.now(),
    questionTimeLimitSeconds: QUIZ_QUESTION_TIME_LIMIT_SECONDS,
    completedAt: null,
  };
}

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<QuizSessionState>(DEFAULT_QUIZ_STATE);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(QUIZ_STORAGE_KEY)
      .then((stored) => {
        if (!stored) {
          return;
        }

        try {
          const parsed = JSON.parse(stored) as QuizSessionState;

          if (
            parsed &&
            typeof parsed === 'object' &&
            Array.isArray(parsed.questions) &&
            typeof parsed.status === 'string' &&
            typeof parsed.currentIndex === 'number' &&
            typeof parsed.score === 'number'
          ) {
            setSession(parsed);
          }
        } catch {
          // Corrupted data — ignore and start fresh
        }
      })
      .finally(() => {
        setIsHydrated(true);
      });
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    AsyncStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(session));
  }, [isHydrated, session]);

  const startQuiz = useCallback((locale: SupportedLocale) => {
    setSession(buildFreshQuizState(locale));
  }, []);

  const restartQuiz = useCallback((locale: SupportedLocale) => {
    setSession(buildFreshQuizState(locale));
  }, []);

  const submitAnswer = useCallback((answerId: string | null) => {
    setSession((currentSession) => {
      if (currentSession.status !== 'inProgress') {
        return currentSession;
      }

      const question = currentSession.questions[currentSession.currentIndex];

      if (!question || currentSession.answers[question.id]) {
        return currentSession;
      }

      const isCorrect = answerId === question.correctAnswerId;

      return {
        ...currentSession,
        answers: {
          ...currentSession.answers,
          [question.id]: {
            selectedAnswerId: answerId,
            isCorrect,
            timedOut: answerId === null,
            answeredAt: Date.now(),
          },
        },
        score: currentSession.score + (isCorrect ? 1 : 0),
      };
    });
  }, []);

  const goToNextQuestion = useCallback(() => {
    setSession((currentSession) => {
      if (currentSession.status !== 'inProgress') {
        return currentSession;
      }

      const question = currentSession.questions[currentSession.currentIndex];

      if (!question || !currentSession.answers[question.id]) {
        return currentSession;
      }

      const isLastQuestion = currentSession.currentIndex >= currentSession.questions.length - 1;

      if (isLastQuestion) {
        return {
          ...currentSession,
          status: 'completed',
          questionStartedAt: null,
          completedAt: Date.now(),
        };
      }

      return {
        ...currentSession,
        currentIndex: currentSession.currentIndex + 1,
        questionStartedAt: Date.now(),
      };
    });
  }, []);

  const resetQuizProgress = useCallback(() => {
    setSession(DEFAULT_QUIZ_STATE);
    AsyncStorage.removeItem(QUIZ_STORAGE_KEY);
  }, []);

  const currentQuestion = session.questions[session.currentIndex];
  const currentAnswer = currentQuestion ? session.answers[currentQuestion.id] : undefined;

  const value = useMemo<QuizContextValue>(
    () => ({
      isHydrated,
      session,
      currentQuestion,
      currentAnswer,
      startQuiz,
      submitAnswer,
      goToNextQuestion,
      resetQuizProgress,
      restartQuiz,
    }),
    [
      currentAnswer,
      currentQuestion,
      goToNextQuestion,
      isHydrated,
      resetQuizProgress,
      restartQuiz,
      session,
      startQuiz,
      submitAnswer,
    ],
  );

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz() {
  const context = useContext(QuizContext);

  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }

  return context;
}