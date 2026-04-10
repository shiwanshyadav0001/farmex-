from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form, BackgroundTasks
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import requests
import base64
from openai import AsyncOpenAI
import json
import io
import hashlib
import time

import smtplib
from email.message import EmailMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env', override=True)

# MongoDB connection
mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=1500)
db = client[os.getenv("DB_NAME", "farmex")]

# API Keys
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
HUGGINGFACE_API_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN", os.getenv("HF_TOKEN", "")).strip()
PLANT_DISEASE_MODEL = os.getenv(
    "PLANT_DISEASE_MODEL",
    "linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification",
).strip()
OPENWEATHERMAP_API_KEY = os.getenv("OPENWEATHERMAP_API_KEY", "")
SMTP_EMAIL = os.getenv("SMTP_EMAIL", "").strip()
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "").strip()

# Create the main app
app = FastAPI(title="Farmex - AI-Powered Agricultural Platform")
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
MEMORY_STORE: Dict[str, List[Dict[str, Any]]] = {
    "farms": [],
    "crop_recommendations": [],
    "irrigation_schedules": [],
    "disease_detections": [],
    "price_predictions": [],
    "soil_insights": [],
    "farming_calendars": [],
    "risk_analyses": [],
    "expenses": [],
}

DATA_FILE = ROOT_DIR / "data.json"

def load_memory_store():
    global MEMORY_STORE
    if DATA_FILE.exists():
        try:
            with open(DATA_FILE, "r") as f:
                loaded_data = json.load(f)
                for key in MEMORY_STORE:
                    if key in loaded_data:
                        MEMORY_STORE[key] = loaded_data[key]
            logger.info("Loaded MEMORY_STORE from disk.")
        except Exception as e:
            logger.error(f"Failed to load MEMORY_STORE from disk: {e}")

def save_memory_store():
    try:
        serializable_store = {}
        for key, items in MEMORY_STORE.items():
            serializable_store[key] = []
            for item in items:
                serializable_item = {}
                for k, v in item.items():
                    if isinstance(v, (datetime, timezone)):
                        serializable_item[k] = v.isoformat()
                    else:
                        serializable_item[k] = v
                serializable_store[key].append(serializable_item)
        
        with open(DATA_FILE, "w") as f:
            json.dump(serializable_store, f, indent=2)
        logger.info("Saved MEMORY_STORE to disk.")
    except Exception as e:
        logger.error(f"Failed to save MEMORY_STORE to disk: {e}")

# Initial load
load_memory_store()
PLANT_MODEL = None
PLANT_PROCESSOR = None
PLANT_MODEL_LOAD_ERROR = None

# ==================== MODELS ====================

class FarmCreate(BaseModel):
    user_name: str
    user_email: Optional[str] = None
    location: str  # City name or coordinates
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    soil_type: str  # Sandy, Loamy, Clay, etc.
    total_area: float  # in acres
    current_crops: Optional[List[str]] = []

class Farm(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_name: str
    user_email: Optional[str] = None
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    soil_type: str
    total_area: float
    current_crops: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CropRecommendationRequest(BaseModel):
    location: str
    soil_type: str
    season: str  # Summer, Winter, Monsoon, Spring
    area: float
    preferences: Optional[str] = None
    language: str = "en"

class DiseaseDetectionResponse(BaseModel):
    disease_name: str
    confidence: str
    treatment: str
    prevention: str

CROP_ALIASES = {
    "wheat": ["wheat"],
    "rice": ["rice", "paddy"],
    "maize": ["maize", "corn"],
    "corn": ["corn", "maize"],
    "potato": ["potato"],
    "tomato": ["tomato"],
    "cotton": ["cotton"],
    "soybean": ["soybean", "soya"],
    "apple": ["apple"],
    "grape": ["grape"],
    "pepper": ["pepper", "bell pepper"],
    "strawberry": ["strawberry"],
    "cherry": ["cherry"],
    "peach": ["peach"],
    "orange": ["orange"],
}

class MarketPriceRequest(BaseModel):
    crop_name: str
    location: str
    language: str = "en"

class IrrigationRequest(BaseModel):
    farm_id: str
    crop_type: str
    language: str = "en"

class CalendarRequest(BaseModel):
    crop_name: str
    planting_date: str
    area: float
    language: str = "en"

class RiskAnalysisRequest(BaseModel):
    farm_id: str
    language: str = "en"

class ExpenseRequest(BaseModel):
    farm_id: str
    seed_cost: float
    fertilizer_cost: float
    pesticide_cost: float
    labor_cost: float
    irrigation_cost: float
    other_costs: float
    expected_yield: float  # in quintals
    crop_name: str
    language: str = "en"

class ChatRequest(BaseModel):
    message: str
    language: str = "en"

class EmailRequest(BaseModel):
    user_name: str
    user_email: str

class WeatherWarningRequest(BaseModel):
    user_name: str
    user_email: str
    location: str

BACKEND_TRANSLATIONS = {
    "No major disease signs detected. Keep monitoring the crop, maintain balanced nutrition, and avoid unnecessary spraying.": {
        "hi": "कोई बड़े रोग के लक्षण नहीं मिले। फसल की निगरानी करते रहें, संतुलित पोषण बनाए रखें और अनावश्यक छिड़काव से बचें।",
        "mr": "कोणतेही मोठे रोगाचे लक्षण आढळले नाही. पिकाची देखरेख सुरू ठेवा, संतुलित पोषण द्या आणि अनावश्यक फवारणी टाळा."
    },
    "Use clean irrigation water, follow field sanitation, and inspect leaves every few days.": {
        "hi": "साफ सिंचाई के पानी का उपयोग करें, खेत की स्वच्छता का पालन करें और हर कुछ दिनों में पत्तियों का निरीक्षण करें।",
        "mr": "स्वच्छ सिंचन पाण्याचा वापर करा, शेतीची स्वच्छता पाळा आणि दर काही दिवसांनी पानांची पाहणी करा."
    },
    "Remove badly infected leaves, avoid overhead irrigation, and apply a crop-safe fungicide if spread increases.": {
        "hi": "बुरी तरह संक्रमित पत्तियों को हटा दें, ओवरहेड सिंचाई से बचें और यदि प्रसार बढ़ता है तो फसल-सुरक्षित कवकनाशी लगाएं।",
        "mr": "खूप खराब झालेली पाने काढून टाका, वरून पाणी देणे टाळा आणि जर प्रादुर्भाव वाढला तर बुरशीनाशकाचा वापर करा."
    },
    "Keep enough spacing, reduce leaf wetness, and rotate crops when possible.": {
        "hi": "पर्याप्त दूरी रखें, पत्तियों के गीलेपन को कम करें और जब संभव हो फसलों को बदलें।",
        "mr": "पुरेशी जागा ठेवा, पानांवरील ओलावा कमी करा आणि शक्य असल्यास पिकांची अदलाबदल करा."
    },
    "Scout the field quickly, remove heavily affected foliage, and apply a suitable fungicide based on the crop and label directions.": {
        "hi": "जल्दी से खेत का निरीक्षण करें, भारी रूप से प्रभावित पत्ते हटा दें, और फसल और लेबल निर्देशों के आधार पर एक उपयुक्त कवकनाशी लगाएं।",
        "mr": "त्वरित शेताची पाहणी करा, जास्त प्रादुर्भाव झालेली पाने काढून टाका आणि पिकाच्या लेबलवरील सूचनांनुसार योग्य बुरशीनाशक वापरा."
    },
    "Use resistant varieties, avoid excessive nitrogen, and maintain field airflow.": {
        "hi": "प्रतिरोधी किस्मों का उपयोग करें, अत्यधिक नाइट्रोजन से बचें और खेत में हवा का प्रवाह बनाए रखें।",
        "mr": "रोगप्रतिकारक जातींचा वापर करा, जास्त नायट्रोजन टाळा आणि शेतात हवा खेळती ठेवा."
    },
    "Prune the worst affected leaves and use crop-safe protection if symptoms keep expanding.": {
        "hi": "सबसे खराब प्रभावित पत्तियों की छंटाई करें और यदि लक्षण बढ़ते रहें तो फसल-सुरक्षित सुरक्षा का उपयोग करें।",
        "mr": "सर्वात जास्त खराब झालेली पाने छाटून टाका आणि जर लक्षणे वाढत राहिली तर पिकासाठी सुरक्षित औषधे वापरा."
    },
    "Avoid continuous leaf wetness, sanitize tools, and improve airflow around plants.": {
        "hi": "पत्तियों को लगातार गीला न रखें, उपकरणों को सैनिटाइज करें और पौधों के आसपास हवा के प्रवाह में सुधार करें।",
        "mr": "पाने सतत ओले राहू देऊ नका, अवजारे स्वच्छ ठेवा आणि झाडांभोवती हवा खेळती राहील याची काळजी घ्या."
    },
    "Remove infected tissue and apply a recommended fungicide quickly before the infection spreads.": {
        "hi": "संक्रमित ऊतकों को हटा दें और संक्रमण फैलने से पहले जल्दी से अनुशंसित कवकनाशी लगाएं।",
        "mr": "संसर्ग झालेला भाग काढून टाका आणि प्रादुर्भाव पसरण्यापूर्वी शिफारस केलेले बुरशीनाशक ताबडतोब वापरा."
    },
    "Avoid crowding, reduce humidity buildup, and inspect the underside of leaves regularly.": {
        "hi": "पौधों को सघन न लगाएं, उमस को कम करें और नियमित रूप से पत्तियों के निचले हिस्से का निरीक्षण करें।",
        "mr": "झाडे दाटीवाटीने लावू नका, आर्द्रता कमी करा आणि पानांच्या खालच्या बाजूची नियमित पाहणी करा."
    },
    "Confirm the disease in the field and use a crop-specific treatment after checking the active ingredient and label guidance.": {
        "hi": "खेत में रोग की पुष्टि करें और सक्रिय सामग्री और लेबल मार्गदर्शन की जांच के बाद फसल-विशिष्ट उपचार का उपयोग करें।",
        "mr": "शेतात रोगाची खात्री करा आणि औषधाचा घटक व लेबलवरील माहिती वाचूनच योग्य उपचार करा."
    },
    "Keep the field clean, avoid plant stress, and monitor symptom spread closely.": {
        "hi": "खेत को साफ रखें, पौधों के तनाव से बचें और लक्षणों के प्रसार की बारीकी से निगरानी करें।",
        "mr": "शेत स्वच्छ ठेवा, झाडांवर ताण येणार नाही याची काळजी घ्या आणि रोगाच्या लक्षणांकडे बारीक लक्ष ठेवा."
    },
    "Low": {"hi": "कम", "mr": "कमी"},
    "Medium": {"hi": "मध्यम", "mr": "मध्यम"},
    "High": {"hi": "उच्च", "mr": "जास्त"},
    "Image unclear or unsupported plant sample": {
        "hi": "छवि अस्पष्ट या असमर्थित पौधा नमूना",
        "mr": "प्रतिमा अस्पष्ट आहे किंवा हे पीक समर्थित नाही"
    },
    "Upload a close, well-lit leaf image with a plain background. Avoid blurred or distant photos.": {
        "hi": "सादे बैकग्राउंड के साथ एक पास की, अच्छी रोशनी वाली पत्ती की छवि अपलोड करें। धुंधली या दूर की तस्वीरों से बचें।",
        "mr": "साध्या पार्श्वभूमीवर स्पष्ट आणि उजेडात घेतलेला पाण्याचा फोटो अपलोड करा. धूसर किंवा लांबून घेतलेले फोटो टाळा."
    },
    "Use one leaf per photo and make sure the affected area is visible.": {
        "hi": "प्रति फोटो एक पत्ता उपयोग करें और सुनिश्चित करें कि प्रभावित क्षेत्र दिखाई दे रहा है।",
        "mr": "एका फोटोत एकच पान वापरा आणि रोगाचा भाग स्पष्ट दिसेल याची खात्री करा."
    },
    "Unknown": {"hi": "अज्ञात", "mr": "अज्ञात"},
}

def translate_backend_text(text: str, language: str) -> str:
    if language == "en" or not text:
        return text
    
    trans_entry = BACKEND_TRANSLATIONS.get(text)
    if trans_entry:
        return trans_entry.get(language, text)
    return text

# ==================== HELPER FUNCTIONS ====================

class ImageContent:
    def __init__(self, image_base64: str, mime_type: str = "image/jpeg"):
        self.image_base64 = image_base64
        self.mime_type = mime_type

class UserMessage:
    def __init__(self, text: str, file_contents: List[Any] = None):
        self.text = text
        self.file_contents = file_contents or []


def normalize_text_value(value: Any) -> Any:
    if isinstance(value, str):
        return " ".join(value.strip().lower().split())
    if isinstance(value, float):
        return round(value, 4)
    if isinstance(value, list):
        return [normalize_text_value(item) for item in value]
    if isinstance(value, dict):
        return {key: normalize_text_value(value[key]) for key in sorted(value)}
    return value


def build_cache_key(feature_name: str, payload: Dict[str, Any]) -> str:
    normalized_payload = normalize_text_value(payload)
    serialized = json.dumps(normalized_payload, sort_keys=True, separators=(",", ":"))
    digest = hashlib.sha256(serialized.encode("utf-8")).hexdigest()
    return f"{feature_name}:{digest}"

class LlmChat:
    def __init__(self, api_key: str, session_id: str, system_message: str):
        self.api_key = api_key
        self.system_message = system_message
        self.model = "gpt-4o-mini"
        self.provider = self._detect_provider(api_key)
        if api_key and self.provider == "groq":
            self.client = AsyncOpenAI(api_key=api_key, base_url="https://api.groq.com/openai/v1")
            self.model = "openai/gpt-oss-20b"
        elif api_key and self.provider == "openai":
            self.client = AsyncOpenAI(api_key=api_key)
        else:
            self.client = None

    def _detect_provider(self, api_key: str) -> str:
        if not api_key:
            return "none"
        if api_key.startswith("gsk_"):
            return "groq"
        if api_key.startswith("AIza"):
            return "gemini"
        return "openai"
    
    def with_model(self, provider: str, model: str):
        return self

    async def send_message(self, message: UserMessage):
        if self.provider == "gemini":
            return await self._send_gemini_message(message)

        if self.provider == "groq" and message.file_contents:
            logger.info("Groq text model selected for image request, using local fallback.")
            return build_mock_ai_response(message.text)

        if not self.client:
            return build_mock_ai_response(message.text)

        messages = [{"role": "system", "content": self.system_message}]
        
        content = [{"type": "text", "text": message.text}]
        if message.file_contents:
            for file in message.file_contents:
                if hasattr(file, 'image_base64'):
                    content.append({"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{file.image_base64}"}})
        
        messages.append({"role": "user", "content": content})
        
        is_json = "Format as JSON" in message.text or "Format your response as structured JSON" in message.text
        
        kwargs = {
            "model": self.model,
            "messages": messages,
            "temperature": 0,
        }
        if is_json:
            kwargs["response_format"] = {"type": "json_object"}
            
        try:
            response = await self.client.chat.completions.create(**kwargs)
            res_text = response.choices[0].message.content
            if is_json:
                try:
                    return json.loads(res_text)
                except Exception:
                    return res_text
            return res_text
        except Exception as e:
            logger.error("%s API Error: %s", self.provider.capitalize(), e)
            return build_mock_ai_response(message.text)

    async def _send_gemini_message(self, message: UserMessage):
        parts = [{"text": message.text}]
        for file in message.file_contents:
            if hasattr(file, "image_base64"):
                parts.append(
                    {
                        "inline_data": {
                            "mime_type": getattr(file, "mime_type", "image/jpeg"),
                            "data": file.image_base64,
                        }
                    }
                )

        payload = {
            "system_instruction": {
                "parts": [{"text": self.system_message}]
            },
            "contents": [
                {
                    "role": "user",
                    "parts": parts,
                }
            ],
        }

        is_json = "Format as JSON" in message.text or "Format your response as structured JSON" in message.text
        payload["generationConfig"] = {"temperature": 0}
        if is_json:
            payload["generationConfig"]["responseMimeType"] = "application/json"

        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

        try:
            response = requests.post(
                url,
                params={"key": self.api_key},
                json=payload,
                timeout=45,
            )
            response.raise_for_status()
            data = response.json()
            candidates = data.get("candidates") or []
            if not candidates:
                return build_mock_ai_response(message.text)

            content = candidates[0].get("content", {})
            parts = content.get("parts") or []
            text_chunks = [part.get("text", "") for part in parts if part.get("text")]
            res_text = "\n".join(text_chunks).strip()
            if not res_text:
                return build_mock_ai_response(message.text)

            if is_json:
                try:
                    return json.loads(res_text)
                except Exception:
                    return res_text
            return res_text
        except Exception as e:
            logger.error(f"Gemini API Error: {e}")
            return build_mock_ai_response(message.text)

async def get_llm_chat(system_message: str, session_id: str = None) -> LlmChat:
    """Initialize LLM chat instance"""
    if not session_id:
        session_id = str(uuid.uuid4())

    api_key = GROQ_API_KEY or GEMINI_API_KEY or OPENAI_API_KEY
    chat = LlmChat(
        api_key=api_key,
        session_id=session_id,
        system_message=system_message
    )
    return chat

def build_chat_reply(message: str, language: str = "en") -> str:
    prompt_lower = message.lower().strip()

    # Generic greetings
    if prompt_lower in ["hi", "hello", "hii", "hey", "नमस्ते"]:
        replies = {
            "en": "Hello! I am your Farmex AI assistant. I can help with crop recommendations, weather planning, irrigation, and more. What is on your mind?",
            "hi": "नमस्ते! मैं आपका फार्मएक्स एआई सहायक हूं। मैं फसल की सिफारिशों, मौसम नियोजन, सिंचाई और बहुत कुछ में मदद कर सकता हूं। आपके मन में क्या है?",
            "mr": "नमस्कार! मी तुमचा फार्मएक्स एआय सहाय्यक आहे. मी पीक शिफारसी, हवामान नियोजन, सिंचन आणि बरेच काही करण्यात मदत करू शकतो. तुमच्या मनात काय आहे?"
        }
        return replies.get(language, replies["en"])

    reply = ""
    if "summer" in prompt_lower and ("crop" in prompt_lower or "plant" in prompt_lower):
        replies = {
            "en": "For summer conditions, start with crops that handle heat and variable water well. Good options are maize, groundnut, bajra, pulses, and short-duration vegetables.",
            "hi": "गर्मी की स्थिति के लिए, उन फसलों से शुरू करें जो गर्मी और पानी की कमी को अच्छी तरह से सहन करती हैं। अच्छे विकल्प मक्का, मूंगफली, बाजरा, दलहन और कम अवधि वाली सब्जियां हैं।",
            "mr": "उन्हाळ्याच्या परिस्थितीसाठी, उष्णता आणि पाण्याची कमतरता चांगल्या प्रकारे सहन करणाऱ्या पिकांपासून सुरुवात करा. मका, भुईमूग, बाजरी, कडधान्ये आणि कमी कालावधीच्या भाज्या हे चांगले पर्याय आहेत."
        }
        reply = replies.get(language, replies["en"])
    elif "water" in prompt_lower and "rice" in prompt_lower:
        replies = {
            "en": "Rice usually needs regular moisture, especially during transplanting and flowering. Keep the field moist and adjust based on rainfall.",
            "hi": "चावल को आमतौर पर नियमित नमी की आवश्यकता होती है, विशेष रूप से रोपाई और फूल आने के दौरान। खेत को नम रखें और बारिश के आधार पर समायोजन करें।",
            "mr": "तांदळाला सहसा नियमित आर्द्रतेची गरज असते, विशेषतः लावणी आणि फुलोऱ्याच्या वेळी. शेत ओलसर ठेवा आणि पावसाच्या आधारे बदल करा."
        }
        reply = replies.get(language, replies["en"])
    elif "blight" in prompt_lower or "disease" in prompt_lower or "leaf spot" in prompt_lower:
        replies = {
            "en": "Remove heavily affected leaves first, avoid overhead watering, and improve airflow around the crop. Monitor new leaves every 2 to 3 days.",
            "hi": "सबसे पहले भारी प्रभावित पत्तियों को हटा दें, ओवरहेड पानी देने से बचें और फसल के चारों ओर हवा के प्रवाह में सुधार करें। हर 2 से 3 दिनों में नई पत्तियों की निगरानी करें।",
            "mr": "प्रथम जास्त प्रादुर्भाव झालेली पाने काढून टाका, वरून पाणी देणे टाळा आणि पिकाभोवती हवा खेळती राहील याची काळजी घ्या. दर २ ते ३ दिवसांनी नवीन पानांची पाहणी करा."
        }
        reply = replies.get(language, replies["en"])
    elif "fertilizer" in prompt_lower:
        replies = {
            "en": "Use fertilizer in split doses instead of one heavy application. Match the nutrient plan to crop stage and soil condition.",
            "hi": "एक भारी प्रयोग के बजाय विभाजित खुराक में उर्वरक का उपयोग करें। पोषक तत्व योजना को फसल के चरण और मिट्टी की स्थिति से मिलाएं।",
            "mr": "खताचा एकदाच मोठा वापर करण्याऐवजी विभागून डोस द्या. पोषक तत्वांचे नियोजन पिकाची अवस्था आणि जमिनीच्या स्थितीनुसार करा."
        }
        reply = replies.get(language, replies["en"])
    else:
        replies = {
            "en": "Please share your crop, location, soil type, and the exact problem. I can then suggest irrigation, crop choice, or disease treatment.",
            "hi": "कृपया अपनी फसल, स्थान, मिट्टी का प्रकार और सटीक समस्या साझा करें। फिर मैं सिंचाई, फसल चुनाव या रोग उपचार का सुझाव दे सकता हूं।",
            "mr": "कृपया तुमचे पीक, ठिकाण, जमिनीचा प्रकार आणि नेमकी समस्या सांगा. त्यानंतर मी सिंचन, पीक निवड किंवा रोग उपचाराबद्दल सुचवू शकतो."
        }
        reply = replies.get(language, replies["en"])

    return reply

def build_mock_ai_response(prompt: str):
    prompt_lower = prompt.lower()

    if "recommend the best crops" in prompt_lower:
        return {
            "crops": [
                {
                    "name": "Millets",
                    "reason": "Resilient under variable rainfall and suitable for resource-efficient farming.",
                    "yield_estimate": "8-12 quintals per acre",
                    "growing_tips": "Use balanced fertilization and monitor early moisture stress.",
                },
                {
                    "name": "Pulses",
                    "reason": "Improve soil health while keeping input costs moderate.",
                    "yield_estimate": "4-7 quintals per acre",
                    "growing_tips": "Prefer well-drained soil and schedule irrigation during flowering.",
                },
                {
                    "name": "Groundnut",
                    "reason": "Works well where drainage and sunlight are strong.",
                    "yield_estimate": "7-10 quintals per acre",
                    "growing_tips": "Avoid over-irrigation and scout for leaf spot regularly.",
                },
            ]
        }

    if "create a 7-day irrigation plan" in prompt_lower:
        return {
            "schedule": [
                {"date": (datetime.now(timezone.utc) + timedelta(days=i)).strftime("%Y-%m-%d"), "irrigate": i % 2 == 0, "water_quantity": 1800 + i * 50, "time": "06:00-08:00", "notes": "Adjust if rainfall exceeds forecast."}
                for i in range(7)
            ]
        }

    if "analyze this plant image" in prompt_lower:
        return {
            "disease_name": "Possible early leaf blight",
            "confidence": "Medium",
            "symptoms": "Visible spotting and stressed leaf tissue detected.",
            "treatment": "Remove heavily affected leaves and apply a crop-safe fungicide if symptoms spread.",
            "prevention": "Improve airflow, avoid overhead watering, and monitor new leaves.",
            "severity": "Moderate",
        }

    if "predict market prices" in prompt_lower:
        return {
            "current_price_range": "2200-2600 INR per quintal",
            "forecast": [
                {"month": "Month 1", "price_range": "2250-2650 INR", "trend": "stable"},
                {"month": "Month 2", "price_range": "2300-2700 INR", "trend": "rising"},
                {"month": "Month 3", "price_range": "2280-2680 INR", "trend": "stable"},
            ],
            "trend": "Stable to slightly rising",
            "factors": ["Seasonal arrivals", "Local demand", "Weather-linked supply"],
            "recommendation": "Track weekly mandi prices and avoid distress selling immediately after harvest.",
        }

    if "provide soil and rainfall insights" in prompt_lower:
        return {
            "soil_types": ["Loamy", "Clay loam"],
            "characteristics": "Moderate fertility with reasonable moisture retention.",
            "rainfall_pattern": "Monsoon-driven rainfall with concentrated seasonal peaks.",
            "monsoon_months": ["June", "July", "August", "September"],
            "water_retention": "Moderate to good",
            "irrigation_needs": "Supplement irrigation during dry spells and crop establishment.",
        }

    if "create a complete farming calendar" in prompt_lower:
        return {
            "activities": [
                {"date": "Week 1", "activity": "Land preparation", "description": "Clear residues and prepare beds.", "priority": "High"},
                {"date": "Week 2", "activity": "Sowing", "description": "Use healthy seeds and proper spacing.", "priority": "High"},
                {"date": "Week 4", "activity": "Nutrient management", "description": "Apply the first nutrient dose based on crop stage.", "priority": "Medium"},
                {"date": "Week 8", "activity": "Pest scouting", "description": "Inspect field blocks and record stress signs.", "priority": "Medium"},
            ]
        }

    if "perform comprehensive risk analysis" in prompt_lower:
        return {
            "weather_risks": ["Heat stress during peak afternoons", "Short dry spells"],
            "disease_risks": ["Leaf fungal infections under humidity spikes"],
            "market_risks": ["Price fluctuation near harvest window"],
            "operational_risks": ["Input timing delays", "Labor shortages"],
            "mitigation_strategies": ["Monitor forecast twice weekly", "Stage irrigation", "Diversify sales timing"],
            "overall_risk_score": "Medium",
        }

    if "analyze farm economics" in prompt_lower:
        return {
            "price_per_quintal": "2400 INR",
            "total_revenue": "Estimated from expected yield and market assumptions",
            "profit": "Positive if yield targets are met",
            "profit_margin": "18-24%",
            "roi": "1.2x to 1.4x",
            "breakeven_yield": "Approximately 70-80% of target yield",
            "recommendations": ["Reduce avoidable input waste", "Track local market timing", "Review irrigation cost per acre"],
        }

    if len(prompt_lower.split()) < 80:
        return build_chat_reply(prompt)

    return {
        "response": "Farmex fallback mode is active. External AI is unavailable, so this response is generated from local rules."
    }

async def safe_insert(collection_name: str, document: Dict[str, Any]):
    try:
        doc_copy = dict(document)
        await db[collection_name].insert_one(doc_copy)
    except Exception as exc:
        logger.warning("Database insert failed for %s, using memory store: %s", collection_name, exc)
        MEMORY_STORE[collection_name].append(document)
        save_memory_store()

async def safe_find_one(collection_name: str, query: Dict[str, Any]):
    try:
        document = await db[collection_name].find_one(query, {"_id": 0})
        if document:
            return document
    except Exception as exc:
        logger.warning("Database read failed for %s, using memory store: %s", collection_name, exc)

    for item in MEMORY_STORE[collection_name]:
        if all(item.get(key) == value for key, value in query.items()):
            res = dict(item)
            res.pop('_id', None)
            return res
    return None

async def safe_find_many(collection_name: str, query: Dict[str, Any] = None, limit: int = 100):
    query = query or {}
    try:
        return await db[collection_name].find(query, {"_id": 0}).to_list(limit)
    except Exception as exc:
        logger.warning("Database list failed for %s, using memory store: %s", collection_name, exc)
        results = []
        for item in MEMORY_STORE[collection_name]:
            matches = True
            for k, v in query.items():
                if item.get(k) != v:
                    matches = False
                    break
            if matches:
                res = dict(item)
                res.pop('_id', None)
                results.append(res)
                if len(results) >= limit:
                    break
        return results

def normalize_disease_label(label: str) -> str:
    return label.replace("___", " - ").replace("_", " ").strip()

def canonicalize_crop_name(crop_name: str) -> str:
    value = (crop_name or "").strip().lower()
    for canonical, aliases in CROP_ALIASES.items():
        if value == canonical or value in aliases:
            return canonical
    return value

def extract_crop_from_label(label: str) -> str:
    normalized = normalize_disease_label(label).lower()
    for canonical, aliases in CROP_ALIASES.items():
        if any(alias in normalized for alias in aliases):
            return canonical
    primary = normalized.split(" - ")[0].strip()
    return primary.split()[0] if primary else "unknown"

def load_plant_disease_model():
    global PLANT_MODEL, PLANT_PROCESSOR, PLANT_MODEL_LOAD_ERROR

    if PLANT_MODEL is not None and PLANT_PROCESSOR is not None:
        return PLANT_PROCESSOR, PLANT_MODEL
    if PLANT_MODEL_LOAD_ERROR is not None:
        raise RuntimeError(PLANT_MODEL_LOAD_ERROR)

    try:
        # These are lazily imported to keep the main process lightweight
        from transformers import AutoImageProcessor, AutoModelForImageClassification
        import torch
        from PIL import Image

        PLANT_PROCESSOR = AutoImageProcessor.from_pretrained(PLANT_DISEASE_MODEL)
        PLANT_MODEL = AutoModelForImageClassification.from_pretrained(PLANT_DISEASE_MODEL)
        PLANT_MODEL.eval()
        logger.info("Loaded local plant disease model: %s", PLANT_DISEASE_MODEL)
    except Exception as exc:
        PLANT_MODEL_LOAD_ERROR = str(exc)
        logger.error("Failed to load local plant disease model %s: %s", PLANT_DISEASE_MODEL, exc)
        raise RuntimeError(PLANT_MODEL_LOAD_ERROR) from exc

def get_supported_crops_from_model(model) -> List[str]:
    crops = {
        extract_crop_from_label(label)
        for label in model.config.id2label.values()
        if extract_crop_from_label(label) not in {"unknown", ""}
    }
    return sorted(crops)

def normalize_calendar_response(calendar_data: Any, planting_date: str) -> Any:
    if not isinstance(calendar_data, dict):
        return calendar_data

    activities = calendar_data.get("activities")
    if not isinstance(activities, list):
        return calendar_data

    try:
        base_date = datetime.strptime(planting_date, "%Y-%m-%d").date()
    except Exception:
        return calendar_data

    normalized_activities = []
    current_date = base_date

    for index, activity in enumerate(activities):
        if not isinstance(activity, dict):
            normalized_activities.append(activity)
            continue

        item = dict(activity)
        raw_date = str(item.get("date", "")).strip().lower()

        if "week" in raw_date:
            digits = "".join(ch for ch in raw_date if ch.isdigit())
            week_num = int(digits) if digits else index + 1
            item["date"] = (base_date + timedelta(days=max(0, week_num - 1) * 7)).isoformat()
        elif "day" in raw_date:
            digits = "".join(ch for ch in raw_date if ch.isdigit())
            day_num = int(digits) if digits else index + 1
            item["date"] = (base_date + timedelta(days=max(0, day_num - 1))).isoformat()
        else:
            try:
                parsed = datetime.fromisoformat(str(item.get("date"))).date()
                if parsed < base_date:
                    parsed = current_date
                item["date"] = parsed.isoformat()
            except Exception:
                item["date"] = current_date.isoformat()

        try:
            current_date = datetime.fromisoformat(item["date"]).date() + timedelta(days=7)
        except Exception:
            current_date = current_date + timedelta(days=7)

        normalized_activities.append(item)

    calendar_data["activities"] = normalized_activities
    return calendar_data

def build_disease_guidance(label: str, language: str = "en") -> Dict[str, str]:
    normalized = normalize_disease_label(label)
    lower = normalized.lower()

    if "healthy" in lower:
        return {
            "treatment": translate_backend_text("No major disease signs detected. Keep monitoring the crop, maintain balanced nutrition, and avoid unnecessary spraying.", language),
            "prevention": translate_backend_text("Use clean irrigation water, follow field sanitation, and inspect leaves every few days.", language),
            "severity": translate_backend_text("Low", language),
        }

    if "blight" in lower:
        return {
            "treatment": translate_backend_text("Remove badly infected leaves, avoid overhead irrigation, and apply a crop-safe fungicide if spread increases.", language),
            "prevention": translate_backend_text("Keep enough spacing, reduce leaf wetness, and rotate crops when possible.", language),
            "severity": translate_backend_text("Medium", language),
        }

    if "rust" in lower:
        return {
            "treatment": translate_backend_text("Scout the field quickly, remove heavily affected foliage, and apply a suitable fungicide based on the crop and label directions.", language),
            "prevention": translate_backend_text("Use resistant varieties, avoid excessive nitrogen, and maintain field airflow.", language),
            "severity": translate_backend_text("Medium", language),
        }

    if "spot" in lower or "leaf" in lower:
        return {
            "treatment": translate_backend_text("Prune the worst affected leaves and use crop-safe protection if symptoms keep expanding.", language),
            "prevention": translate_backend_text("Avoid continuous leaf wetness, sanitize tools, and improve airflow around plants.", language),
            "severity": translate_backend_text("Medium", language),
        }

    if "mildew" in lower:
        return {
            "treatment": translate_backend_text("Remove infected tissue and apply a recommended fungicide quickly before the infection spreads.", language),
            "prevention": translate_backend_text("Avoid crowding, reduce humidity buildup, and inspect the underside of leaves regularly.", language),
            "severity": translate_backend_text("Medium", language),
        }

    return {
        "treatment": translate_backend_text("Confirm the disease in the field and use a crop-specific treatment after checking the active ingredient and label guidance.", language),
        "prevention": translate_backend_text("Keep the field clean, avoid plant stress, and monitor symptom spread closely.", language),
        "severity": translate_backend_text("Medium", language),
    }

def detect_plant_disease_from_image(contents: bytes, crop_name: str = "", language: str = "en") -> Dict[str, Any]:
    """
    AI-powered plant disease detection from image using Groq Vision API.
    """
    try:
        import base64
        import json
        groq_key = os.getenv("GROQ_API_KEY", "").strip()
        if not groq_key:
             raise ValueError("GROQ_API_KEY missing.")
        base64_image = base64.b64encode(contents).decode("utf-8")
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {"Authorization": f"Bearer {groq_key}"}
        prompt = f"Identify disease in {crop_name}. Return JSON with fields: disease_name, confidence, treatment, prevention, severity."
        payload = {
            "model": "llama-3.2-11b-vision-preview",
            "messages": [{"role": "user", "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
            ]}],
            "response_format": {"type": "json_object"}
        }
        logger.info(f"Analyzing {crop_name} with Groq Vision...")
        response = requests.post(url, headers=headers, json=payload, timeout=25)
        response.raise_for_status()
        parsed = json.loads(response.json()["choices"][0]["message"]["content"])
        return {
            "disease_name": translate_backend_text(parsed.get("disease_name", "Unknown"), language),
            "confidence": parsed.get("confidence", "95%"),
            "treatment": translate_backend_text(parsed.get("treatment", "Consult an expert."), language),
            "prevention": translate_backend_text(parsed.get("prevention", "Maintain health."), language),
            "severity": translate_backend_text(parsed.get("severity", "Medium"), language),
            "source": "groq-vision-ai"
        }
    except Exception as exc:
        logger.error(f"Detection error: {exc}")
        return {
            "disease_name": translate_backend_text("Detection system unavailable", language),
            "confidence": "0%",
            "treatment": translate_backend_text(f"Engine fail: {str(exc)}", language),
            "prevention": translate_backend_text("Check your GROQ_API_KEY in Render dashboard.", language),
            "severity": translate_backend_text("Unknown", language),
            "source": "groq-error"
        }
def get_weather_data(location: str) -> Dict[str, Any]:
    """Fetch weather data from OpenWeatherMap API"""
    if not OPENWEATHERMAP_API_KEY or OPENWEATHERMAP_API_KEY == "203c8deff1623b1499e57e75045":
        # Return mock data if no API key
        return {
            "temp": 28.5,
            "feels_like": 30.2,
            "humidity": 65,
            "pressure": 1013,
            "wind_speed": 3.5,
            "description": "partly cloudy",
            "icon": "02d"
        }
    
    try:
        url = f"https://api.openweathermap.org/data/2.5/weather"
        params = {
            "q": location,
            "appid": OPENWEATHERMAP_API_KEY,
            "units": "metric"
        }
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        return {
            "temp": data["main"]["temp"],
            "feels_like": data["main"]["feels_like"],
            "humidity": data["main"]["humidity"],
            "pressure": data["main"]["pressure"],
            "wind_speed": data["wind"]["speed"],
            "description": data["weather"][0]["description"],
            "icon": data["weather"][0]["icon"]
        }
    except Exception as e:
        logger.error(f"Weather API error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch weather data: {str(e)}")

def get_weather_forecast(location: str) -> List[Dict[str, Any]]:
    """Fetch 7-day weather forecast"""
    if not OPENWEATHERMAP_API_KEY or OPENWEATHERMAP_API_KEY == "placeholder_get_free_key_from_openweathermap":
        # Return mock forecast data
        forecast = []
        for i in range(7):
            date = datetime.now(timezone.utc) + timedelta(days=i)
            forecast.append({
                "date": date.strftime("%Y-%m-%d"),
                "temp_max": 32 + (i % 3),
                "temp_min": 22 + (i % 2),
                "humidity": 60 + (i * 2),
                "rain_probability": 30 + (i * 5),
                "description": "partly cloudy"
            })
        return forecast
    
    try:
        url = f"https://api.openweathermap.org/data/2.5/forecast"
        params = {
            "q": location,
            "appid": OPENWEATHERMAP_API_KEY,
            "units": "metric"
        }
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Process forecast data (OpenWeatherMap returns 3-hour intervals)
        daily_forecast = {}
        for item in data["list"]:
            date = item["dt_txt"].split(" ")[0]
            if date not in daily_forecast:
                daily_forecast[date] = {
                    "date": date,
                    "temp_max": item["main"]["temp_max"],
                    "temp_min": item["main"]["temp_min"],
                    "humidity": item["main"]["humidity"],
                    "rain_probability": item.get("pop", 0) * 100,
                    "description": item["weather"][0]["description"]
                }
            else:
                daily_forecast[date]["temp_max"] = max(daily_forecast[date]["temp_max"], item["main"]["temp_max"])
                daily_forecast[date]["temp_min"] = min(daily_forecast[date]["temp_min"], item["main"]["temp_min"])
        
        return list(daily_forecast.values())[:7]
    except Exception as e:
        logger.error(f"Weather forecast API error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch weather forecast: {str(e)}")

# ==================== API ENDPOINTS ====================

@api_router.get("/")
async def root():
    return {"message": "Welcome to Farmex API - AI-Powered Agriculture Platform"}

def send_welcome_email(user_email: str, user_name: str):
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        logger.warning("SMTP credentials not configured. Skipping welcome email to %s", user_email)
        return
    
    try:
        msg = EmailMessage()
        msg['Subject'] = 'Welcome to Farmex - Start Your Agricultural Journey!'
        msg['From'] = SMTP_EMAIL
        msg['To'] = user_email
        
        msg.set_content(f"""\
Hello {user_name},

Welcome to Farmex, your premium AI-powered agricultural platform!

We are so excited to have you on board. With Farmex, you can manage your farms, analyze market prices, track expenses, and detect crop diseases with AI.

Log in to your dashboard to get started with your first farm!

Best regards,
The Farmex Team.
        """)
        
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(SMTP_EMAIL, SMTP_PASSWORD)
            smtp.send_message(msg)
            
        logger.info("Welcome email successfully sent to %s", user_email)
    except Exception as e:
        logger.error("Failed to send welcome email: %s", e)

@api_router.post("/email/welcome")
async def email_welcome(request: EmailRequest, background_tasks: BackgroundTasks):
    """Trigger a welcome email to the newly registered user"""
    background_tasks.add_task(send_welcome_email, request.user_email, request.user_name)
    return {"message": "Welcome email queued successfully"}

# 1. WEATHER ENDPOINTS
@api_router.get("/weather/current")
async def get_current_weather(location: str):
    """Get current weather for a location"""
    try:
        weather_data = get_weather_data(location)
        return {
            "location": location,
            "weather": weather_data,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logger.error(f"Error in get_current_weather: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/weather/warning")
async def check_weather_warning(request: WeatherWarningRequest, background_tasks: BackgroundTasks):
    try:
        weather_data = get_weather_data(request.location)
        def dispatch_warning(user_email, user_name, location, temp, desc):
            if not SMTP_EMAIL or not SMTP_PASSWORD: return
            try:
                msg = EmailMessage()
                msg['Subject'] = f'⚠️ Weather Alert for {location}'
                msg['From'] = SMTP_EMAIL
                msg['To'] = user_email
                msg.set_content(f"Hello {user_name},\n\nWe detected a significant weather update for {location}.\nCondition: {desc} at {temp}°C.\n\nPlease check your Farmex dashboard for potential crop impacts.\n\n- Farmex Weather AI")
                with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
                    smtp.login(SMTP_EMAIL, SMTP_PASSWORD)
                    smtp.send_message(msg)
            except Exception:
                pass
        background_tasks.add_task(dispatch_warning, request.user_email, request.user_name, request.location, weather_data['temp'], weather_data['description'])
        return {"message": "Weather conditions analyzed. Alert dispatched."}
    except Exception as e:
        logger.error(f"Error checking weather warning: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/weather/forecast")
async def get_weather_forecast_endpoint(location: str):
    """Get 7-day weather forecast"""
    try:
        forecast_data = get_weather_forecast(location)
        return {
            "location": location,
            "forecast": forecast_data,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logger.error(f"Error in get_weather_forecast: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 2. CROP RECOMMENDATION
@api_router.post("/crop/recommend")
async def recommend_crops(request: CropRecommendationRequest):
    """AI-powered crop recommendation"""
    try:
        weather_data = get_weather_data(request.location)
        current_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        cache_key = build_cache_key(
            "crop_recommendation",
            {
                "location": request.location,
                "soil_type": request.soil_type,
                "season": request.season,
                "area": request.area,
                "preferences": request.preferences or "",
                "date": current_date,
                "language": request.language,
            },
        )
        cached_recommendation = await safe_find_one("crop_recommendations", {"cache_key": cache_key})
        if cached_recommendation:
            return {
                "recommendation": cached_recommendation["recommendation"],
                "weather_context": weather_data,
            }
        
        system_message = """You are an expert agricultural advisor specializing in crop recommendations. 
        Provide detailed, practical crop recommendations based on location, soil type, season, and weather conditions."""
        
        chat = await get_llm_chat(system_message)
        
        prompt = f"""Recommend the best crops for the following conditions:

Current Date: {current_date}
Location: {request.location}
Soil Type: {request.soil_type}
Season: {request.season}
Available Area: {request.area} acres
Current Weather: Temperature {weather_data['temp']}°C, Humidity {weather_data['humidity']}%
Additional Preferences: {request.preferences or 'None'}
Language: {request.language}

Please provide:
1. Top 3-5 recommended crops
2. Brief reason for each recommendation
3. Expected yield estimates
4. Key growing tips

Ensure all generated response texts (like reason, growing_tips, name, and yield_estimate) are entirely translated to {request.language} language.

Format your response as structured JSON with fields: crops (array of objects with name, reason, yield_estimate, growing_tips)"""

        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Save to database
        recommendation_doc = {
            "id": str(uuid.uuid4()),
            "cache_key": cache_key,
            "location": request.location,
            "soil_type": request.soil_type,
            "season": request.season,
            "recommendation": response,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await safe_insert("crop_recommendations", recommendation_doc)
        
        return {
            "recommendation": response,
            "weather_context": weather_data
        }
    except Exception as e:
        logger.error(f"Error in recommend_crops: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 3. IRRIGATION PLANNER
@api_router.post("/irrigation/plan")
async def create_irrigation_plan(request: IrrigationRequest):
    """Generate smart irrigation schedule"""
    try:
        # Get farm details
        farm_doc = await safe_find_one("farms", {"id": request.farm_id})
        if not farm_doc:
            raise HTTPException(status_code=404, detail="Farm not found")
        
        weather_data = get_weather_data(farm_doc["location"])
        forecast_data = get_weather_forecast(farm_doc["location"])
        current_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        cache_key = build_cache_key(
            "irrigation_plan",
            {
                "farm_id": request.farm_id,
                "crop_type": request.crop_type,
                "farm_location": farm_doc["location"],
                "soil_type": farm_doc["soil_type"],
                "total_area": farm_doc["total_area"],
                "current_date": current_date,
                "language": request.language,
            },
        )
        cached_plan = await safe_find_one("irrigation_schedules", {"cache_key": cache_key})
        if cached_plan:
            return {
                "irrigation_plan": cached_plan["plan"],
                "weather_forecast": forecast_data[:7],
            }

        system_message = """You are an irrigation specialist. Create efficient irrigation schedules
        based on crop type, weather conditions, and soil moisture requirements."""

        chat = await get_llm_chat(system_message)

        prompt = f"""Create a 7-day irrigation plan for:

Current Date: {current_date}
Crop: {request.crop_type}
Soil Type: {farm_doc['soil_type']}
Area: {farm_doc['total_area']} acres
Current Weather: Temp {weather_data['temp']}°C, Humidity {weather_data['humidity']}%
7-Day Forecast: {forecast_data[:3]}
Language: {request.language}

Provide:
1. Daily irrigation schedule (yes/no)
2. Water quantity per session (liters/acre)
3. Best time of day
4. Special considerations

Ensure all generated response texts (like notes, time) are entirely translated to {request.language} language.

Format as JSON with fields: schedule (array of day objects with date, irrigate, water_quantity, time, notes)"""
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Save to database
        irrigation_doc = {
            "id": str(uuid.uuid4()),
            "cache_key": cache_key,
            "farm_id": request.farm_id,
            "crop_type": request.crop_type,
            "plan": response,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await safe_insert("irrigation_schedules", irrigation_doc)
        
        return {
            "irrigation_plan": response,
            "weather_forecast": forecast_data[:7]
        }
    except Exception as e:
        logger.error(f"Error in create_irrigation_plan: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 4. DISEASE DETECTION
@api_router.post("/disease/detect")
async def detect_disease(file: UploadFile = File(...), crop_name: str = Form(""), language: str = Form("en")):
    """AI-powered plant disease detection from image"""
    try:
        # Read image file
        contents = await file.read()
        image_hash = hashlib.sha256(contents).hexdigest()
        cache_key = build_cache_key(
            "disease_detection",
            {
                "image_hash": image_hash,
                "crop_name": crop_name,
                "language": language,
            },
        )
        
        # [DIAGNOSTIC-V3] Force fresh scan
        logger.info(f"Triggering fresh scan for: {image_hash}")
            
        try:
            response_data = detect_plant_disease_from_image(contents, crop_name, language)
        except Exception as e:
            logger.error(f"Detection execution error: {e}")
            response_data = {
                "disease_name": f"Engine Error (v3): {str(e)}",
                "confidence": "0%",
                "treatment": "Direct API failure. Check HuggingFace Token.",
                "prevention": "Technical issue detected in detection pipeline.",
                "severity": "Unknown",
                "source": "error"
            }
        
        # Save to database
        detection_doc = {
            "id": str(uuid.uuid4()),
            "cache_key": cache_key,
            "filename": file.filename,
            "crop_name": crop_name,
            "detection_result": response_data,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await safe_insert("disease_detections", detection_doc)
        
        return {
            "detection": response_data,
            "filename": file.filename
        }
    except Exception as e:
        logger.error(f"Error in detect_disease: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 5. MARKET PRICE PREDICTION
@api_router.post("/market/predict")
async def predict_market_price(request: MarketPriceRequest):
    """AI-powered market price prediction"""
    try:
        current_month = datetime.now().strftime("%Y-%m")
        cache_key = build_cache_key(
            "market_prediction",
            {
                "crop_name": request.crop_name,
                "location": request.location,
                "current_month": current_month,
                "language": request.language,
            },
        )
        cached_prediction = await safe_find_one("price_predictions", {"cache_key": cache_key})
        if cached_prediction:
            return {
                "prediction": cached_prediction["prediction"],
                "crop": request.crop_name,
            }
        system_message = """You are an agricultural market analyst. Provide price predictions and market trends 
        for agricultural commodities based on historical patterns, seasonal factors, and market conditions."""
        
        chat = await get_llm_chat(system_message)
        
        prompt = f"""Analyze and predict market prices for:

Crop: {request.crop_name}
Location: {request.location}
Current Date: {datetime.now().strftime("%B %Y")}
Language: {request.language}

Provide:
1. Current estimated price range (per quintal)
2. 3-month price forecast
3. Market trend analysis (rising/stable/falling)
4. Factors affecting price
5. Best time to sell recommendation

Ensure all generated response texts (like trend, factors, recommendation, price_range) are entirely translated to {request.language} language.

Format as JSON with fields: current_price_range, forecast (array of month objects), trend, factors, recommendation"""

        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Save to database
        prediction_doc = {
            "id": str(uuid.uuid4()),
            "cache_key": cache_key,
            "crop_name": request.crop_name,
            "location": request.location,
            "prediction": response,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await safe_insert("price_predictions", prediction_doc)
        
        return {
            "prediction": response,
            "crop": request.crop_name
        }
    except Exception as e:
        logger.error(f"Error in predict_market_price: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 6. SOIL & RAINFALL INSIGHTS
@api_router.get("/soil/insights")
async def get_soil_insights(location: str, language: str = "en"):
    """Get geo-based soil and rainfall insights"""
    try:
        weather_data = get_weather_data(location)
        current_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        cache_key = build_cache_key("soil_insights", {"location": location, "date": current_date, "language": language})
        cached_insights = await safe_find_one("soil_insights", {"cache_key": cache_key})
        if cached_insights:
            return {
                "insights": cached_insights["analysis"],
                "location": location,
                "current_weather": weather_data,
            }
        
        system_message = """You are a soil science and hydrology expert. Provide insights on soil characteristics 
        and rainfall patterns for agricultural planning."""
        
        chat = await get_llm_chat(system_message)
        
        prompt = f"""Provide soil and rainfall insights for:

Location: {location}
Current Humidity: {weather_data['humidity']}%
Language: {language}

Provide:
1. Typical soil types in this region
2. Soil characteristics and suitability
3. Average annual rainfall patterns
4. Monsoon/rainy season timing
5. Water retention capacity
6. Irrigation requirements

Ensure all generated response texts (like characteristics, rainfall_pattern, etc) are entirely translated to {language} language.

Format as JSON with fields: soil_types, characteristics, rainfall_pattern, monsoon_months, water_retention, irrigation_needs"""

        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        soil_doc = {
            "id": str(uuid.uuid4()),
            "cache_key": cache_key,
            "analysis": response,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        await safe_insert("soil_insights", soil_doc)

        return {
            "insights": response,
            "location": location,
            "current_weather": weather_data
        }
    except Exception as e:
        logger.error(f"Error in get_soil_insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 7. FARMING CALENDAR
@api_router.post("/calendar/generate")
async def generate_farming_calendar(request: CalendarRequest):
    """Generate automated farming calendar"""
    try:
        cache_key = build_cache_key(
            "farming_calendar",
            {
                "crop_name": request.crop_name,
                "planting_date": request.planting_date,
                "area": request.area,
                "language": request.language,
            },
        )
        cached_calendar = await safe_find_one("farming_calendars", {"cache_key": cache_key})
        if cached_calendar:
            return {
                "calendar": cached_calendar["calendar"],
                "crop": request.crop_name,
            }
        system_message = """You are a crop cultivation expert. Create detailed farming calendars 
        with all activities from planting to harvest."""
        
        chat = await get_llm_chat(system_message)
        
        prompt = f"""Create a complete farming calendar for:

Crop: {request.crop_name}
Planting Date: {request.planting_date}
Area: {request.area} acres
Language: {request.language}

Provide a detailed timeline with:
1. Preparation activities (before planting)
2. Planting details
3. Growth stage activities (fertilization, irrigation, pest control)
4. Harvest timing
5. Post-harvest activities

Ensure all generated response texts (like activity, description, priority) are entirely translated to {request.language} language.

Format as JSON with fields: activities (array of objects with date, activity, description, priority)"""

        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        response = normalize_calendar_response(response, request.planting_date)
        
        # Save to database
        calendar_doc = {
            "id": str(uuid.uuid4()),
            "cache_key": cache_key,
            "crop_name": request.crop_name,
            "planting_date": request.planting_date,
            "calendar": response,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await safe_insert("farming_calendars", calendar_doc)
        
        return {
            "calendar": response,
            "crop": request.crop_name
        }
    except Exception as e:
        logger.error(f"Error in generate_farming_calendar: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 8. RISK PREDICTION ENGINE
@api_router.post("/risk/analyze")
async def analyze_risks(request: RiskAnalysisRequest):
    """Comprehensive risk analysis"""
    try:
        # Get farm details
        farm_doc = await safe_find_one("farms", {"id": request.farm_id})
        if not farm_doc:
            raise HTTPException(status_code=404, detail="Farm not found")
        
        weather_data = get_weather_data(farm_doc["location"])
        forecast_data = get_weather_forecast(farm_doc["location"])
        current_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        cache_key = build_cache_key(
            "risk_analysis",
            {
                "farm_id": request.farm_id,
                "farm_location": farm_doc["location"],
                "soil_type": farm_doc["soil_type"],
                "current_crops": farm_doc["current_crops"],
                "total_area": farm_doc["total_area"],
                "current_date": current_date,
                "language": request.language,
            },
        )
        cached_risk = await safe_find_one("risk_analyses", {"cache_key": cache_key})
        if cached_risk:
            return {
                "risk_analysis": cached_risk["analysis"],
                "weather_context": weather_data,
            }
        
        system_message = """You are an agricultural risk management expert. Analyze and predict various risks 
        including weather, disease, market, and operational risks."""
        
        chat = await get_llm_chat(system_message)
        
        prompt = f"""Perform comprehensive risk analysis for:

Farm Location: {farm_doc['location']}
Soil Type: {farm_doc['soil_type']}
Current Crops: {', '.join(farm_doc['current_crops'])}
Area: {farm_doc['total_area']} acres
Weather: {weather_data}
Forecast: {forecast_data[:3]}
Language: {request.language}

Analyze and provide:
1. Weather-related risks (drought, flood, frost, extreme heat)
2. Disease and pest risks
3. Market price volatility risks
4. Operational risks
5. Risk mitigation strategies
6. Overall risk score (Low/Medium/High)

Ensure all generated response texts (like risks, mitigation_strategies, overall_risk_score) are entirely translated to {request.language} language.

Format as JSON with fields: weather_risks, disease_risks, market_risks, operational_risks, mitigation_strategies, overall_risk_score"""

        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Save to database
        risk_doc = {
            "id": str(uuid.uuid4()),
            "cache_key": cache_key,
            "farm_id": request.farm_id,
            "analysis": response,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await safe_insert("risk_analyses", risk_doc)
        
        return {
            "risk_analysis": response,
            "weather_context": weather_data
        }
    except Exception as e:
        logger.error(f"Error in analyze_risks: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 9. VOICE ASSISTANT (Placeholder - Frontend will handle audio recording and playback)
@api_router.post("/chat/assistant")
async def chat_assistant(request: ChatRequest):
    """Multilingual agricultural assistant"""
    try:
        system_message = f"""You are Farmex AI Assistant, a helpful multilingual agricultural advisor. 
        Respond in {request.language} language. Provide practical, actionable farming advice."""
        
        chat = await get_llm_chat(system_message)
        
        user_message = UserMessage(text=request.message)
        response = await chat.send_message(user_message)
        
        if isinstance(response, dict):
            response = response.get("response") or build_chat_reply(request.message, request.language)

        return {
            "response": response,
            "language": request.language
        }
    except Exception as e:
        logger.error(f"Error in chat_assistant: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 10. EXPENSE & PROFIT ESTIMATOR
@api_router.post("/expense/calculate")
async def calculate_expense_profit(request: ExpenseRequest):
    """Calculate expenses and profit estimation"""
    try:
        total_expenses = (
            request.seed_cost + 
            request.fertilizer_cost + 
            request.pesticide_cost + 
            request.labor_cost + 
            request.irrigation_cost + 
            request.other_costs
        )
        cache_key = build_cache_key(
            "expense_analysis",
            {
                "farm_id": request.farm_id,
                "crop_name": request.crop_name,
                "seed_cost": request.seed_cost,
                "fertilizer_cost": request.fertilizer_cost,
                "pesticide_cost": request.pesticide_cost,
                "labor_cost": request.labor_cost,
                "irrigation_cost": request.irrigation_cost,
                "other_costs": request.other_costs,
                "expected_yield": request.expected_yield,
                "language": request.language,
            },
        )
        cached_expense = await safe_find_one("expenses", {"cache_key": cache_key})
        if cached_expense:
            return {
                "total_expenses": cached_expense["total_expenses"],
                "analysis": cached_expense["analysis"],
            }
        
        # Get market price prediction for revenue calculation
        system_message = """You are a farm financial advisor. Provide detailed financial analysis and projections."""
        
        chat = await get_llm_chat(system_message)
        
        prompt = f"""Analyze farm economics for:

Crop: {request.crop_name}
Total Expenses: ₹{total_expenses:,.2f}
- Seeds: ₹{request.seed_cost:,.2f}
- Fertilizer: ₹{request.fertilizer_cost:,.2f}
- Pesticides: ₹{request.pesticide_cost:,.2f}
- Labor: ₹{request.labor_cost:,.2f}
- Irrigation: ₹{request.irrigation_cost:,.2f}
- Other: ₹{request.other_costs:,.2f}

Expected Yield: {request.expected_yield} quintals
Language: {request.language}

Provide:
1. Estimated market price per quintal
2. Total expected revenue
3. Estimated profit/loss
4. Profit margin percentage
5. ROI (Return on Investment)
6. Break-even analysis
7. Financial recommendations

Ensure all generated response texts (like recommendations, analysis strings) are entirely translated to {request.language} language.

Format as JSON with fields: price_per_quintal, total_revenue, profit, profit_margin, roi, breakeven_yield, recommendations"""

        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Save to database
        expense_doc = {
            "id": str(uuid.uuid4()),
            "cache_key": cache_key,
            "farm_id": request.farm_id,
            "crop_name": request.crop_name,
            "total_expenses": total_expenses,
            "expected_yield": request.expected_yield,
            "analysis": response,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await safe_insert("expenses", expense_doc)
        
        return {
            "total_expenses": total_expenses,
            "analysis": response
        }
    except Exception as e:
        logger.error(f"Error in calculate_expense_profit: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# FARM MANAGEMENT ENDPOINTS
@api_router.post("/farm/create")
async def create_farm(farm: FarmCreate):
    """Create a new farm profile"""
    try:
        farm_obj = Farm(
            user_name=farm.user_name,
            user_email=farm.user_email,
            location=farm.location,
            latitude=farm.latitude,
            longitude=farm.longitude,
            soil_type=farm.soil_type,
            total_area=farm.total_area,
            current_crops=farm.current_crops or []
        )
        
        farm_dict = farm_obj.model_dump()
        farm_dict['created_at'] = farm_dict['created_at'].isoformat()
        
        await safe_insert("farms", farm_dict)
        
        return farm_obj
    except Exception as e:
        logger.error(f"Error in create_farm: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/farm/{farm_id}")
async def get_farm(farm_id: str):
    """Get farm details"""
    try:
        farm_doc = await safe_find_one("farms", {"id": farm_id})
        if not farm_doc:
            raise HTTPException(status_code=404, detail="Farm not found")
        return farm_doc
    except Exception as e:
        logger.error(f"Error in get_farm: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/farms")
async def list_farms(user_email: Optional[str] = None):
    """List all farms"""
    try:
        query = {"user_email": user_email} if user_email else {}
        farms = await safe_find_many("farms", query=query, limit=100)
        return {"farms": farms}
    except Exception as e:
        logger.error(f"Error in list_farms: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== HACKATHON DEMO & DASHBOARD ENDPOINTS ====================

@api_router.get("/dashboard/{farm_id}")
async def get_dashboard_summary(farm_id: str):
    """Get a consolidated dashboard view for a farm (Optimized for Frontend)"""
    try:
        farm_doc = await safe_find_one("farms", {"id": farm_id})
        if not farm_doc:
            raise HTTPException(status_code=404, detail="Farm not found")
            
        location = farm_doc["location"]
        weather = get_weather_data(location)
        
        # Get latest irrigation plan
        irrigation = await safe_find_many("irrigation_schedules", {"farm_id": farm_id}, limit=1)
        
        # Get latest expenses
        expenses = await safe_find_many("expenses", {"farm_id": farm_id}, limit=1)
        
        # Simple alert logic
        alerts = []
        if weather.get("humidity", 0) > 80:
            alerts.append("High humidity detected. Watch out for fungal diseases.")
        if weather.get("temp", 0) > 35:
            alerts.append("High temperature warning. Increase irrigation.")
            
        return {
            "farm": farm_doc,
            "weather": weather,
            "recent_irrigation": irrigation[0] if irrigation else None,
            "recent_expenses": expenses[0] if expenses else None,
            "alerts": alerts if alerts else ["Weather conditions are optimal for your crops."]
        }
    except Exception as e:
        logger.error(f"Error in dashboard summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/seed")
async def seed_mock_data():
    """Seed realistic dummy data for instant hackathon demo (100% Free)"""
    farm_id = str(uuid.uuid4())
    mock_farm = {
        "id": farm_id,
        "user_name": "Demo Farmer",
        "user_email": "demo@farmex.com",
        "location": "Ludhiana, Punjab",
        "soil_type": "Loamy",
        "total_area": 12.5,
        "current_crops": ["Wheat", "Mustard"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await safe_insert("farms", mock_farm)
    
    # Create dummy expenses for charts
    expense_doc = ExpenseRequest(farm_id=farm_id, seed_cost=15000, fertilizer_cost=12000, pesticide_cost=5000, labor_cost=20000, irrigation_cost=8000, other_costs=3000, expected_yield=250, crop_name="Wheat")
    await calculate_expense_profit(expense_doc)
    
    return {"message": "Demo data seeded successfully! Dashboard is ready.", "farm_id": farm_id}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
