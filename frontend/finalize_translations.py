import os
import re

translations_file = r"c:\Users\SHIWANSH YADAV\Downloads\farmex-main\farmex-main\frontend\src\i18n\translations.js"
expense_file = r"c:\Users\SHIWANSH YADAV\Downloads\farmex-main\farmex-main\frontend\src\pages\ExpenseCalculator.jsx"

new_entries = """
  'Farms': { hi: 'फार्म', mr: 'शेते' },
  'Coverage': { hi: 'कवरेज', mr: 'व्याप्ती' },
  'Produce': { hi: 'उत्पादन', mr: 'उत्पन्न' },
  'Total Expenses:': { hi: 'कुल खर्च:', mr: 'एकूण खर्च:' },
  'Calculating...': { hi: 'गणना की जा रही है...', mr: 'गणना होत आहे...' },
  'Calculate Profit': { hi: 'लाभ की गणना करें', mr: 'नफ्याची गणना करा' },
  'Analyzing financial projections...': { hi: 'वित्तीय अनुमानों का विश्लेषण...', mr: 'आर्थिक अंदाजांचे विश्लेषण...' },
  'Total expenses': { hi: 'कुल खर्च', mr: 'एकूण खर्च' },
  'Price per quintal': { hi: 'प्रति क्विंटल मूल्य', mr: 'प्रति क्विंटल भाव' },
  'Total revenue': { hi: 'कुल राजस्व', mr: 'एकूण महसूल' },
  'Profit': { hi: 'मुनाफा', mr: 'नफा' },
  'Profit margin': { hi: 'लाभ मार्जिन', mr: 'नफा मार्जिन' },
  'ROI': { hi: 'ROI', mr: 'परतावा' },
  'Active Farms': { hi: 'सक्रिय फार्म', mr: 'सक्रिय शेते' },
  'Crop Types': { hi: 'फसल प्रकार', mr: 'पिकांचे प्रकार' },
  'AI Insights': { hi: 'एआई जानकारी', mr: 'एआय माहिती' },
  'Uptime': { hi: 'उपलब्धता', mr: 'अपटाइम' },
"""

# Update translations.js
with open(translations_file, "r", encoding="utf-8") as f:
    content = f.read()

marker = "  'Calculate': { hi: 'गणना करें', mr: 'गणना करा' }"
if marker in content:
    content = content.replace(marker, marker + ",\n" + new_entries.strip())
else:
    content = content.replace("};", new_entries.strip() + "\n};")

with open(translations_file, "w", encoding="utf-8") as f:
    f.write(content)

# Update ExpenseCalculator.jsx
with open(expense_file, "r", encoding="utf-8") as f:
    expense_content = f.read()

expense_content = expense_content.replace("Total Expenses:", "{t('Total Expenses:')}")
expense_content = expense_content.replace("'Calculating...'", "t('Calculating...')")
expense_content = expense_content.replace("'Calculate Profit'", "t('Calculate Profit')")
expense_content = expense_content.replace("Analyzing financial projections...", "{t('Analyzing financial projections...')}")
expense_content = expense_content.replace('label="Total expenses"', 'label={t("Total expenses")}')
expense_content = expense_content.replace('label="Price per quintal"', 'label={t("Price per quintal")}')
expense_content = expense_content.replace('label="Total revenue"', 'label={t("Total revenue")}')
expense_content = expense_content.replace('label="Profit"', 'label={t("Profit")}')
expense_content = expense_content.replace('label="Profit margin"', 'label={t("Profit margin")}')
expense_content = expense_content.replace('label="ROI"', 'label={t("ROI")}')

with open(expense_file, "w", encoding="utf-8") as f:
    f.write(expense_content)

print("Updated translations and ExpenseCalculator.")
