import os

translations_file = r"c:\Users\SHIWANSH YADAV\Downloads\farmex-main\farmex-main\frontend\src\i18n\translations.js"

new_entries = {
    'Soil Insights': { 'hi': 'मिट्टी की जानकारी', 'mr': 'मातीची माहिती' },
    'Crop Distribution': { 'hi': 'फसल वितरण', 'mr': 'पीक वितरण' },
    'Acreage Analysis': { 'hi': 'क्षेत्रफल विश्लेषण', 'mr': 'क्षेत्रफळ विश्लेषण' },
    'Acres': { 'hi': 'एकड़', 'mr': 'एकर' },
    'Farms': { 'hi': 'फार्म', 'mr': 'शेते' },
    'Details': { 'hi': 'विवरण', 'mr': 'तपशील' },
    'Status': { 'hi': 'स्थिति', 'mr': 'स्थिती' },
    'Produce': { 'hi': 'उत्पाद', 'mr': 'उत्पादन' },
    'Total representation across your holdings.': { 'hi': 'आपकी कुल जोत में कुल प्रतिनिधित्व।', 'mr': 'तुमच्या एकूण जमिनीतील एकूण प्रतिनिधित्व.' },
    'Coverage': { 'hi': 'कवरेज', 'mr': 'व्याप्ती' },
    'Move cursor over sectors for deep-dive analysis.': { 'hi': 'गहन विश्लेषण के लिए सेक्टरों पर कर्सर घुमाएँ।', 'mr': 'सखोल विश्लेषणासाठी क्षेत्रांवर कर्सर फिरवा.' },
    'Inspecting farm land area and yields.': { 'hi': 'कृषि भूमि क्षेत्र और उपज का निरीक्षण।', 'mr': 'शेती जमीन क्षेत्र आणि उत्पन्नाची पाहणी.' },
    'Agricultural OS Ecosystem': { 'hi': 'कृषि ओएस पारिस्थितिकी तंत्र', 'mr': 'कृषी ओएस इकोसिस्टम' },
    'A cinematic suite of tools designed to maximize farm yield and minimize operation risks through deep tech integration.': { 'hi': 'गहन तकनीक एकीकरण के माध्यम से कृषि उपज को अधिकतम करने और परिचालन जोखिमों को कम करने के लिए डिज़ाइन किया गया उपकरणों का एक सिनेमाई सुइट।', 'mr': 'सखोल तंत्रज्ञान एकत्रीकरणाद्वारे शेतीचे उत्पन्न वाढवण्यासाठी आणि कामकाजातील जोखीम कमी करण्यासाठी डिझाइन केलेले साधनांचा एक संच.' },
    'Explore Module': { 'hi': 'मॉड्यूल देखें', 'mr': 'मॉड्यूल पहा' }
}

with open(translations_file, "r", encoding="utf-8") as f:
    text = f.read()

for key, entry in new_entries.items():
    if f"'{key}'" not in text and f'"{key}"' not in text:
        line = f"  '{key}': {{ hi: '{entry['hi']}', mr: '{entry['mr']}' }},"
        text = text.replace("};", line + "\n};")

with open(translations_file, "w", encoding="utf-8") as f:
    f.write(text)

print("Updated dashboard translations.")
