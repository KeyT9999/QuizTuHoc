/**
 * Answer keys researched from the MLN111/MLN122 screenshots and course
 * materials. These are research candidates, not official answer keys.
 *
 * Format:
 * - one letter: single-choice answer
 * - concatenated letters: multi-choice answer (e.g. ABC)
 * - ?: the item is ambiguous, malformed, or has no defensible option
 */
export type ResearchAnswerKey = Record<string, string[]>;

export const MLN_RESEARCH_ANSWER_KEYS: ResearchAnswerKey = {
  // MLN111 — the three SU26 sets use the already-transcribed question bank.
  mln111_su26_c1fe: [
    'C', 'A', 'A', 'D', 'A', 'B', 'A', 'B', 'B', 'A',
    'D', 'B', 'A', 'A', 'A', 'B', 'B', 'D', 'A', 'B',
    'A', 'A', 'B', 'A', 'C', 'C', 'B', 'B', 'A', 'A',
    'D', 'A', 'D', 'D', 'C', 'A', 'A', 'D', 'C', 'A',
    'C', 'D', 'A', 'A', 'D', 'D', 'C', 'D', 'A', 'A',
    'D', 'C', 'A', 'B', 'B', 'A', 'C', 'A', 'A', 'A',
  ],
  mln111_su26_c2fe: [
    'D', 'B', 'C', 'A', 'D', 'C', 'C', 'B', 'D', 'A',
    'D', 'B', 'C', 'C', 'B', 'B', 'B', 'A', 'A', 'A',
    'C', 'B', 'C', 'B', 'C', 'B', 'B', 'A', 'A', 'D',
    'A', 'A', 'A', 'C', 'B', 'C', 'A', 'A', 'A', 'D',
    'D', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'A', 'A',
    'D', 'A', 'A', 'C', 'C', 'D', 'A', 'D', 'D', 'B',
  ],
  mln111_su26_re: [
    'A', 'C', 'A', 'B', 'B', 'B', 'A', 'B', 'A', 'A',
    'A', 'B', 'C', 'B', 'C', 'C', 'A', 'A', 'C', 'D',
    'D', 'A', 'D', 'C', 'A', 'A', 'A', 'A', 'A', 'A',
    'D', 'A', 'D', 'C', 'B', 'A', 'D', 'D', 'B', 'C',
    'A', 'A', 'A', 'D', 'B', 'C', 'A', 'B', 'A', 'A',
    'C', 'A', 'A', 'A', 'C', 'A', 'B', 'B', 'D', 'A',
  ],
  // MLN111 — older screenshot sets; candidates derived by comparing repeated
  // questions with the textbooks and the SU26 bank. Please review these first.
  mln111_sp25_fe: [
    'B', 'A', 'B', 'A', 'B', 'C', 'A', 'B', 'B', 'B',
    'C', 'BCD', 'B', 'BCD', 'D', 'D', 'D', 'D', 'A', 'A',
    'D', 'A', 'D', 'A', 'A', 'D', 'B', 'B', 'A', 'B',
    'C', 'A', 'D', 'C', 'D', 'C', 'A', 'A', 'C', 'A',
    'B', 'D', 'A', 'D', 'A', 'B', 'A', 'C', 'A', 'A',
    'A', 'B', 'C', 'D', 'C', 'B', 'D', 'D', 'D', 'D', 'C',
  ],
  mln111_sp25_re: [
    'D', 'C', 'A', 'A', 'B', 'A', 'A', 'C', 'A', 'D',
    'C', 'ABC', 'BCD', 'C', 'D', 'C', 'D', 'C', 'D', 'C',
    'D', 'C', 'A', 'D', 'D', 'D', 'A', 'D', 'D', 'B',
    'A', 'D', 'C', 'A', 'C', 'D', 'A', 'B', 'C', 'B',
    'A', 'A', 'C', 'D', 'D', 'C', 'B', 'D', 'B', 'A',
    'C', 'A', 'C', 'A', 'B', 'C', 'A', 'D', 'A', 'D',
  ],

  // MLN122 — researched candidates from the Marx–Lenin political economy
  // textbook, local chapter slides, and repeated-question cross-checks.
  mln122_fa23_feb5: [
    'A', 'D', 'A', 'C', 'D', '?', 'A', 'B', 'B', 'A',
    'C', 'C', 'ABC', 'A', 'A', 'C', 'D', 'A', 'C', '?',
    'A', 'C', 'A', '?', 'BC', 'A', 'A', 'ABCD', 'A', 'A',
    'B', 'C', 'B', 'A', 'C', 'D', 'A', 'A', 'A', '?',
    'D', 'D', 'A', 'B', 'C', 'D', 'D', 'B', 'A', 'C',
    'B', 'C', 'B', 'B', 'B', 'C', '?', 'C', 'C', 'A',
  ],
  mln122_sp26_c2fe: [
    'A', 'A', 'A', 'A', 'C', 'A', 'A', 'D', '?', 'B',
    'C', 'D', 'B', 'A', 'C', 'A', 'C', 'A', 'C', 'A',
    'B', 'B', 'C', 'A', 'C', 'A', 'B', 'B', 'A', 'B',
    'A', 'B', 'C', 'D', 'B', 'A', 'A', 'A', 'A', 'A',
    'A', 'D', 'A', 'E', 'C', 'C', 'A', 'A', 'C', '?',
    'D', 'A', 'C', 'A', 'A', 'A', 'BCD', '?', 'ABC', 'B',
  ],
  mln122_su25_b5_1: [
    'A', 'D', 'D', 'B', 'A', 'A', 'C', 'D', 'A', 'A',
    'B', 'A', 'C', 'C', 'C', 'D', 'A', 'A', 'A', 'A',
    'B', 'A', 'A', 'A', 'C', 'A', 'C', 'A', 'C', 'A',
    'B', 'A', 'C', 'A', 'A', 'D', 'A', 'A', 'B', 'A',
    'B', 'C', 'A', 'A', 'C', 'A', 'A', 'C', 'D', 'D',
    '?', 'A', 'AC', 'D', 'A', 'A', 'A', 'A', 'A', 'A',
  ],
  mln122_su26_c1fe: [
    'A', 'A', 'A', 'C', 'A', 'C', 'ABC', 'A', 'B', 'A',
    'C', 'A', 'D', 'A', 'D', 'B', 'A', 'B', 'D', 'A',
    '?', 'A', 'C', 'A', '?', 'C', 'D', 'A', 'A', 'B',
    'C', 'B', 'B', 'A', 'ABC', 'D', 'D', 'C', 'A', 'A',
    'B', 'B', 'B', 'D', 'C', 'B', 'C', 'A', 'A', 'B',
    'C', 'B', 'B', 'B', 'A', 'B', 'A', 'C', 'C', 'A',
  ],
  mln122_su26_re: [
    'B', 'A', 'C', 'A', 'A', '?', 'C', 'A', 'A', 'A',
    'A', 'B', 'C', '?', 'A', 'B', 'D', 'B', 'B', 'B',
    'B', 'ACD', 'A', 'ABC', 'ABCD', 'A', 'ABCD', 'B', 'B', 'C',
    'A', 'C', 'B', 'D', 'A', 'D', 'D', 'C', 'A', 'A',
    'C', 'B', 'A', 'C', 'D', 'C', 'A', 'C', 'D', 'A',
    'B', 'C', 'B', 'D', 'ACD', 'ABC', 'A', 'A', 'C', 'A',
  ],
};

/** Items intentionally left unresolved or likely to need manual checking. */
export const MLN_RESEARCH_UNCERTAIN: Record<string, number[]> = {
  mln111_sp25_fe: [12, 14, 25, 38, 45, 51, 53, 61],
  mln111_sp25_re: [12, 13, 14, 31, 37, 38, 40, 48, 51, 54],
  mln122_fa23_feb5: [6, 13, 20, 24, 28, 40, 57],
  mln122_sp26_c2fe: [9, 10, 25, 31, 44, 50, 58],
  mln122_su25_b5_1: [11, 24, 33, 51, 53],
  mln122_su26_c1fe: [21, 25, 35, 36, 44, 46, 55],
  mln122_su26_re: [6, 14, 24, 25, 27, 32, 33, 37, 43, 55, 56],
  mln111_su26_c1fe: [4, 12, 18, 21, 31, 33, 35, 39, 41, 44, 48, 53, 56],
  mln111_su26_c2fe: [7, 9, 13, 20, 23, 30, 36, 39, 44, 47, 52, 56],
  mln111_su26_re: [7, 16, 20, 24, 33, 38, 41, 56],
};
