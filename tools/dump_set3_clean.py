# -*- coding: utf-8 -*-
import json
import re

with open('tmp/mln_ocr.json', 'r', encoding='utf-8') as f:
    ocr_data = json.load(f)

NOISE = re.compile(
    r'(total marks|fuoverflow|fuoashthe|ishthe|time left|font:|multiple ?choices?|'
    r'there are \d+ questions|choose ?\d|answer\)?|back|next|exit|eat|kizspy|'
    r'question:? ?\d+|fuu?overflow|fuoshthe|exam\.)',
    re.I,
)

ANSWERS = [
    'A', 'D', 'D', 'B', 'A', 'A', 'C', 'D', 'A', 'A',
    'B', 'A', 'C', 'C', 'C', 'D', 'A', 'A', 'A', 'A',
    'B', 'A', 'A', 'A', 'C', 'A', 'C', 'A', 'C', 'A',
    'B', 'A', 'C', 'A', 'A', 'D', 'A', 'A', 'B', 'A',
    'B', 'C', 'A', 'A', 'C', 'A', 'A', 'C', 'D', 'D',
    'D', 'A', 'AC', 'D', 'A', 'A', 'A', 'A', 'A', 'A',
]

items = ocr_data['mln122/su25_b5_1']
with open('tools/dump_set3_clean.txt', 'w', encoding='utf-8') as out:
    for i, it in enumerate(items):
        lines = []
        for l in it['lines']:
            l = re.sub(r'\s+', ' ', l).strip(' /')
            if not l or NOISE.search(l) or re.match(r'^\d+:\d+$', l):
                continue
            lines.append(l)
        ans = ANSWERS[i] if i < len(ANSWERS) else '?'
        out.write(f"=== Q{i+1} (Ans: {ans}) ===\n")
        out.write("\n".join(lines) + "\n\n")
