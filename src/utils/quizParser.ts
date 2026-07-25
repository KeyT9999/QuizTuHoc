export interface QuizOption {
  key: string;
  text: string;
}

export interface Question {
  id: number;
  text: string;
  options: QuizOption[];
  correctAnswer: string;
}

export function parseQuizText(rawText: string): Question[] {
  const questions: Question[] = [];

  // Split by double newlines (or more) to get question blocks
  const blocks = rawText
    .trim()
    .split(/\n\s*\n+/)
    .filter((block) => block.trim().length > 0);

  for (let i = 0; i < blocks.length; i++) {
    const lines = blocks[i]
      .trim()
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) continue;

    // Last line is the correct answer
    const answerLine = lines[lines.length - 1].trim().toUpperCase();

    // Everything else (could be multi-line question) joined as the question line
    const questionLine = lines.slice(0, lines.length - 1).join(' ');

    // Split by | to get question text and options
    const parts = questionLine.split('|').map((p) => p.trim());

    if (parts.length < 2) continue;

    const questionText = parts[0];

    // Parse options: "A. something", "B. something", etc.
    const options: QuizOption[] = [];
    for (let j = 1; j < parts.length; j++) {
      const optionMatch = parts[j].match(/^([A-Z])\.\s*(.+)$/i);
      if (optionMatch) {
        options.push({
          key: optionMatch[1].toUpperCase(),
          text: optionMatch[2].trim(),
        });
      }
    }

    if (options.length === 0) continue;

    // Validate answer is one of the option keys
    const correctAnswer = answerLine.charAt(0);
    if (!options.some((o) => o.key === correctAnswer)) continue;

    questions.push({
      id: questions.length + 1,
      text: questionText,
      options,
      correctAnswer,
    });
  }

  return questions;
}
