# Plan: Group study progress and mock exam history

## Goal

Help learners decide what to study next and see whether their mock FE exam results are improving.

## Scope

1. **Knowledge-group progress**
   - Read mastered question IDs from the existing per-group quiz progress key.
   - Show mastered count, percentage, progress bar, and one of `Chưa học`, `Đang học`, or `Đã học` on every group card.
   - Count only questions belonging to that group and handle missing or malformed browser storage safely.
2. **Mock FE history**
   - Persist completed attempts separately for each quiz set in browser local storage.
   - Record completion time, score, correct/incorrect/skipped counts, elapsed and allowed time, and question IDs missed or skipped.
   - Keep the 20 most recent attempts, show a compact recent-history list on the exam setup screen, and summarize recurring missed/skipped questions as study priorities.
   - Keep exam submission single-shot so a timeout and a manual submit cannot store the same attempt twice.

## Implementation steps

1. Add a small typed storage utility for reading and writing validated, bounded mock-exam history.
2. Extend the knowledge-group picker with group-scoped progress and accessible status/progress indicators.
3. Save an attempt when the learner submits or times out; show recent scores, times, and recurring review questions on setup.
4. Add responsive styles for the group progress indicators and exam history panel.
5. Review the complete diff for storage validation, duplicate submissions, scoring consistency, and responsive/accessibility issues; fix findings.
6. Run the repository CI commands (`npm run lint` and `npm run build`), inspect GitHub Actions after pushing, and push the focused change to `main`.

## Acceptance checks

- Group cards show accurate progress for the questions in that group only, with correct empty/in-progress/completed states.
- Missing or invalid local storage never breaks the group picker or exam setup.
- Every completed exam attempt stores one score/time record; the most recent 20 are retained per quiz set.
- Setup shows recent attempts and identifies frequently missed or skipped questions without changing exam scoring.
- Lint and production build pass, code-review findings are fixed, and the pushed commit is visible on `origin/main`.
