import os
import re
import glob

# Get all jsx files in src/pages
pages_dir = r"C:\Users\SHIWANSH YADAV\Downloads\farmex-main\farmex-main\frontend\src\pages"
files = glob.glob(os.path.join(pages_dir, "*.jsx"))

replacements = [
    # Page background gradients
    (r'(bg-gradient-to-br from-\w+-50 via-white to-\w+-50)(?! dark:from)', r'\1 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'),
    
    # Text colors
    (r'text-gray-800(?! dark:text-gray-100)', r'text-gray-800 dark:text-gray-100'),
    (r'text-gray-700(?! dark:text-gray-200)', r'text-gray-700 dark:text-gray-200'),
    (r'text-gray-600(?! dark:text-gray-300)', r'text-gray-600 dark:text-gray-300'),
    
    # Backgrounds and borders
    (r'bg-white(?! dark:bg-slate-900)', r'bg-white dark:bg-slate-900'),
    (r'border-gray-200(?! dark:border-slate-700)', r'border-gray-200 dark:border-slate-700'),
    (r'border-gray-300(?! dark:border-slate-600)', r'border-gray-300 dark:border-slate-600'),
    
    # Some specific blue/green/amber boxes
    (r'bg-green-50(?! dark:bg-green-900/20)', r'bg-green-50 dark:bg-green-900/20'),
    (r'border-green-200(?! dark:border-green-800/50)', r'border-green-200 dark:border-green-800/50'),
    
    (r'bg-blue-50(?! dark:bg-blue-900/20)', r'bg-blue-50 dark:bg-blue-900/20'),
    (r'border-blue-200(?! dark:border-blue-800/50)', r'border-blue-200 dark:border-blue-800/50'),
    
    (r'bg-amber-50(?! dark:bg-amber-900/20)', r'bg-amber-50 dark:bg-amber-900/20'),
    (r'border-amber-200(?! dark:border-amber-800/50)', r'border-amber-200 dark:border-amber-800/50'),
    
    (r'bg-red-50(?! dark:bg-red-900/20)', r'bg-red-50 dark:bg-red-900/20'),
    (r'border-red-200(?! dark:border-red-800/50)', r'border-red-200 dark:border-red-800/50'),
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
