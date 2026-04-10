import os, re
file_path = r'c:\Users\SHIWANSH YADAV\Downloads\farmex-main\farmex-main\backend\server.py'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = [
    (r'(\"crop_recommendation\",\s*\{(.*?)\"date\": current_date,)(\s*\})', r'\1\n                "language": request.language,\3'),
    (r'(\"irrigation_plan\",\s*\{(.*?)\"current_date\": current_date,)(\s*\})', r'\1\n                "language": request.language,\3'),
    (r'(\"market_prediction\",\s*\{(.*?)\"current_month\": current_month,)(\s*\})', r'\1\n                "language": request.language,\3'),
    (r'(\"farming_calendar\",\s*\{(.*?)\"area\": request.area,)(\s*\})', r'\1\n                "language": request.language,\3'),
    (r'(\"risk_analysis\",\s*\{(.*?)\"current_date\": current_date,)(\s*\})', r'\1\n                "language": request.language,\3'),
    (r'(\"expense_analysis\",\s*\{(.*?)\"expected_yield\": request.expected_yield,)(\s*\})', r'\1\n                "language": request.language,\3')
]

for pattern, repl in replacements:
    content = re.sub(pattern, repl, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
