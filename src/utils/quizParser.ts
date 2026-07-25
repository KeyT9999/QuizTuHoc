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

  // Split by 2 or more newlines to get question blocks
  const rawBlocks = rawText
    .trim()
    .split(/\n\s*\n+/)
    .filter((block) => block.trim().length > 0);

  for (let i = 0; i < rawBlocks.length; i++) {
    let lines = rawBlocks[i]
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    // Filter out Quizlet section headers like "Chưa học (287)", "Bạn chưa học các thuật ngữ này!", "Chọn 287"
    lines = lines.filter(
      (l) => !/^(Chưa học|Bạn chưa học|Chọn \d+|Chưa học \(\d+\))/i.test(l)
    );

    if (lines.length < 2) continue;

    // Answer line is the last line
    const lastLine = lines[lines.length - 1];

    // Extract answer letter (A, B, C, D) even if followed by explanation/parentheses: e.g. "D (Kiểu hỏi khác...)"
    const ansMatch = lastLine.match(/^([A-Z]{1,4})(?:\s*\(.*|\s+.*)?$/i);
    if (!ansMatch) continue;

    const correctAnswerKey = ansMatch[1].toUpperCase().charAt(0);

    // Combine remaining lines into question content
    const contentText = lines.slice(0, lines.length - 1).join(' ');

    // Split question content by |
    const parts = contentText.split('|').map((p) => p.trim()).filter((p) => p.length > 0);
    if (parts.length < 2) continue;

    const questionText = parts[0];

    // Parse options (A. Option, B. Option, etc.)
    const options: QuizOption[] = [];
    for (let j = 1; j < parts.length; j++) {
      const optMatch = parts[j].match(/^([A-Z])[\.\s]\s*(.+)$/i);
      if (optMatch) {
        options.push({
          key: optMatch[1].toUpperCase(),
          text: optMatch[2].trim(),
        });
      }
    }

    if (options.length < 2) continue;

    questions.push({
      id: questions.length + 1,
      text: questionText,
      options,
      correctAnswer: correctAnswerKey,
    });
  }

  return questions;
}
