# -*- coding: utf-8 -*-
import json
import re

with open('tmp/mln_ocr.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

mln122_sets = {
    'mln122_fa23_feb5': 'mln122/fa23_feb5',
    'mln122_sp26_c2fe': 'mln122/sp26_c2fe',
    'mln122_su25_b5_1': 'mln122/su25_b5_1',
    'mln122_su26_c1fe': 'mln122/su26_c1fe',
    'mln122_su26_re': 'mln122/su26_re'
}

for set_id, key in mln122_sets.items():
    items = data[key]
    print(f"=== {set_id} ({len(items)} items) ===")
    for i, item in enumerate(items[:3]):
        print(f"--- Q{i+1} ---")
        for line in item['lines']:
            print("  ", line)
