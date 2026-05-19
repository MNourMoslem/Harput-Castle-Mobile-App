import type { SupportedLocale } from '@/services/i18n';
import type { ImageSourcePropType } from 'react-native';

export interface QuizAnswerOption {
  id: string;
  label: string;
}

export interface RawQuizQuestion {
  id: string;
  imagePath: string;
  question: string;
  answers: QuizAnswerOption[];
  correctAnswerId: string;
}

export interface QuizQuestion extends RawQuizQuestion {
  imageSource: ImageSourcePropType;
}

export interface QuizAnswerRecord {
  selectedAnswerId: string | null;
  isCorrect: boolean;
  timedOut: boolean;
  answeredAt: number;
}

export interface QuizSessionState {
  status: 'idle' | 'inProgress' | 'completed';
  locale: SupportedLocale | null;
  questions: QuizQuestion[];
  currentIndex: number;
  answers: Record<string, QuizAnswerRecord>;
  score: number;
  startedAt: number | null;
  questionStartedAt: number | null;
  questionTimeLimitSeconds: number;
  completedAt: number | null;
}