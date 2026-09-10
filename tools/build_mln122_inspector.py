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

def clean_lines(lines):
    res = []
    for l in lines:
        l = re.sub(r'\s+', ' ', l).strip(' /')
        if not l or NOISE.search(l) or re.match(r'^\d+:\d+$', l):
            continue
        res.append(l)
    return res

def parse_item(item):
    lines = clean_lines(item['lines'])
    joined = ' '.join(lines)
    joined = re.sub(r'(?<![A-Za-z])([A-D])(?=[A-ZĐ])', r'\1. ', joined)
    matches = list(re.finditer(r'(?<![A-Za-z])([A-D])[\.\:\)]\s*', joined, re.I))
    if not matches:
        return {'question': joined, 'options': {}}
    
    first = matches[0].start()
    question_text = joined[:first]
    question_text = re.sub(r'^\(?\s*\d+\s*[\.:\)]\s*', '', question_text).strip()
    options = {}
    for i, m in enumerate(matches):
        lbl = m.group(1).upper()
        end = matches[i+1].start() if i+1 < len(matches) else len(joined)
        opt_text = joined[m.end():end].strip()
        if lbl not in options:
            options[lbl] = opt_text
    return {'question': question_text, 'options': options}

for key in ['mln122/fa23_feb5', 'mln122/sp26_c2fe', 'mln122/su25_b5_1', 'mln122/su26_c1fe', 'mln122/su26_re']:
    items = ocr_data[key]
    print(f"=== {key} ===")
    missing_opts = []
    for it in items:
        p = parse_item(it)
        if len(p['options']) < 4:
            missing_opts.append((it['qNum'], list(p['options'].keys())))
    print(f"Missing options (< 4) in {len(missing_opts)} items: {missing_opts}")
