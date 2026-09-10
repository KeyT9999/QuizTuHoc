# -*- coding: utf-8 -*-
import re

def parse_quiz_text(raw_text):
    questions = []
    raw_blocks = [b for b in re.split(r'\n\s*\n+', raw_text.strip()) if b.strip()]
    for block in raw_blocks:
        lines = [l.strip() for l in block.split('\n') if l.strip()]
        if len(lines) < 2:
            continue
        last_line = lines[-1]
        m = re.match(r'^([A-F](?:\s*,?\s*[A-F]){0,3})(?:\s*\(.*|\s+.*)?$', last_line, re.I)
        if not m:
            continue
        ans = m.group(1).upper()
        content_lines = lines[:-1]
        options = []
        q_lines = []
        for cl in content_lines:
            om = re.match(r'^([A-F])[\.\:\)\-]\s*(.+)$', cl, re.I)
            if om:
                options.append((om.group(1).upper(), om.group(2).strip()))
            else:
                q_lines.append(cl)
        questions.append({
            'text': ' '.join(q_lines),
            'options': options,
            'ans': ans
        })
    return questions

files = [
    ('src/data/sampleQuizMLN111SP25FE.ts', 61),
    ('src/data/sampleQuizMLN111SP25RE.ts', 60),
    ('src/data/sampleQuizMLN122FA23FEB5.ts', 60),
    ('src/data/sampleQuizMLN122SP26C2FE.ts', 60),
    ('src/data/sampleQuizMLN122SU25B51.ts', 60),
    ('src/data/sampleQuizMLN122SU26C1FE.ts', 60),
    ('src/data/sampleQuizMLN122SU26RE.ts', 60),
]

for p, exp in files:
    with open(p, 'r', encoding='utf-8') as f:
        content = f.read()
    raw = content[content.find('`')+1:content.rfind('`')]
    qs = parse_quiz_text(raw)
    assert len(qs) == exp, f'{p}: expected {exp} questions, parsed {len(qs)}'
    for i, q in enumerate(qs):
        assert len(q['options']) == 4, f'{p} Q{i+1}: expected 4 options, got {len(q["options"])}'
        assert q['text'], f'{p} Q{i+1}: empty question'
    print(f'{p}: {len(qs)} questions parsed and validated 100% perfectly!')

print('\nALL 7 QUIZ FILES ARE 100% READY!')
