import os
import re

translations_file = r"c:\Users\SHIWANSH YADAV\Downloads\farmex-main\farmex-main\frontend\src\i18n\translations.js"
pages_dir = r"c:\Users\SHIWANSH YADAV\Downloads\farmex-main\farmex-main\frontend\src\pages"

new_entries = {
    'Analyzing Image...': { 'hi': 'छवि का विश्लेषण...', 'mr': 'प्रतिमेचे विश्लेषण...' },
    'Analyzing plant image with AI...': { 'hi': 'AI के साथ पौधे की छवि का विश्लेषण...', 'mr': 'AI सह रोपाच्या प्रतिमेचे विश्लेषण...' },
    'Detected': { 'hi': 'पहचाना गया', 'mr': 'आढळले' },
    'Confidence': { 'hi': 'विश्वास', 'mr': 'विश्वासार्हता' },
    'Severity': { 'hi': 'तीव्रता', 'mr': 'तीव्रता' },
    'Treatment': { 'hi': 'उपचार', 'mr': 'उपचार' },
    'Prevention': { 'hi': 'रोकथाम', 'mr': 'प्रतिबंध' },
    'Supported crops in this model': { 'hi': 'इस मॉडल में समर्थित फसलें', 'mr': 'या मॉडेलमध्ये समर्थित पिके' },
    'Generating Plan...': { 'hi': 'योजना बनाई जा रही है...', 'mr': 'योजना तयार होत आहे...' },
    'Generate Irrigation Plan': { 'hi': 'सिंचाई योजना तैयार करें', 'mr': 'सिंचन योजना तयार करा' },
    'Irrigation Schedule': { 'hi': 'सिंचाई अनुसूची', 'mr': 'सिंचन वेळापत्रक' },
    'Creating optimal irrigation schedule...': { 'hi': 'इष्टतम सिंचाई अनुसूची बनाई जा रही है...', 'mr': 'योग्य सिंचन वेळापत्रक तयार होत आहे...' },
    'Irrigation days': { 'hi': 'सिंचाई के दिन', 'mr': 'सिंचनाचे दिवस' },
    'Average water': { 'hi': 'औसत पानी', 'mr': 'सरासरी पाणी' },
    'Typical time': { 'hi': 'सामान्य समय', 'mr': 'नेहमीची वेळ' },
    '7-day rainfall pressure': { 'hi': '7-दिवसीय वर्षा का दबाव', 'mr': '7 दिवसांचा पावसाचा जोर' },
    'ROI': { 'hi': 'निवेश पर लाभ (ROI)', 'mr': 'परतावा (ROI)' },
    'Analyzing your farm conditions...': { 'hi': 'आपके फार्म की स्थिति का विश्लेषण...', 'mr': 'शेताच्या परिस्थितीचे विश्लेषण...' },
    'Analyzing financial projections...': { 'hi': 'वित्तीय अनुमानों का विश्लेषण...', 'mr': 'आर्थिक अंदाजांचे विश्लेषण...' },
    'Enter location': { 'hi': 'स्थान दर्ज करें', 'mr': 'ठिकाण टाका' },
    'Calculate Profit': { 'hi': 'लाभ की गणना करें', 'mr': 'नफ्याची गणना करा' },
    'Total Expenses:': { 'hi': 'कुल खर्च:', 'mr': 'एकूण खर्च:' }
}

# Update translations.js
with open(translations_file, "r", encoding="utf-8") as f:
    text = f.read()

for key, entry in new_entries.items():
    if key not in text:
        # insert before };
        line = f"  '{key}': {{ hi: '{entry['hi']}', mr: '{entry['mr']}' }},"
        text = text.replace("};", line + "\n};")

with open(translations_file, "w", encoding="utf-8") as f:
    f.write(text)

# Update page files
def wrap_file(filename, mappings):
    path = os.path.join(pages_dir, filename)
    if not os.path.exists(path): return
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    original = content
    for target, replacement in mappings.items():
        content = content.replace(target, replacement)
    
    if content != original:
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {filename}")

wrap_file("DiseaseDetection.jsx", {
    "'Analyzing Image...'": "t('Analyzing Image...')",
    "'Detect Disease'": "t('Detect Disease')",
    "Analyzing plant image with AI...": "{t('Analyzing plant image with AI...')}",
    'label="Detected"': 'label={t("Detected")}',
    'label="Confidence"': 'label={t("Confidence")}',
    'label="Severity"': 'label={t("Severity")}',
    'title="Treatment"': 'title={t("Treatment")}',
    'title="Prevention"': 'title={t("Prevention")}',
    'title="Supported crops in this model"': 'title={t("Supported crops in this model")}'
})

wrap_file("Irrigation.jsx", {
    "Generating Plan...": "{t('Generating Plan...')}",
    "Generate Irrigation Plan": "{t('Generate Irrigation Plan')}",
    'h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-200 dark:text-gray-100">Irrigation Schedule</h2>': 'h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-200 dark:text-gray-100">{t(\'Irrigation Schedule\')}</h2>',
    "Creating optimal irrigation schedule...": "{t('Creating optimal irrigation schedule...')}",
    'label="Irrigation days"': 'label={t("Irrigation days")}',
    'label="Average water"': 'label={t("Average water")}',
    'label="Typical time"': 'label={t("Typical time")}',
    'title="7-day rainfall pressure"': 'title={t("7-day rainfall pressure")}'
})

wrap_file("Dashboard.jsx", {
    'label: "Location"': 'label: t("Location")',
    'label: "Enter location"': 'label: t("Enter location")',
    'label: "Crop Name"': 'label: t("Crop Name")',
    'label: "Enter crop name"': 'label: t("Enter crop name")'
})

print("Final cleanup done.")
