export interface QuizSplitSettings {
  enabled: boolean;
  chunkSize: number;
  currentPart: number;
}

export interface QuizPartInfo {
  partIndex: number;
  name: string;
  startIndex: number;
  endIndex: number;
  startNumber: number;
  endNumber: number;
  totalCount: number;
}

const SPLIT_STORAGE_PREFIX = 'keyt_quiz_split_';

export function getSplitStorageKey(setId?: string): string {
  return setId ? `${SPLIT_STORAGE_PREFIX}${setId}` : `${SPLIT_STORAGE_PREFIX}default`;
}

export function loadQuizSplitSettings(setId?: string, defaultChunkSize = 50): QuizSplitSettings {
  const key = getSplitStorageKey(setId);
  try {
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        enabled: Boolean(parsed.enabled),
        chunkSize:
          typeof parsed.chunkSize === 'number' && parsed.chunkSize > 0
            ? Math.floor(parsed.chunkSize)
            : defaultChunkSize,
        currentPart:
          typeof parsed.currentPart === 'number' && parsed.currentPart >= 0
            ? Math.floor(parsed.currentPart)
            : 0,
      };
    }
  } catch {
    // ignore parse error
  }
  return {
    enabled: false,
    chunkSize: defaultChunkSize,
    currentPart: 0,
  };
}

export function saveQuizSplitSettings(setId: string | undefined, settings: QuizSplitSettings): void {
  const key = getSplitStorageKey(setId);
  try {
    localStorage.setItem(key, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save quiz split settings:', err);
  }
}

export function calculateQuizParts(totalQuestions: number, chunkSize: number): QuizPartInfo[] {
  if (totalQuestions <= 0) return [];
  const validChunk = Math.max(1, chunkSize);
  const numParts = Math.ceil(totalQuestions / validChunk);
  const parts: QuizPartInfo[] = [];

  for (let i = 0; i < numParts; i++) {
    const start = i * validChunk;
    const end = Math.min((i + 1) * validChunk - 1, totalQuestions - 1);
    parts.push({
      partIndex: i,
      name: `Phần ${i + 1}`,
      startIndex: start,
      endIndex: end,
      startNumber: start + 1,
      endNumber: end + 1,
      totalCount: end - start + 1,
    });
  }

  return parts;
}
