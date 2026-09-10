import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

content = open('src/data/mlnTextSets.ts', encoding='utf-8').read()

pattern = re.compile(r'^\s*([a-zA-Z0-9_]+):\s*"', re.MULTILINE)
matches = list(pattern.finditer(content))

for i, m in enumerate(matches):
    key = m.group(1)
    start = m.end()
    end = matches[i+1].start() if i + 1 < len(matches) else content.rfind('"')
    val = content[start:end].rstrip('", \n\r')
    # Unescape \n
    text = val.replace('\\n', '\n').replace('\\"', '"')
    blocks = [b for b in text.split('\n\n') if b.strip()]
    first_q = blocks[0].replace('\n', ' ') if blocks else 'EMPTY'
    print(f"Key: {key} | Total blocks: {len(blocks)} | First: {first_q[:80]}...")
