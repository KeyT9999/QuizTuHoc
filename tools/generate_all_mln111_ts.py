import json
import os

# Load parsed questions
data = json.load(open('mln111_parsed_180.json', encoding='utf-8'))

# Answer keys mapped to 1-based question numbers
ANSWERS_C1FE = {
    1: 'C', 2: 'A', 3: 'A', 4: 'D', 5: 'A', 6: 'B', 7: 'A', 8: 'B', 9: 'B', 10: 'A',
    11: 'D', 12: 'B', 13: 'A', 14: 'A', 15: 'A', 16: 'B', 17: 'B', 18: 'D', 19: 'A', 20: 'B',
    21: 'A', 22: 'A', 23: 'B', 24: 'A', 25: 'C', 26: 'C', 27: 'B', 28: 'B', 29: 'A', 30: 'A',
    31: 'D', 32: 'A', 33: 'D', 34: 'D', 35: 'C', 36: 'A', 37: 'A', 38: 'D', 39: 'C', 40: 'A',
    41: 'C', 42: 'D', 43: 'A', 44: 'A', 45: 'D', 46: 'D', 47: 'C', 48: 'D', 49: 'A', 50: 'A',
    51: 'D', 52: 'C', 53: 'A', 54: 'B', 55: 'B', 56: 'A', 57: 'C', 58: 'A', 59: 'A', 60: 'A'
}

ANSWERS_C2FE = {
    1: 'D', 2: 'B', 3: 'C', 4: 'A', 5: 'D', 6: 'C', 7: 'C', 8: 'B', 9: 'D', 10: 'A',
    11: 'D', 12: 'B', 13: 'C', 14: 'C', 15: 'B', 16: 'B', 17: 'B', 18: 'A', 19: 'A', 20: 'A',
    21: 'C', 22: 'B', 23: 'C', 24: 'B', 25: 'C', 26: 'B', 27: 'B', 28: 'A', 29: 'A', 30: 'D',
    31: 'A', 32: 'A', 33: 'A', 34: 'C', 35: 'B', 36: 'C', 37: 'A', 38: 'A', 39: 'A', 40: 'D',
    41: 'D', 42: 'C', 43: 'C', 44: 'C', 45: 'C', 46: 'C', 47: 'C', 48: 'C', 49: 'A', 50: 'A',
    51: 'D', 52: 'A', 53: 'A', 54: 'C', 55: 'C', 56: 'D', 57: 'A', 58: 'D', 59: 'D', 60: 'B'
}

ANSWERS_RE = {
    1: 'A', 2: 'C', 3: 'A', 4: 'B', 5: 'B', 6: 'B', 7: 'A', 8: 'B', 9: 'A', 10: 'A',
    11: 'A', 12: 'B', 13: 'C', 14: 'B', 15: 'C', 16: 'C', 17: 'A', 18: 'A', 19: 'C', 20: 'D',
    21: 'D', 22: 'A', 23: 'D', 24: 'C', 25: 'A', 26: 'A', 27: 'A', 28: 'A', 29: 'A', 30: 'A',
    31: 'D', 32: 'A', 33: 'D', 34: 'C', 35: 'B', 36: 'A', 37: 'D', 38: 'D', 39: 'B', 40: 'C',
    41: 'A', 42: 'A', 43: 'A', 44: 'D', 45: 'B', 46: 'C', 47: 'A', 48: 'B', 49: 'A', 50: 'A',
    51: 'C', 52: 'A', 53: 'A', 54: 'A', 55: 'C', 56: 'A', 57: 'B', 58: 'B', 59: 'D', 60: 'A'
}

# Special text fixes for OCR typos
TEXT_FIXES = {
    ('C1FE', 39): {
        'text': 'Quan hệ giữa người với người trong quá trình sản xuất được gọi là gì?'
    },
    ('C2FE', 44): {
        'text': 'Theo quan niệm duy vật biện chứng về lịch sử thì những quan hệ sản xuất cũ được thay thế bằng quan hệ sản xuất mới, phù hợp trình độ phát triển của lực lượng sản xuất đã phát triển nhờ điều gì?'
    },
    ('C2FE', 45): {
        'text': 'Theo quan điểm duy vật lịch sử, phạm trù nào sau đây ra đời là kết quả của tình trạng những mâu thuẫn giai cấp không thể điều hòa được?'
    }
}

def clean_vn(text):
    # Fix common OCR typos in Vietnamese
    replacements = [
        ('thtic', 'thức'), ('thuic', 'thức'), ('thti', 'thứ'), ('thui', 'thứ'),
        ('tuiong', 'tương'), ('tuidng', 'tương'), ('duioc', 'được'), ('duidc', 'được'),
        ('ngudi', 'người'), ('nguioi', 'người'), ('sd', 'sở'), ('cd', 'cơ'),
        ('thdi', 'thời'), ('doi vdi', 'đối với'), ('vdi', 'với'), ('vti', 'vũ'),
        ('nhui', 'như'), ('nhuing', 'những'), ('chtia', 'chứa'), ('dung', 'đúng'),
        ('duing', 'đúng'), ('trudc', 'trước'), ('buidc', 'bước'), ('tui', 'từ'),
        ('luic', 'lực'), ('sti', 'sự'), ('chuing', 'chứng'), ('dudi', 'dưới'),
        ('phuiong', 'phương'), ('gidi', 'giới'), ('hieu', 'hiểu'), ('khang dinh', 'khẳng định'),
        ('ton tai', 'tồn tại'), ('ly luan', 'lý luận'), ('thuc tien', 'thực tiễn'),
        ('bien chuing', 'biện chứng'), ('bien chung', 'biện chứng'),
        ('sieu hinh', 'siêu hình'), ('tui duy', 'tư duy'), ('nguon goc', 'nguồn gốc'),
        ('xa hoi', 'xã hội'), ('giai cap', 'giai cấp'), ('vat chat', 'vật chất'),
        ('y thuc', 'ý thức'), ('y thuic', 'ý thức'), ('phat trien', 'phát triển'),
        ('van dong', 'vận động'), ('nguyen ly', 'nguyên lý'), ('quy luat', 'quy luật')
    ]
    res = text
    for o, n in replacements:
        # Case-insensitive safe replace
        import re
        res = re.sub(re.escape(o), n, res, flags=re.IGNORECASE)
    return res

def generate_set_ts(set_key, const_name, answers_dict):
    items = data[set_key]
    blocks = []
    
    for it in items:
        qnum = it['qNum']
        qtext = it['text']
        opts = it['options']
        
        if (set_key, qnum) in TEXT_FIXES:
            qtext = TEXT_FIXES[(set_key, qnum)]['text']
            
        ans = answers_dict[qnum]
        
        block = f"{qtext}\nA. {opts['A']}\nB. {opts['B']}\nC. {opts['C']}\nD. {opts['D']}\n{ans}"
        blocks.append(block)
        
    joined = "\n\n".join(blocks)
    
    ts_content = f"export const {const_name} = `\n{joined}\n`;\n"
    return ts_content

# Generate C1FE
c1fe_ts = generate_set_ts('C1FE', 'SAMPLE_QUIZ_MLN111_SU26_C1FE', ANSWERS_C1FE)
with open('src/data/sampleQuizMLN111SU26C1FE.ts', 'w', encoding='utf-8') as f:
    f.write(c1fe_ts)
print('Generated src/data/sampleQuizMLN111SU26C1FE.ts')

# Generate C2FE
c2fe_ts = generate_set_ts('C2FE', 'SAMPLE_QUIZ_MLN111_SU26_C2FE', ANSWERS_C2FE)
with open('src/data/sampleQuizMLN111SU26C2FE.ts', 'w', encoding='utf-8') as f:
    f.write(c2fe_ts)
print('Generated src/data/sampleQuizMLN111SU26C2FE.ts')

# Generate RE
re_ts = generate_set_ts('RE', 'SAMPLE_QUIZ_MLN111_SU26_RE', ANSWERS_RE)
with open('src/data/sampleQuizMLN111SU26RE.ts', 'w', encoding='utf-8') as f:
    f.write(re_ts)
print('Generated src/data/sampleQuizMLN111SU26RE.ts')
