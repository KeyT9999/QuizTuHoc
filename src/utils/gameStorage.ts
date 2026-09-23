export interface GameHighScore {
  score: number;
  streak: number;
  date: string;
}

const STORAGE_SOUND_KEY = 'keyt_game_sound_enabled';

// Sound preference
export function isSoundEnabled(): boolean {
  try {
    const val = localStorage.getItem(STORAGE_SOUND_KEY);
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_SOUND_KEY, enabled ? 'true' : 'false');
  } catch {
    // ignore
  }
}

// Mistake bank management
export function getMistakeQuestionIds(setId: string): number[] {
  try {
    const raw = localStorage.getItem(`keyt_mistakes_${setId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMistakeQuestion(setId: string, questionId: number): void {
  try {
    const current = getMistakeQuestionIds(setId);
    if (!current.includes(questionId)) {
      const updated = [...current, questionId];
      localStorage.setItem(`keyt_mistakes_${setId}`, JSON.stringify(updated));
    }
  } catch {
    // ignore
  }
}

export function removeMistakeQuestion(setId: string, questionId: number): void {
  try {
    const current = getMistakeQuestionIds(setId);
    const updated = current.filter((id) => id !== questionId);
    localStorage.setItem(`keyt_mistakes_${setId}`, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function clearMistakes(setId: string): void {
  try {
    localStorage.removeItem(`keyt_mistakes_${setId}`);
  } catch {
    // ignore
  }
}

// Game High Scores
export function getGameHighScore(
  setId: string,
  gameType: 'time_attack' | 'tower' | 'true_false'
): GameHighScore {
  try {
    const raw = localStorage.getItem(`keyt_highscore_${gameType}_${setId}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { score: 0, streak: 0, date: '' };
}

export function saveGameHighScore(
  setId: string,
  gameType: 'time_attack' | 'tower' | 'true_false',
  score: number,
  streak: number
): boolean {
  try {
    const current = getGameHighScore(setId, gameType);
    if (score > current.score) {
      const record: GameHighScore = {
        score,
        streak: Math.max(streak, current.streak),
        date: new Date().toLocaleDateString('vi-VN'),
      };
      localStorage.setItem(`keyt_highscore_${gameType}_${setId}`, JSON.stringify(record));
      return true; // New record!
    }
  } catch {
    // ignore
  }
  return false;
}
