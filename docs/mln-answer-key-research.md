# MLN111 / MLN122 — research answer keys

Updated: 2026-09-10

These keys are **research candidates**, not official answer keys. They are
stored separately so they can be checked and corrected later without changing
the existing quiz data. The question number is 1-based. For multi-select
questions, letters are concatenated (`ABC`). A `?` means that the screenshot
or the question itself is ambiguous, malformed, has duplicated options, or
does not contain a defensible answer.

## Files

- Data: `src/data/mlnResearchAnswerKeys.ts`
- Source screenshots: `public/mln111/` and `public/mln122/`
- OCR working file: `tmp/mln_ocr.json` (temporary, not part of the quiz UI)

## Set IDs

| Course | Quiz set | Key ID |
|---|---|---|
| MLN111 | SP25 FE | `mln111_sp25_fe` |
| MLN111 | SP25 RE | `mln111_sp25_re` |
| MLN111 | SU26 C1FE | `mln111_su26_c1fe` |
| MLN111 | SU26 C2FE | `mln111_su26_c2fe` |
| MLN111 | SU26 RE | `mln111_su26_re` |
| MLN122 | FA23 FEB5 | `mln122_fa23_feb5` |
| MLN122 | SP26 C2FE | `mln122_sp26_c2fe` |
| MLN122 | SU25 B5-1 | `mln122_su25_b5_1` |
| MLN122 | SU26 FE C1 | `mln122_su26_c1fe` |
| MLN122 | SU26 RE | `mln122_su26_re` |

## Method

1. Read the question and options from the local screenshots with OCR, then
   inspect low-confidence or contradictory items directly in the image.
2. Compare the wording with the local MLN111 lecture slides and MLN122
   political-economy chapters in `TaiLieu Tham Khao/`.
3. Cross-check recurring questions against publicly posted FPTU exam threads.
   A repeated question was not used as a blanket answer key for another set;
   only the underlying concept was cross-checked.
4. Mark any questionable item in `MLN_RESEARCH_UNCERTAIN` and keep `?` in the
   key when the available options are defective.

## Main references

- Bộ Giáo dục và Đào tạo, *Giáo trình Triết học Mác–Lênin* — local MLN111
  slides and the [VHU digital document](https://lib.vhu.edu.vn/DigitalDocument/Detail?fileId=7842&treeId=-1).
- Bộ Giáo dục và Đào tạo, *Giáo trình Kinh tế chính trị Mác–Lênin* — local
  MLN122 slides/PDFs and the [UEH Digital Repository record](https://digital.lib.ueh.edu.vn/handle/UEH/62221).
- [HAUI-hosted Bộ GDĐT political-economy textbook PDF](https://lic.haui.edu.vn/media/Book%20Ch%C3%ADnh%20tr%E1%BB%8B/Nampth%20Gi%C3%A1o%20tr%C3%ACnh%20kinh%20t%E1%BA%BF%20ch%C3%ADnh%20tr%E1%BB%8B%20M%C3%A1c%20-%20L%C3%AAnin%281%29.pdf).
- Public recurring-question cross-checks: [MLN111 SP26 FE](https://fuexam.me/threads/mln111-sp26-fe.475/), [MLN122 SP26 C1 FE](https://fuexam.me/threads/mln122-sp26-c1-fe.184/), and [MLN122 SP26 B5 FE](https://fuexam.me/threads/mln122-sp26-b5-fe.371/).

## Important review flags

- Some old screenshots contain duplicated or truncated options, so the key
  may be conceptually correct while the letter is not reliable.
- Several questions say “choose 3” but display four plausible options; these
  are represented as `ABC`/`ABCD` plus a review flag.
- A few calculation questions have inconsistent numbers/options; they are
  left as `?` rather than silently graded.
- The keys are not wired into the image quiz yet. This keeps the current app
  from presenting a research guess as a confirmed answer. After review, the
  confirmed keys can be used when converting the sets to the PMG-style text UI.
