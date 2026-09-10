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
    'A', 'A', 'A', 'A', 'C', 'A', 'A', 'D', 'B', 'B',
    'C', 'D', 'B', 'A', 'C', 'A', 'C', 'A', 'C', 'A',
    'B', 'B', 'C', 'A', 'C', 'A', 'B', 'B', 'A', 'B',
    'A', 'B', 'C', 'D', 'B', 'A', 'A', 'A', 'A', 'A',
    'A', 'D', 'A', 'E', 'C', 'C', 'A', 'A', 'C', 'A',
    'D', 'A', 'C', 'A', 'A', 'A', 'BCD', 'A', 'ABC', 'B',
]

items = ocr_data['mln122/sp26_c2fe']
with open('tools/dump_set2_clean.txt', 'w', encoding='utf-8') as out:
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
