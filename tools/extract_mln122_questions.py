# -*- coding: utf-8 -*-
import json
import re

with open('tmp/mln_ocr.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

NOISE = re.compile(
    r'(total marks|fuoverflow|fuoashthe|ishthe|time left|font:|multiple ?choices?|'
    r'there are \d+ questions|choose ?\d|answer\)?|back|next|exit|eat|kizspy|'
    r'question:? ?\d+|fuu?overflow|fuoshthe|exam\.)',
    re.I,
)

def clean_lines(lines):
    res = []
    for l in lines:
        l = re.sub(r'\s+', ' ', l).strip(' /')
        if not l or NOISE.search(l):
            continue
        res.append(l)
    return res

for set_key in ['mln122/fa23_feb5', 'mln122/sp26_c2fe', 'mln122/su25_b5_1', 'mln122/su26_c1fe', 'mln122/su26_re']:
    items = data[set_key]
    out_file = f"tools/raw_{set_key.replace('/', '_')}.txt"
    with open(out_file, 'w', encoding='utf-8') as f:
        for it in items:
            qnum = it.get('qNum', '?')
            lines = clean_lines(it['lines'])
            f.write(f"=== Q{qnum} ===\n")
            for line in lines:
                f.write(f"  {line}\n")
            f.write("\n")
    print(f"Wrote {out_file} ({len(items)} questions)")
