export interface QuizOption {
  key: string;
  text: string;
}

export interface Question {
  id: number;
  text: string;
  options: QuizOption[];
  correctAnswer: string;
  freeResponse?: boolean;
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
    const freeResponse = lines[0]?.toLowerCase() === '[free-response]';
    if (freeResponse) lines = lines.slice(1);

    // Accept answers appended to the final option, such as
    // "D. link() . A" or "D. link() . B, C".
    const inlineAnswerMatch = lines
      .join('\n')
      .match(/\s+\.\s*([A-F](?:\s*,\s*[A-F]){0,3})\s*$/i);
    if (inlineAnswerMatch) {
      const answer = inlineAnswerMatch[1].replace(/[^A-F]/gi, '').toUpperCase();
      const withoutAnswer = lines
        .join('\n')
        .slice(0, inlineAnswerMatch.index)
        .trimEnd();
      lines = [...withoutAnswer.split('\n'), answer];
    }

    // Filter out Quizlet section headers like "Chưa học (287)", "Bạn chưa học các thuật ngữ này!", "Chọn 287"
    lines = lines.filter(
      (l) => !/^(Chưa học|Bạn chưa học|Chọn \d+|Chưa học \(\d+\))/i.test(l)
    );

    if (lines.length < 2) continue;

    // Answer line is the last line
    const lastLine = lines[lines.length - 1];
    const freeResponseAnswer = freeResponse
      ? lastLine.match(/^\[answer\]\s*(.+)$/i)
      : null;

    // Extract answer letter (A, B, C, D) even if followed by explanation/parentheses: e.g. "D (Kiểu hỏi khác...)"
    const ansMatch = lastLine.match(/^(\?|[A-F](?:\s*,?\s*[A-F]){0,3})(?:\s*\(.*|\s+.*)?$/i);
    if (!ansMatch && !freeResponseAnswer) continue;

    if (freeResponse && freeResponseAnswer) {
      const text = lines.slice(0, lines.length - 1).join(' ').trim();
      if (text) {
        questions.push({
          id: questions.length + 1,
          text,
          options: [],
          correctAnswer: freeResponseAnswer[1].trim(),
          freeResponse: true,
        });
      }
      continue;
    }

    if (!ansMatch) continue;

    if (ansMatch[1] === '?') {
      const contentLines = lines.slice(0, lines.length - 1);

      if (freeResponse) {
        const text = contentLines.join(' ').trim();
        if (text) {
          questions.push({
            id: questions.length + 1,
            text,
            options: [],
            correctAnswer: '?',
            freeResponse: true,
          });
        }
        continue;
      }

      const options: QuizOption[] = [];
      const seenKeys = new Set<string>();
      const qTextLines: string[] = [];

      for (const line of contentLines) {
        const optMatch = line.match(/^([A-F])[.)-]\s*(.+)$/i);
        if (optMatch) {
          const key = optMatch[1].toUpperCase();
          if (options.length === 0 && key !== 'A') {
            qTextLines.push(line);
            continue;
          }
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            options.push({ key, text: optMatch[2].trim() });
          }
        } else if (options.length === 0) {
          qTextLines.push(line);
        }
      }

      if (options.length >= 2 && qTextLines.join(' ').trim()) {
        questions.push({
          id: questions.length + 1,
          text: qTextLines.join(' ').trim().replace(/^\d+\.\s*/, ''),
          options,
          correctAnswer: '?',
        });
      }
      continue;
    }

    const correctAnswerKey = ansMatch[1]
      .replace(/[^A-F]/gi, '')
      .toUpperCase()
      .split('')
      .sort()
      .join('');
    const contentLines = lines.slice(0, lines.length - 1);

    const options: QuizOption[] = [];
    const seenKeys = new Set<string>();
    let questionText = '';

    // Strategy 1: Check if options are split by '|' on a single/joined line
    const contentText = contentLines.join(' ');
    const parts = contentText.split('|').map((p) => p.trim()).filter((p) => p.length > 0);
    if (parts.length >= 2) {
      questionText = parts[0];
      for (let j = 1; j < parts.length; j++) {
        const optMatch = parts[j].match(/^([A-F])[.:)-]?\s*(.+)$/i);
        if (optMatch) {
          const key = optMatch[1].toUpperCase();
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            options.push({
              key,
              text: optMatch[2].trim(),
            });
          }
        }
      }
    }

    // Strategy 2: Multiline options (A., B., C., D. on separate lines)
    if (options.length < 2) {
      options.length = 0;
      seenKeys.clear();
      const qTextLines: string[] = [];

      for (const line of contentLines) {
        const optMatch = line.match(/^([A-F])[.)-]\s*(.+)$/i);
        if (optMatch) {
          const key = optMatch[1].toUpperCase();
          if (options.length === 0 && key !== 'A') {
            qTextLines.push(line);
            continue;
          }
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            options.push({
              key,
              text: optMatch[2].trim(),
            });
          }
        } else if (options.length === 0) {
          qTextLines.push(line);
        }
      }
      questionText = qTextLines.join(' ');
    }

    if (options.length >= 2 && questionText.trim().length > 0) {
      questions.push({
        id: questions.length + 1,
        text: questionText.trim().replace(/^\d+\.\s*/, ''),
        options,
        correctAnswer: correctAnswerKey,
      });
    }
  }

  return questions;
}
