import assert from 'node:assert/strict';
import test from 'node:test';
import { BRA301_KNOWLEDGE_GROUPS, BRA301_QUESTION_IDS, getBra301QuestionsForGroup } from '../src/data/bra301KnowledgeGroups.ts';
import { SAMPLE_QUIZ_BRA301 } from '../src/data/sampleQuizBRA301.ts';
import { parseQuizText } from '../src/utils/quizParser.ts';

const questions = parseQuizText(SAMPLE_QUIZ_BRA301, BRA301_QUESTION_IDS);

test('the BRA301 bank contains one copy of each normalized question stem', () => {
  const stems = questions.map(({ text }) => text.normalize('NFKC').toLowerCase()
    .replace(/\(update 23\.11\)/g, '')
    .replace(/[^\p{L}\p{N}]/gu, ''));
  assert.equal(new Set(stems).size, questions.length);
});

test('all remaining questions keep their original IDs and belong to one of 12 groups', () => {
  assert.equal(BRA301_KNOWLEDGE_GROUPS.length, 12);
  const groupedIds = BRA301_KNOWLEDGE_GROUPS.flatMap((group) => group.questionIds).sort((a, b) => a - b);
  assert.equal(new Set(groupedIds).size, groupedIds.length);
  assert.deepEqual(questions.map(({ id }) => id), groupedIds);
  for (const group of BRA301_KNOWLEDGE_GROUPS) {
    assert.ok(group.questionIds.length > 0);
    assert.deepEqual(getBra301QuestionsForGroup(questions, group.id).map(({ id }) => id), group.questionIds);
  }
  const updatedQuestions = getBra301QuestionsForGroup(questions, '12');
  assert.equal(updatedQuestions.length, 20);
  assert.ok(updatedQuestions.every(({ text }) => text.includes('(update 23.11)')));
});

test('conflicting duplicates retain the reviewed answers', () => {
  const questionsById = new Map(questions.map((question) => [question.id, question]));
  for (const [id, expectedAnswer, removedId] of [
    [222, '3', 322],
    [273, 'Brand equity', 444],
    [391, 'The hierarchical stages of customer loyalty toward a brand', 172],
  ]) {
    assert.ok(!questionsById.has(removedId), `Question ${removedId} should have been removed`);
    const question = questionsById.get(id);
    assert.equal(question.options.find(({ key }) => key === question.correctAnswer).text, expectedAnswer);
  }
});
