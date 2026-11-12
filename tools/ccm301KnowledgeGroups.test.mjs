import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { parseQuizText } from '../src/utils/quizParser.ts';
import { SAMPLE_QUIZ_CCM301 } from '../src/data/sampleQuizCCM301.ts';
import {
  CCM301_KNOWLEDGE_GROUPS,
  getCcm301KnowledgeGroupId,
  getCcm301QuestionsForGroup,
} from '../src/data/ccm301KnowledgeGroups.ts';

const questions = parseQuizText(SAMPLE_QUIZ_CCM301);

test('the reviewed question order still matches the manual CCM301 mapping', () => {
  const fingerprint = createHash('sha256')
    .update(questions.map((question) => question.text).join('\n'))
    .digest('hex');
  assert.equal(fingerprint, '166eb438b79798a9de259e4d3257e6896fd9390708c14c5c1fef39cbf15ccb20',
    'Review the CCM301 topic assignments when question text or order changes.');
});

test('all 444 questions belong to exactly one of 12 nonempty groups', () => {
  assert.equal(questions.length, 444);
  assert.equal(CCM301_KNOWLEDGE_GROUPS.length, 12);
  assert.equal(new Set(CCM301_KNOWLEDGE_GROUPS.map((group) => group.id)).size, 12);
  const assignedIds = CCM301_KNOWLEDGE_GROUPS.flatMap((group) => group.questionIds);
  assert.equal(assignedIds.length, 444);
  assert.equal(new Set(assignedIds).size, 444);
  assert.deepEqual([...assignedIds].sort((a, b) => a - b), questions.map((question) => question.id));
  for (const group of CCM301_KNOWLEDGE_GROUPS) {
    const selected = getCcm301QuestionsForGroup(questions, group.id);
    assert.ok(selected.length > 0);
    assert.deepEqual(selected.map((question) => question.id), group.questionIds);
  }
});

test('topics follow the concept being examined, including ambiguous stems', () => {
  const examples = {
    1: '1', 201: '1', 335: '2', 340: '2', 393: '3', 414: '3', 440: '3',
    213: '4', 237: '4', 270: '5', 279: '5', 306: '5', 74: '6', 400: '6',
    242: '7', 383: '7', 395: '8', 406: '8', 363: '9', 444: '9',
    89: '10', 415: '10', 435: '11', 442: '11', 391: '12', 425: '12',
  };
  for (const [id, groupId] of Object.entries(examples)) {
    assert.equal(getCcm301KnowledgeGroupId(questions[Number(id) - 1]), groupId, `Question ${id}`);
  }
});

test('repeated question stems stay together despite shuffled options or source annotations', () => {
  const seen = new Map();
  for (const question of questions) {
    const stem = question.text.toLowerCase()
      .replace(/\(nhung hoàng\)|\(073-356-8678\)/g, '')
      .replace(/pre\s+crisis/g, 'precrisis')
      .replace(/[^a-z0-9]/g, '');
    const groupId = getCcm301KnowledgeGroupId(question);
    if (seen.has(stem)) assert.equal(groupId, seen.get(stem), `Repeated question ${question.id}`);
    else seen.set(stem, groupId);
  }
});

test('filtering preserves source IDs, content, answers and ordering without mutating the bank', () => {
  const before = structuredClone(questions);
  for (const group of CCM301_KNOWLEDGE_GROUPS) {
    for (const question of getCcm301QuestionsForGroup(questions, group.id)) {
      assert.strictEqual(question, questions[question.id - 1]);
    }
  }
  assert.deepEqual(questions, before);
  assert.deepEqual(getCcm301QuestionsForGroup(questions, 'unknown'), []);
  assert.deepEqual(getCcm301QuestionsForGroup([], '1'), []);
  assert.equal(getCcm301KnowledgeGroupId({ ...questions[0], id: 445 }), '');
});
