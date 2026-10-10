export interface MockExamAttempt {
  id: string;
  completedAt: string;
  questionCount: number;
  durationSeconds: number;
  timeSpentSeconds: number;
  correct: number;
  incorrect: number;
  skipped: number;
  score: number;
  percent: number;
  incorrectQuestionIds: number[];
  skippedQuestionIds: number[];
}

const MAX_STORED_ATTEMPTS = 20;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) >= 0;
}

function readQuestionIds(value: unknown): number[] | null {
  if (!Array.isArray(value) || !value.every(isNonNegativeInteger)) return null;
  return value;
}

function parseAttempt(value: unknown): MockExamAttempt | null {
  if (!isRecord(value)) return null;

  const incorrectQuestionIds = readQuestionIds(value.incorrectQuestionIds);
  const skippedQuestionIds = readQuestionIds(value.skippedQuestionIds);
  const hasValidCounts = isNonNegativeInteger(value.questionCount)
    && isNonNegativeInteger(value.correct)
    && isNonNegativeInteger(value.incorrect)
    && isNonNegativeInteger(value.skipped)
    && value.correct + value.incorrect + value.skipped === value.questionCount;
  if (
    typeof value.id !== 'string'
    || value.id.trim() === ''
    || typeof value.completedAt !== 'string'
    || !Number.isFinite(Date.parse(value.completedAt))
    || !isNonNegativeInteger(value.questionCount)
    || !isNonNegativeInteger(value.durationSeconds)
    || !isNonNegativeInteger(value.timeSpentSeconds)
    || value.timeSpentSeconds > value.durationSeconds
    || !isNonNegativeInteger(value.correct)
    || !isNonNegativeInteger(value.incorrect)
    || !isNonNegativeInteger(value.skipped)
    || !hasValidCounts
    || typeof value.score !== 'number'
    || !Number.isFinite(value.score)
    || value.score < 0
    || value.score > 10
    || !isNonNegativeInteger(value.percent)
    || value.percent > 100
    || incorrectQuestionIds === null
    || skippedQuestionIds === null
    || (incorrectQuestionIds !== null && incorrectQuestionIds.length !== value.incorrect)
    || (skippedQuestionIds !== null && skippedQuestionIds.length !== value.skipped)
    || value.score !== (value.questionCount > 0 ? Number(((value.correct / value.questionCount) * 10).toFixed(1)) : 0)
    || value.percent !== (value.questionCount > 0 ? Math.round((value.correct / value.questionCount) * 100) : 0)
  ) {
    return null;
  }

  return {
    id: value.id,
    completedAt: value.completedAt,
    questionCount: value.questionCount,
    durationSeconds: value.durationSeconds,
    timeSpentSeconds: value.timeSpentSeconds,
    correct: value.correct,
    incorrect: value.incorrect,
    skipped: value.skipped,
    score: value.score,
    percent: value.percent,
    incorrectQuestionIds,
    skippedQuestionIds,
  };
}

function storageKey(setId: string): string {
  return `keyt_mock_exam_history_${setId}`;
}

export function loadMockExamHistory(setId: string): MockExamAttempt[] {
  try {
    const raw = localStorage.getItem(storageKey(setId));
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(parseAttempt)
      .filter((attempt): attempt is MockExamAttempt => attempt !== null)
      .slice(0, MAX_STORED_ATTEMPTS);
  } catch (error) {
    console.error('Lỗi khi đọc lịch sử thi thử:', error);
    return [];
  }
}

export function saveMockExamAttempt(setId: string, attempt: MockExamAttempt): boolean {
  try {
    const history = loadMockExamHistory(setId);
    const nextHistory = [attempt, ...history.filter((saved) => saved.id !== attempt.id)]
      .slice(0, MAX_STORED_ATTEMPTS);
    localStorage.setItem(storageKey(setId), JSON.stringify(nextHistory));
    return true;
  } catch (error) {
    console.error('Lỗi khi lưu lịch sử thi thử:', error);
    return false;
  }
}
