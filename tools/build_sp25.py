# -*- coding: utf-8 -*-
from tools.accent_data_sp25_fe import SP25_FE_ACCENTED
from tools.accent_data_sp25_re import SP25_RE_ACCENTED

def format_quiz_ts(const_name, items):
    blocks = []
    for it in items:
        qtext = it['text'].strip()
        opts = it['options']
        ans = it['ans'].strip().upper()
        block = f"{qtext}\nA. {opts['A'].strip()}\nB. {opts['B'].strip()}\nC. {opts['C'].strip()}\nD. {opts['D'].strip()}\n{ans}"
        blocks.append(block)
    joined = '\n\n'.join(blocks)
    return f"export const {const_name} = `\n{joined}\n`;\n"

with open('src/data/sampleQuizMLN111SP25FE.ts', 'w', encoding='utf-8') as f:
    f.write(format_quiz_ts('SAMPLE_QUIZ_MLN111_SP25_FE', SP25_FE_ACCENTED))
print('Wrote src/data/sampleQuizMLN111SP25FE.ts')

with open('src/data/sampleQuizMLN111SP25RE.ts', 'w', encoding='utf-8') as f:
    f.write(format_quiz_ts('SAMPLE_QUIZ_MLN111_SP25_RE', SP25_RE_ACCENTED))
print('Wrote src/data/sampleQuizMLN111SP25RE.ts')
