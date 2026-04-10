import re

translations_path = r"c:\Users\SHIWANSH YADAV\Downloads\farmex-main\farmex-main\frontend\src\i18n\translations.js"

with open(translations_path, 'r', encoding='utf-8') as f:
    content = f.read()

new_phrases = {
    "Failed to calculate expenses. Please try again.": {"hi": "खर्चों की गणना करने में विफल। कृपया पुन: प्रयास करें।", "mr": "खर्चाची गणना करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा."},
    "Seeds": {"hi": "बीज", "mr": "बियाणे"},
    "Fertilizer": {"hi": "उर्वरक", "mr": "खते"},
    "Pesticides": {"hi": "कीटनाशक", "mr": "कीटकनाशके"},
    "Labor": {"hi": "श्रम", "mr": "मजुरी"},
    "Irrigation": {"hi": "सिंचाई", "mr": "सिंचन"},
    "Other": {"hi": "अन्य", "mr": "इतर"},
    "Seed Cost": {"hi": "बीज की लागत", "mr": "बियाणे खर्च"},
    "Fertilizer Cost": {"hi": "उर्वरक की लागत", "mr": "खतांचा खर्च"},
    "Pesticide Cost": {"hi": "कीटनाशक की लागत", "mr": "कीटकनाशकांचा खर्च"},
    "Labor Cost": {"hi": "श्रम लागत", "mr": "मजुरी खर्च"},
    "Irrigation Cost": {"hi": "सिंचाई की लागत", "mr": "सिंचन खर्च"},
    "Other Costs": {"hi": "अन्य लागत", "mr": "इतर खर्च"},
    "Analyzing financial projections...": {"hi": "वित्तीय अनुमानों का विश्लेषण किया जा रहा है...", "mr": "आर्थिक अंदाजांचे विश्लेषण सुरू आहे..."},
    "Financial projection complete": {"hi": "वित्तीय अनुमान पूरा हुआ", "mr": "आर्थिक अंदाज पूर्ण झाला"},
    "Same expense inputs now return the same analysis, so your profit planning no longer shifts between clicks.": {"hi": "समान व्यय इनपुट अब वही विश्लेषण लौटाते हैं, इसलिए आपकी लाभ योजना अब क्लिक के बीच नहीं बदलती है।", "mr": "सारखाच खर्च प्रविष्ट केल्यावर आता तोच निकाल मिळतो, ज्यामुळे तुमचे नफा नियोजन स्थिर राहते."},
    "ROI signal generated": {"hi": "ROI संकेत जनरेट हुआ", "mr": "ROI सिग्नल तयार झाला"},
    "Total expenses": {"hi": "कुल खर्च", "mr": "एकूण खर्च"},
    "Cost stack": {"hi": "लागत स्टैक", "mr": "खर्चाचा तपशील"},
    "Your live input costs are shown as a real breakdown instead of disappearing behind the result box.": {"hi": "आपकी लाइव इनपुट लागत सामान्य टेक्स्ट के बजाय एक वास्तविक ब्रेकडाउन के रूप में दिखाई जाती है।", "mr": "तुमचा प्रविष्ट केलेला खर्च साध्या मजकुराऐजी वास्तविक विभागणी म्हणून दाखवला जातो."},
    "Break-even point": {"hi": "ब्रेक-ईवन पॉइंट", "mr": "ब्रेक-इव्हन पॉइंट"},
    "Recommendations": {"hi": "सिफारिशें", "mr": "शिफारसी"},
    "Turn costs into a profit view": {"hi": "लागत को लाभ दृश्य में बदलें", "mr": "खर्चाला नफा दृष्टिकोनात बदला"},
    "Enter expenses and expected yield to see revenue, margin, ROI, break-even, and action recommendations in a clearer finance layout.": {"hi": "राजस्व, मार्जिन, ROI, ब्रेक-ईवन और स्पष्ट वित्त लेआउट में कार्रवाई की सिफारिशें देखने के लिए खर्च और अपेक्षित उपज दर्ज करें।", "mr": "महसूल, मार्जिन, ROI, ब्रेक-इव्हन आणि स्पष्ट वित्त लेआउटमध्ये कृती शिफारसी पाहण्यासाठी खर्च आणि अपेक्षित उत्पन्न प्रविष्ट करा."},
}

def update_map(map_name, new_data):
    global content
    pattern = rf"const {map_name} = \{{(.*?)\}};"
    match = re.search(pattern, content, re.DOTALL)
    if not match: return
    
    entries_str = match.group(1)
    existing_entries = {}
    
    for line in entries_str.strip().split('\n'):
        line = line.strip()
        if not line: continue
        parts = line.split(':', 1)
        if len(parts) == 2:
            key = parts[0].strip().strip("'\"")
            val = parts[1].strip().rstrip(',')
            existing_entries[key] = val
            
    for key, trans in new_data.items():
        hi = trans['hi'].replace("'", "\\'")
        mr = trans['mr'].replace("'", "\\'")
        existing_entries[key] = f"{{ hi: '{hi}', mr: '{mr}' }}"
        
    lines = [f"  '{k}': {v}," for k, v in sorted(existing_entries.items())]
    new_map = f"const {map_name} = {{\n" + "\n".join(lines) + "\n};"
    content = re.sub(pattern, new_map, content, flags=re.DOTALL)

update_map("phraseMap", new_phrases)

with open(translations_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated successfully.")
