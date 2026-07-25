import fs from 'fs';
import { parseQuizText } from './src/utils/quizParser.ts';

const text = fs.readFileSync('./src/dethi.md', 'utf-8');
const questions = parseQuizText(text);

console.log('Total questions parsed:', questions.length);

// Let's inspect raw blocks that failed
const blocks = text.trim().split(/\n\s*\n+/).filter(b => b.trim().length > 0);
console.log('Total raw blocks:', blocks.length);

let failedCount = 0;
blocks.forEach((block, idx) => {
  const parsed = parseQuizText(block);
  if (parsed.length === 0) {
    failedCount++;
    console.log(`Failed Block #${idx + 1}:`);
    console.log(block);
    console.log('-----------------------------------');
  }
});

console.log('Failed count:', failedCount);
