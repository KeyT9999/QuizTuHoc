# -*- coding: utf-8 -*-
"""
Builds TypeScript quiz files for all 5 MLN122 sets.
"""

from tools.accent_data_mln122_fa23_feb5 import FA23_FEB5_ACCENTED
from tools.accent_data_mln122_sp26_c2fe import SP26_C2FE_ACCENTED
from tools.accent_data_mln122_su25_b5_1 import SU25_B5_1_ACCENTED
from tools.accent_data_mln122_su26_c1fe import SU26_C1FE_ACCENTED
from tools.accent_data_mln122_su26_re import SU26_RE_ACCENTED

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

targets = [
    ('SAMPLE_QUIZ_MLN122_FA23_FEB5', FA23_FEB5_ACCENTED, 'src/data/sampleQuizMLN122FA23FEB5.ts'),
    ('SAMPLE_QUIZ_MLN122_SP26_C2FE', SP26_C2FE_ACCENTED, 'src/data/sampleQuizMLN122SP26C2FE.ts'),
    ('SAMPLE_QUIZ_MLN122_SU25_B5_1', SU25_B5_1_ACCENTED, 'src/data/sampleQuizMLN122SU25B51.ts'),
    ('SAMPLE_QUIZ_MLN122_SU26_FE_C1', SU26_C1FE_ACCENTED, 'src/data/sampleQuizMLN122SU26C1FE.ts'),
    ('SAMPLE_QUIZ_MLN122_SU26_RE', SU26_RE_ACCENTED, 'src/data/sampleQuizMLN122SU26RE.ts'),
]

for const_name, data, file_path in targets:
    content = format_quiz_ts(const_name, data)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Generated {file_path} with constant {const_name} ({len(data)} questions)")

print("\nALL 5 MLN122 TYPESCRIPT FILES BUILT SUCCESSFULLY!")
