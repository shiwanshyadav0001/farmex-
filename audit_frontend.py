import os
import re

def audit_frontend():
    pages_dir = r"c:\Users\SHIWANSH YADAV\Downloads\farmex-main\farmex-main\frontend\src\pages"
    results = {}
    
    # Props to check
    props_to_check = ['title', 'subtitle', 'description', 'hint', 'label', 'placeholder']
    
    for filename in os.listdir(pages_dir):
        if not filename.endswith('.jsx'):
            continue
            
        path = os.path.join(pages_dir, filename)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # Check props: prop="value" (not wrapped in t())
            for prop in props_to_check:
                matches = re.findall(rf'{prop}=\"([^\"]+)\"', content)
                for m in matches:
                    if m not in results: results[m] = []
                    results[m].append(filename)
            
            # Check text content in common tags: <p>, <div>, <span>, <h3> etc.
            # This is harder to regex perfectly but we can get a good estimate
            text_matches = re.findall(r'>([^<{}>]+)<', content)
            for m in text_matches:
                m = m.strip()
                if m and not m.startswith('{') and len(m) > 1:
                    # Ignore common React patterns or icons
                    if m not in results: results[m] = []
                    results[m].append(filename)

    print("--- FRONTEND AUDIT RESULTS ---")
    for s, files in sorted(results.items()):
        print(f"{s} | {list(set(files))}")

if __name__ == "__main__":
    audit_frontend()
