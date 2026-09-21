# -*- coding: utf-8 -*-
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('tmp_user_prompt.txt', 'r', encoding='utf-8') as f:
    text = f.read()

trunc_idx = text.find('<truncated')
if trunc_idx != -1:
    text = text[:trunc_idx]

# Replace cyrillic lookalikes
text = text.replace('\u0410', 'A').replace('\u0412', 'B').replace('\u0421', 'C').replace('\u0415', 'E')
text = text.replace('\u0430', 'a').replace('\u0441', 'c').replace('\u0435', 'e')
text = re.sub(r'(\?\s*)(A[\.\:]\s*)', r'\1\n\2', text)

raw_lines = [l.strip() for l in text.splitlines()]

start = 0
while start < len(raw_lines) and ('Thêm 1 QUIZ' in raw_lines[start] or not raw_lines[start]):
    start += 1
raw_lines = raw_lines[start:]

if raw_lines and 'Đâu là biểu hiện thứ hai cùa hiện tượng tha hóa con người?' in raw_lines[-5:]:
    idx = -1
    for i in range(len(raw_lines)-1, -1, -1):
        if 'Đâu là biểu hiện thứ hai cùa hiện tượng tha hóa con người?' in raw_lines[i]:
            idx = i
            break
    if idx != -1:
        raw_lines = raw_lines[:idx]

new_lines = []
i = 0
while i < len(raw_lines):
    l = raw_lines[i]
    if 'Một sinh viên chuẩn bị bài thuyết trình trong một tháng theo cách thức:' in l:
        q_lines = [l]
        i += 1
        while i < len(raw_lines) and raw_lines[i] != 'Quy luật lượng chất':
            q_lines.append(raw_lines[i])
            i += 1
        i += 1
        full_q = " ".join([ql for ql in q_lines if ql])
        new_lines.append(full_q)
        new_lines.append("A. Quy luật mâu thuẫn")
        new_lines.append("B. Quy luật lượng - chất")
        new_lines.append("C. Quy luật phủ định của phủ định")
        new_lines.append("D. Nguyên lý về mối liên hệ phổ biến")
        new_lines.append("B")
        continue
    new_lines.append(l)
    i += 1

raw_lines = new_lines

in_parentheses = False
parentheses_flags = []
for l in raw_lines:
    if in_parentheses:
        parentheses_flags.append(True)
        if ')' in l:
            in_parentheses = False
    else:
        opens = l.count('(') + l.count('[')
        closes = l.count(')') + l.count(']')
        if opens > closes:
            in_parentheses = True
            parentheses_flags.append(True)
        elif l.startswith('(') or l.startswith('['):
            parentheses_flags.append(True)
        else:
            parentheses_flags.append(False)

def match_option(line, is_inside_note=False):
    if is_inside_note:
        return None
    m = re.match(r'^([A-Fa-f])\s*[\.\:\)]\s*(.*)$', line)
    if m:
        return m.group(1).upper(), m.group(2).strip()
    if line in ['A Tác động', 'A Chuyển hoá chất, lượng', 'A Chất']:
        return 'A', line[2:].strip()
    return None

opt_a_indices = []
for idx, l in enumerate(raw_lines):
    opt = match_option(l, parentheses_flags[idx])
    if opt and opt[0] == 'A':
        opt_a_indices.append(idx)

def is_answer_line(line):
    if not line:
        return False
    clean = re.sub(r'[\.\:\)]', '', line).strip()
    m = re.match(r'^([A-Fa-f]{1,5})(\s*\(.*|\s+.*)?$', line)
    if m:
        ans_letters = m.group(1).upper()
        if all(c in 'ABCDEF' for c in ans_letters):
            return True
    return False

def is_meta_or_note(line):
    if not line:
        return True
    if line == 'Error! Filename not specified.':
        return True
    if re.match(r'^(Chưa học|Bạn chưa học|Chọn \d+|Chưa học \(\d+\))', line, re.IGNORECASE):
        return True
    if line.startswith('(') or line.startswith('[') or line.startswith('->'):
        return True
    return False

typo_patterns = [
    (r'\bthực tiền\b', 'thực tiễn'),
    (r'\bmỗi liên hệ\b', 'mối liên hệ'),
    (r'\btrường phải\b', 'trường phái'),
    (r'\bchi xảy ra\b', 'chỉ xảy ra'),
    (r'\bchi có\b', 'chỉ có'),
    (r'\bchi là\b', 'chỉ là'),
    (r'\bchi tồn tại\b', 'chỉ tồn tại'),
    (r'\bthê giới\b', 'thế giới'),
    (r'\bgiối tự nhiên\b', 'giới tự nhiên'),
    (r'\bmất dẫn đi\b', 'mất dần đi'),
    (r'\bvũng chắc\b', 'vững chắc'),
    (r'\bvẽ sự phát triên\b', 'về sự phát triển'),
    (r'\bđễ có\b', 'để có'),
    (r'\blựa chon\b', 'lựa chọn'),
    (r'\bthê giới quan\b', 'thế giới quan'),
    (r'\bảnh hưỡng\b', 'ảnh hưởng'),
    (r'\bcùa\b', 'của'),
]

def clean_text(s):
    for p, r in typo_patterns:
        s = re.sub(p, r, s, flags=re.IGNORECASE)
    return s

questions_data = []
prev_q_text_lines = raw_lines[:opt_a_indices[0]]

for k in range(len(opt_a_indices)):
    a_idx = opt_a_indices[k]
    next_a_idx = opt_a_indices[k+1] if k+1 < len(opt_a_indices) else len(raw_lines)
    
    opts = {}
    curr = a_idx
    while curr < next_a_idx:
        opt = match_option(raw_lines[curr], parentheses_flags[curr])
        if opt:
            opts[opt[0]] = opt[1]
            curr += 1
        else:
            break
            
    gap = raw_lines[curr:next_a_idx]
    
    ans_line = None
    ans_idx_in_gap = -1
    for gi, gl in enumerate(gap):
        if is_answer_line(gl):
            ans_line = gl
            ans_idx_in_gap = gi
            break
            
    m_ans = re.match(r'^([A-Fa-f]{1,5})', ans_line)
    ans_letters = m_ans.group(1).upper() if m_ans else ''
    
    curr_gap_idx = ans_idx_in_gap + 1
    notes = []
    inline_note = ans_line[len(ans_letters):].strip()
    if inline_note:
        notes.append(inline_note)

    while curr_gap_idx < len(gap):
        gl = gap[curr_gap_idx]
        if parentheses_flags[curr + curr_gap_idx] or is_meta_or_note(gl):
            if gl and gl != 'Error! Filename not specified.':
                notes.append(gl)
            curr_gap_idx += 1
        else:
            break
            
    next_q_text_lines = gap[curr_gap_idx:]
    
    q_text = " ".join([l for l in prev_q_text_lines if l and not is_meta_or_note(l)])
    q_text = re.sub(r'\(NHUNG HOÀNG\)', '', q_text, flags=re.IGNORECASE)
    q_text = re.sub(r'\(073-356-8678\)', '', q_text)
    q_text = re.sub(r'<USER_REQUEST>', '', q_text)
    q_text = re.sub(r'Thêm 1 QUIZ môn MLN111: MLN111', '', q_text)
    q_text = q_text.strip()
    
    # Fix inline joined option if any
    if 'C' in opts and ' D. ' in opts['C']:
        c_val, d_val = opts['C'].split(' D. ', 1)
        opts['C'] = c_val.strip()
        opts['D'] = d_val.strip()

    # Clean typos
    q_text = clean_text(q_text)
    for opt_k in opts:
        opts[opt_k] = clean_text(opts[opt_k])

    questions_data.append({
        'id': k + 1,
        'text': q_text,
        'opts': opts,
        'ans': ans_letters,
        'notes': notes
    })
    
    prev_q_text_lines = next_q_text_lines

print(f"Constructed {len(questions_data)} questions.")

# Format as raw text string for quizParser
blocks = []
for q in questions_data:
    block_lines = [q['text']]
    for opt_k in sorted(q['opts'].keys()):
        block_lines.append(f"{opt_k}. {q['opts'][opt_k]}")
    ans_str = q['ans']
    if q['notes']:
        # include notes if helpful, or just the answer
        ans_str = f"{ans_str} {' '.join(q['notes'])}"
    block_lines.append(ans_str)
    blocks.append("\n".join(block_lines))

final_quiz_text = "\n\n".join(blocks)

with open('src/data/sampleQuizMLN111Full.ts', 'w', encoding='utf-8') as f:
    f.write('export const SAMPLE_QUIZ_MLN111_FULL = `\n')
    # Escape backticks and ${}
    escaped_text = final_quiz_text.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
    f.write(escaped_text)
    f.write('\n`;\n')

print(f"Wrote to src/data/sampleQuizMLN111Full.ts, size: {len(final_quiz_text)} chars.")
