import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

content = open('src/data/quizSets.ts', encoding='utf-8').read()

blocks = content.split('{\n    id:')
print('Total blocks in quizSets.ts:', len(blocks) - 1)

for b in blocks[1:]:
    id_m = re.search(r"^\s*['\"]([^'\"]+)['\"]", b)
    title_m = re.search(r"title:\s*['\"]([^'\"]+)['\"]", b)
    course_m = re.search(r"courseId:\s*['\"]([^'\"]+)['\"]", b)
    kind_m = re.search(r"kind:\s*['\"]([^'\"]+)['\"]", b)
    raw_m = re.search(r"rawText:\s*([A-Za-z0-9_]+|['\"][^'\"]*['\"])", b)
    
    qid = id_m.group(1) if id_m else 'unknown'
    title = title_m.group(1) if title_m else 'unknown'
    course = course_m.group(1) if course_m else 'unknown'
    kind = kind_m.group(1) if kind_m else 'text'
    raw = raw_m.group(1) if raw_m else 'none'
    
    print(f"ID: {qid} | Course: {course} | Kind: {kind} | Title: {title} | RawTextRef: {raw}")
