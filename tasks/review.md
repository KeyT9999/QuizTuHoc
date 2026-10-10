# Code review: Group progress and mock exam history

## Findings and fixes

1. **[P2] Stored exam attempts could be internally inconsistent.** The initial loader validated individual field types but could accept a record whose correct, incorrect, and skipped counts did not match the question total, or whose score did not match its counts. Added consistency checks for totals, elapsed time, outcome ID counts, score, and percentage; malformed records are ignored.
2. **[P3] History rendering made the exam controller harder to scan.** Extracted the recent-attempt and review-priority UI into `MockExamHistoryPanel`, leaving `MockExamView` responsible for exam flow and persistence.
3. **[Build finding] Optional question lookup was not narrowed by a generic filter.** Changed the review-priority projection to `flatMap`, so only questions found in the active set reach the component.

## Review checklist

- Correctness: group progress uses the existing group-specific mastery key; exam counts and score use the same answer comparison as the result screen; manual and timeout submission are guarded against duplicate history entries.
- Readability and architecture: storage and history presentation have separate, focused modules; attempt history is bounded to 20 records per set.
- Security and data handling: local storage input is validated before rendering; no external service or dependency was added.
- Performance: recent history is capped at 20 attempts, and weak-question aggregation is memoized.
- Accessibility and responsive layout: progress values have accessible labels; history sections use headings/regions; narrow layouts stack the history panels.

## Verification

- `npm run lint` — passed.
- `npm run build` — passed; Vite reports the application bundle exceeds its 500 kB advisory threshold.
- Storage behavior check — passed for save/load, per-set isolation, malformed aggregate rejection, and the 20-attempt cap.
- Local browser check — group picker showed `1/37`, `3%`, `Đang học` after marking one question learned; an exam attempt appeared on setup with score, elapsed/allowed time, and review summary.
- CI/CD workflow inspection — GitHub Actions on `main` runs `npm install`, lint, and build; remote run status will be checked after push.

## Verdict

Approve for merge. The local verification passes; remote workflow execution is the final deployment check after the `main` push.
