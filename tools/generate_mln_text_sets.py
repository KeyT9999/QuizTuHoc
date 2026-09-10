import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OCR_PATH = ROOT / 'tmp' / 'mln_ocr.json'
OUT_PATH = ROOT / 'src' / 'data' / 'mlnTextSets.ts'

SET_IDS = {
    'mln111/sp25_fe': 'mln111_sp25_fe',
    'mln111/sp25_re': 'mln111_sp25_re',
    'mln111/su26_c1fe': 'mln111_su26_c1fe',
    'mln111/su26_c2fe': 'mln111_su26_c2fe',
    'mln111/su26_re': 'mln111_su26_re',
    'mln122/fa23_feb5': 'mln122_fa23_feb5',
    'mln122/sp26_c2fe': 'mln122_sp26_c2fe',
    'mln122/su25_b5_1': 'mln122_su25_b5_1',
    'mln122/su26_c1fe': 'mln122_su26_fe_c1',
    'mln122/su26_re': 'mln122_su26_re',
}


NOISE = re.compile(
    r'(total marks|fuoverflow|fuoashthe|ishthe|time left|font:|multiple ?choices?|'
    r'there are \d+ questions|choose ?\d|answer\)?|back|next|exit|eat|kizspy|'
    r'question:? ?\d+|fuu?overflow)',
    re.I,
)


def normalize_space(value: str) -> str:
    return re.sub(r'\s+', ' ', value).strip(' /')


def clean_lines(lines):
    cleaned = []
    for raw in lines:
        line = normalize_space(raw)
        if not line or NOISE.search(line):
            continue
        cleaned.append(line)
    return cleaned


def parse_question(item):
    lines = clean_lines(item['lines'])
    joined = ' '.join(lines)

    # A few OCR lines lose the space after the option label (e.g. BCong...).
    joined = re.sub(r'(?<![A-Za-z])([A-D])(?=[A-ZĐ])', r'\1. ', joined)
    matches = list(re.finditer(r'(?<![A-Za-z])([A-D])[\.\:\)]\s*', joined, re.I))
    if not matches:
        return None

    first = matches[0].start()
    question_text = joined[:first]
    question_text = re.sub(r'^\(?\s*\d+\s*[\.:\)]\s*', '', question_text)
    question_text = normalize_space(question_text)
    options = {}
    for index, match in enumerate(matches):
        label = match.group(1).upper()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(joined)
        option_text = normalize_space(joined[match.end():end])
        if label not in options and option_text:
            options[label] = option_text

    if not question_text or len(options) < 2:
        return None
    return {'question': question_text, 'options': options}


def make_raw_text(items):
    blocks = []
    failed = []
    for item in items:
        parsed = parse_question(item)
        if not parsed:
            failed.append(item['qNum'])
            continue
        blocks.append(
            '\n'.join(
                [parsed['question']]
                + [f'{label}. {parsed["options"].get(label, "(không đọc được từ ảnh)")}' for label in 'ABCD']
                + ['?']
            )
        )
    return '\n\n'.join(blocks), failed


def main():
    source = json.loads(OCR_PATH.read_text(encoding='utf-8'))
    output = ['// Generated from the local MLN screenshots by tools/generate_mln_text_sets.py.',
              '// OCR text is a draft; source images remain available for verification.\n',
              'export const MLN_TEXT_SET_RAW: Record<string, string> = {']
    for source_key, set_id in SET_IDS.items():
        raw, failed = make_raw_text(source[source_key])
        output.append(f'  {set_id}: {json.dumps(raw, ensure_ascii=False)},')
        print(f'{set_id}: {raw.count(chr(10) + chr(10)) + (1 if raw else 0)} questions; failed={failed}')
    output += ['};', '']
    OUT_PATH.write_text('\n'.join(output), encoding='utf-8')


if __name__ == '__main__':
    main()
