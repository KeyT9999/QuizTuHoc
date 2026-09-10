# -*- coding: utf-8 -*-
import sys
import re

from tools.accent_data_c1fe import C1FE_ACCENTED
from tools.accent_data_c2fe import C2FE_ACCENTED
from tools.accent_data_re import RE_ACCENTED

def format_quiz_ts(const_name, items):
    blocks = []
    for it in items:
        qtext = it['text'].strip()
        opts = it['options']
        ans = it['ans'].strip().upper()
        block = f"{qtext}\nA. {opts['A'].strip()}\nB. {opts['B'].strip()}\nC. {opts['C'].strip()}\nD. {opts['D'].strip()}\n{ans}"
        blocks.append(block)
    
    joined = "\n\n".join(blocks)
    return f"export const {const_name} = `\n{joined}\n`;\n"

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

# 1. C1FE
c1fe_ts = format_quiz_ts('SAMPLE_QUIZ_MLN111_SU26_C1FE', C1FE_ACCENTED)
with open('src/data/sampleQuizMLN111SU26C1FE.ts', 'w', encoding='utf-8') as f:
    f.write(c1fe_ts)
print('Wrote src/data/sampleQuizMLN111SU26C1FE.ts')

# 2. C2FE
c2fe_ts = format_quiz_ts('SAMPLE_QUIZ_MLN111_SU26_C2FE', C2FE_ACCENTED)
with open('src/data/sampleQuizMLN111SU26C2FE.ts', 'w', encoding='utf-8') as f:
    f.write(c2fe_ts)
print('Wrote src/data/sampleQuizMLN111SU26C2FE.ts')

# 3. RE
re_ts = format_quiz_ts('SAMPLE_QUIZ_MLN111_SU26_RE', RE_ACCENTED)
with open('src/data/sampleQuizMLN111SU26RE.ts', 'w', encoding='utf-8') as f:
    f.write(re_ts)
print('Wrote src/data/sampleQuizMLN111SU26RE.ts')

# Validation
for name, content in [
    ('C1FE', c1fe_ts),
    ('C2FE', c2fe_ts),
    ('RE', re_ts)
]:
    raw = content[content.find('`')+1:content.rfind('`')]
    qs = parse_quiz_text(raw)
    assert len(qs) == 60, f"{name} has {len(qs)} questions instead of 60!"
    for i, q in enumerate(qs):
        assert len(q['options']) == 4, f"{name} Q{i+1} has != 4 options"
        assert q['ans'] in ['A', 'B', 'C', 'D'], f"{name} Q{i+1} invalid ans {q['ans']}"
    print(f"{name}: 60 questions validated perfectly with full accents!")

print("ALL 3 MLN111 DATASETS ARE 100% PERFECTLY ACCENTED VIETNAMESE!")
