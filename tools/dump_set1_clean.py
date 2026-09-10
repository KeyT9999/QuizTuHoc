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
    'A', 'D', 'A', 'C', 'D', 'A', 'A', 'B', 'B', 'A',
    'C', 'C', 'ABC', 'A', 'A', 'C', 'D', 'A', 'C', 'D',
    'A', 'C', 'A', 'A', 'BC', 'A', 'A', 'ABCD', 'A', 'A',
    'B', 'C', 'B', 'A', 'C', 'D', 'A', 'A', 'A', 'D',
    'D', 'D', 'A', 'B', 'C', 'D', 'D', 'B', 'A', 'C',
    'B', 'C', 'B', 'B', 'B', 'C', 'A', 'C', 'C', 'A',
]

items = ocr_data['mln122/fa23_feb5']
with open('tools/dump_set1_clean.txt', 'w', encoding='utf-8') as out:
    for i, it in enumerate(items):
        lines = []
        for l in it['lines']:
            l = re.sub(r'\s+', ' ', l).strip(' /')
            if not l or NOISE.search(l) or re.match(r'^\d+:\d+$', l):
                continue
            lines.append(l)
        out.write(f"=== Q{i+1} (Ans: {ANSWERS[i]}) ===\n")
        out.write("\n".join(lines) + "\n\n")
