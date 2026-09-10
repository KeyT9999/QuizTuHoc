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
    'B', 'A', 'C', 'A', 'A', 'B', 'C', 'A', 'A', 'A',
    'A', 'B', 'C', 'A', 'A', 'B', 'D', 'B', 'B', 'B',
    'B', 'ACD', 'A', 'ABC', 'ABCD', 'A', 'ABCD', 'B', 'B', 'C',
    'A', 'C', 'B', 'D', 'A', 'D', 'D', 'C', 'A', 'A',
    'C', 'B', 'A', 'C', 'D', 'C', 'A', 'C', 'D', 'A',
    'B', 'C', 'B', 'D', 'ACD', 'ABC', 'A', 'A', 'C', 'A',
]

items = ocr_data['mln122/su26_re']
with open('tools/dump_set5_clean.txt', 'w', encoding='utf-8') as out:
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
