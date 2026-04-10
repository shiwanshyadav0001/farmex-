import os
import re
import glob

pages_dir = r"c:\Users\SHIWANSH YADAV\Downloads\farmex-main\farmex-main\frontend\src\pages"
files = glob.glob(os.path.join(pages_dir, "*.jsx"))

dark_mode_replacements = [
    (r'bg-white(?! dark:bg-slate-900)', r'bg-white dark:bg-slate-900'),
    (r'bg-slate-50(?! dark:bg-slate-800)', r'bg-slate-50 dark:bg-slate-800'),
    (r'bg-gray-50(?! dark:bg-gray-800)', r'bg-gray-50 dark:bg-gray-800'),
    (r'bg-green-50(?! dark:bg-green-900\/20)', r'bg-green-50 dark:bg-green-900/20'),
    (r'bg-emerald-50(?! dark:bg-emerald-900\/20)', r'bg-emerald-50 dark:bg-emerald-900/20'),
    (r'bg-blue-50(?! dark:bg-blue-900\/20)', r'bg-blue-50 dark:bg-blue-900/20'),
    (r'text-slate-900(?! dark:text-slate-50)', r'text-slate-900 dark:text-slate-50'),
    (r'text-slate-800(?! dark:text-slate-200)', r'text-slate-800 dark:text-slate-200'),
    (r'text-gray-900(?! dark:text-gray-50)', r'text-gray-900 dark:text-gray-50'),
    (r'text-gray-800(?! dark:text-gray-200)', r'text-gray-800 dark:text-gray-200'),
    (r'text-gray-700(?! dark:text-gray-300)', r'text-gray-700 dark:text-gray-300'),
    (r'text-slate-700(?! dark:text-slate-300)', r'text-slate-700 dark:text-slate-300'),
    (r'text-slate-500(?! dark:text-slate-400)', r'text-slate-500 dark:text-slate-400'),
    (r'text-gray-600(?! dark:text-gray-400)', r'text-gray-600 dark:text-gray-400'),
    (r'border-gray-200(?! dark:border-slate-700)', r'border-gray-200 dark:border-slate-700'),
    (r'border-slate-200(?! dark:border-slate-700)', r'border-slate-200 dark:border-slate-700'),
    (r'border-green-200(?! dark:border-green-800\/50)', r'border-green-200 dark:border-green-800/50'),
    (r'border-emerald-200(?! dark:border-emerald-800\/50)', r'border-emerald-200 dark:border-emerald-800/50'),
    (r'border-blue-100(?! dark:border-blue-800\/50)', r'border-blue-100 dark:border-blue-800/50'),
    (r'border-blue-200(?! dark:border-blue-800\/50)', r'border-blue-200 dark:border-blue-800/50'),
]

endpoints = [
    '/crop/recommend',
    '/market/predict',
    '/irrigation/plan',
    '/calendar/generate',
    '/risk/analyze',
    '/expense/calculate'
]

for file_path in files:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    original_content = content
    
    # Dark Mode
    for pattern, repl in dark_mode_replacements:
        content = re.sub(pattern, repl, content)

    # Adding language to useTranslation hook
    if "useTranslation()" in content:
        match = re.search(r'const\s+\{([^}]+)\}\s*=\s*useTranslation\(\)', content)
        if match:
            vars_str = match.group(1)
            if 'language' not in vars_str:
                new_vars = vars_str.strip() + ', language'
                content = content.replace(match.group(0), f'const {{ {new_vars} }} = useTranslation()')

    # Manual replacements for axios
    content = content.replace('axios.post(`${API}/crop/recommend`, formData)', 'axios.post(`${API}/crop/recommend`, { ...formData, language })')
    content = content.replace('axios.post(`${API}/market/predict`, { crop_name: crop, location })', 'axios.post(`${API}/market/predict`, { crop_name: crop, location, language })')
    content = content.replace('axios.post(`${API}/irrigation/plan`, { farm_id: farmId, crop_type: cropType })', 'axios.post(`${API}/irrigation/plan`, { farm_id: farmId, crop_type: cropType, language })')
    content = content.replace('axios.post(`${API}/calendar/generate`, formData)', 'axios.post(`${API}/calendar/generate`, { ...formData, language })')
    content = content.replace('axios.post(`${API}/risk/analyze`, { farm_id: farmId })', 'axios.post(`${API}/risk/analyze`, { farm_id: farmId, language })')
    content = content.replace('axios.post(`${API}/expense/calculate`, {\n        farm_id: farmId,\n        crop_name: cropName,\n        ...formData\n      })', 'axios.post(`${API}/expense/calculate`, {\n        farm_id: farmId,\n        crop_name: cropName,\n        ...formData,\n        language\n      })')

    # SoilInsights
    content = content.replace('axios.get(`${API}/soil/insights`, {\n        params: { location }\n      })', 'axios.get(`${API}/soil/insights`, {\n        params: { location, language }\n      })')

    if content != original_content:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {os.path.basename(file_path)}")

print("Done.")
