# -*- coding: utf-8 -*-
import json
import re

with open('tmp/mln_ocr.json', 'r', encoding='utf-8') as f:
    ocr_data = json.load(f)

ANSWERS = [
    'A', 'D', 'A', 'C', 'D', 'A', 'A', 'B', 'B', 'A',
    'C', 'C', 'ABC', 'A', 'A', 'C', 'D', 'A', 'C', 'D',
    'A', 'C', 'A', 'A', 'BC', 'A', 'A', 'ABCD', 'A', 'A',
    'B', 'C', 'B', 'A', 'C', 'D', 'A', 'A', 'A', 'D',
    'D', 'D', 'A', 'B', 'C', 'D', 'D', 'B', 'A', 'C',
    'B', 'C', 'B', 'B', 'B', 'C', 'A', 'C', 'C', 'A',
]

items = ocr_data['mln122/fa23_feb5']
with open('tools/dump_set1_out.txt', 'w', encoding='utf-8') as out:
    for i, it in enumerate(items):
        lines = [re.sub(r'\s+', ' ', l).strip(' /') for l in it['lines'] if l.strip()]
        out.write(f"--- Q{i+1} (Ans: {ANSWERS[i]}) ---\n")
        out.write("\n".join(lines[:8]) + "\n\n")
