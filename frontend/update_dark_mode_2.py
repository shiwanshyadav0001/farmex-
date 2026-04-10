import os
import re
import glob

# Get all jsx files in src/pages
pages_dir = r"C:\Users\SHIWANSH YADAV\Downloads\farmex-main\farmex-main\frontend\src\pages"
files = glob.glob(os.path.join(pages_dir, "*.jsx"))

replacements = [
    (r'text-green-700(?! dark:text-green-400)', r'text-green-700 dark:text-green-400'),
    (r'text-blue-700(?! dark:text-blue-400)', r'text-blue-700 dark:text-blue-400'),
    (r'text-amber-700(?! dark:text-amber-400)', r'text-amber-700 dark:text-amber-400'),
    (r'text-orange-700(?! dark:text-orange-400)', r'text-orange-700 dark:text-orange-400'),
    (r'text-cyan-700(?! dark:text-cyan-400)', r'text-cyan-700 dark:text-cyan-400'),
    (r'text-indigo-700(?! dark:text-indigo-400)', r'text-indigo-700 dark:text-indigo-400'),
    (r'text-purple-700(?! dark:text-purple-400)', r'text-purple-700 dark:text-purple-400'),
    (r'text-pink-700(?! dark:text-pink-400)', r'text-pink-700 dark:text-pink-400'),
    (r'text-emerald-700(?! dark:text-emerald-400)', r'text-emerald-700 dark:text-emerald-400'),
    (r'text-yellow-700(?! dark:text-yellow-400)', r'text-yellow-700 dark:text-yellow-400'),

    (r'bg-orange-50(?! dark:bg-orange-900/20)', r'bg-orange-50 dark:bg-orange-900/20'),
    (r'border-orange-200(?! dark:border-orange-800/50)', r'border-orange-200 dark:border-orange-800/50'),
    
    (r'bg-cyan-50(?! dark:bg-cyan-900/20)', r'bg-cyan-50 dark:bg-cyan-900/20'),
    (r'border-cyan-200(?! dark:border-cyan-800/50)', r'border-cyan-200 dark:border-cyan-800/50'),

    (r'bg-purple-50(?! dark:bg-purple-900/20)', r'bg-purple-50 dark:bg-purple-900/20'),
    (r'border-purple-200(?! dark:border-purple-800/50)', r'border-purple-200 dark:border-purple-800/50'),

    (r'bg-indigo-50(?! dark:bg-indigo-900/20)', r'bg-indigo-50 dark:bg-indigo-900/20'),
    (r'border-indigo-200(?! dark:border-indigo-800/50)', r'border-indigo-200 dark:border-indigo-800/50'),

    (r'bg-pink-50(?! dark:bg-pink-900/20)', r'bg-pink-50 dark:bg-pink-900/20'),
    (r'border-pink-200(?! dark:border-pink-800/50)', r'border-pink-200 dark:border-pink-800/50'),

    (r'bg-yellow-50(?! dark:bg-yellow-900/20)', r'bg-yellow-50 dark:bg-yellow-900/20'),
    (r'border-yellow-200(?! dark:border-yellow-800/50)', r'border-yellow-200 dark:border-yellow-800/50'),

    (r'bg-emerald-50(?! dark:bg-emerald-900/20)', r'bg-emerald-50 dark:bg-emerald-900/20'),
    (r'border-emerald-200(?! dark:border-emerald-800/50)', r'border-emerald-200 dark:border-emerald-800/50'),
]

for file_path in files:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    original_content = content
    for pattern, repl in replacements:
        content = re.sub(pattern, repl, content)

    if content != original_content:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {os.path.basename(file_path)}")

print("Done.")
