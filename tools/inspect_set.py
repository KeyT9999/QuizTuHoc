import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

data = json.load(open('mln111_parsed_180.json', encoding='utf-8'))

def inspect(sname, start, end):
    for q in data[sname][start-1:end]:
        print(f"[{sname} Q{q['qNum']}] {q['text']}")
        for k in ['A', 'B', 'C', 'D']:
            print(f"  {k}. {q['options'][k]}")
        print()

if __name__ == '__main__':
    s = sys.argv[1] if len(sys.argv) > 1 else 'C1FE'
    start = int(sys.argv[2]) if len(sys.argv) > 2 else 1
    end = int(sys.argv[3]) if len(sys.argv) > 3 else 10
    inspect(s, start, end)
