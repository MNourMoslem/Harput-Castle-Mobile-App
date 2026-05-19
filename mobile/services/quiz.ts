import type { SupportedLocale } from '@/services/i18n';
import type { QuizQuestion, RawQuizQuestion } from '@/types/quiz';
import { resolveImage } from '@/constants/assets';
import { getQuizPool as getRegistryQuizPool } from '@/services/contentRegistry';

export const QUIZ_SESSION_QUESTION_COUNT = 10;
export const QUIZ_QUESTION_TIME_LIMIT_SECONDS = 20;

const quizPoolCache = new Map<SupportedLocale, QuizQuestion[]>();

function resolveQuizImage(imagePath: string) {
  return resolveImage(imagePath);
}

export function shuffleArray<T>(items: T[]): T[] {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

export function getQuizPool(locale: SupportedLocale): QuizQuestion[] {
  const cached = quizPoolCache.get(locale);

  if (cached) {
    return cached;
  }

  const rawQuestions: RawQuizQuestion[] = getRegistryQuizPool(locale);

  const questions = [...rawQuestions]
    .sort((left, right) => left.id.localeCompare(right.id))
    .map((question) => ({
      ...question,
      imageSource: resolveQuizImage(question.imagePath),
    }));

  quizPoolCache.set(locale, questions);

  return questions;
}

export function createQuizSession(locale: SupportedLocale): QuizQuestion[] {
  const pool = getQuizPool(locale);

  return shuffleArray(pool)
    .slice(0, QUIZ_SESSION_QUESTION_COUNT)
    .map((question) => ({
      ...question,
      answers: shuffleArray(question.answers),
    }));
}