import os

file_path = "backend/server.py"
with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

new_func = [
    'def detect_plant_disease_from_image(contents: bytes, crop_name: str = "", language: str = "en") -> Dict[str, Any]:\n',
    '    """\n',
    '    AI-powered plant disease detection from image using Groq Vision API.\n',
    '    """\n',
    '    try:\n',
    '        import base64\n',
    '        import json\n',
    '        groq_key = os.getenv("GROQ_API_KEY", "").strip()\n',
    '        if not groq_key:\n',
    '             raise ValueError("GROQ_API_KEY missing.")\n',
    '        base64_image = base64.b64encode(contents).decode("utf-8")\n',
    '        url = "https://api.groq.com/openai/v1/chat/completions"\n',
    '        headers = {"Authorization": f"Bearer {groq_key}"}\n',
    '        prompt = f"Identify disease in {crop_name}. Return JSON with fields: disease_name, confidence, treatment, prevention, severity."\n',
    '        payload = {\n',
    '            "model": "llama-3.2-11b-vision-preview",\n',
    '            "messages": [{"role": "user", "content": [\n',
    '                {"type": "text", "text": prompt},\n',
    '                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}\n',
    '            ]}],\n',
    '            "response_format": {"type": "json_object"}\n',
    '        }\n',
    '        logger.info(f"Analyzing {crop_name} with Groq Vision...")\n',
    '        response = requests.post(url, headers=headers, json=payload, timeout=25)\n',
    '        response.raise_for_status()\n',
    '        parsed = json.loads(response.json()["choices"][0]["message"]["content"])\n',
    '        return {\n',
    '            "disease_name": translate_backend_text(parsed.get("disease_name", "Unknown"), language),\n',
    '            "confidence": parsed.get("confidence", "95%"),\n',
    '            "treatment": translate_backend_text(parsed.get("treatment", "Consult an expert."), language),\n',
    '            "prevention": translate_backend_text(parsed.get("prevention", "Maintain health."), language),\n',
    '            "severity": translate_backend_text(parsed.get("severity", "Medium"), language),\n',
    '            "source": "groq-vision-ai"\n',
    '        }\n',
    '    except Exception as exc:\n',
    '        logger.error(f"Detection error: {exc}")\n',
    '        return {\n',
    '            "disease_name": translate_backend_text("Detection system unavailable", language),\n',
    '            "confidence": "0%",\n',
    '            "treatment": translate_backend_text(f"Engine fail: {str(exc)}", language),\n',
    '            "prevention": translate_backend_text("Check your GROQ_API_KEY in Render dashboard.", language),\n',
    '            "severity": translate_backend_text("Unknown", language),\n',
    '            "source": "groq-error"\n',
    '        }\n'
]

start_line = -1
end_line = -1
for i, line in enumerate(lines):
    if "def detect_plant_disease_from_image" in line:
        start_line = i
    if "def get_weather_data" in line:
        end_line = i
        break

if start_line != -1 and end_line != -1:
    new_lines = lines[:start_line] + new_func + lines[end_line:]
    with open(file_path, "w", encoding="utf-8") as f:
        f.writelines(new_lines)
    print("Successfully rewritten!")
else:
    print(f"Failed to find indices: {start_line}, {end_line}")
