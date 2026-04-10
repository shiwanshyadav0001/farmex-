# Farmex - AI-Powered Agricultural Platform 🌾

**Farmex** is a comprehensive full-stack AI-powered web platform designed to help farmers make data-driven agricultural decisions without relying on IoT devices or hardware.


## 🚀 Features

Farmex includes **10+ powerful AI-powered features** for modern farming:

### 1. ☀️ Real-time Weather Forecast Dashboard
- Current weather conditions for any location
- 7-day weather forecast with detailed metrics
- Temperature, humidity, wind speed, and rainfall data
- Beautiful weather visualizations

### 2. 🌱 AI Crop Recommendation System
- Smart crop suggestions based on soil type, season, and location
- AI-powered analysis using GPT-5.2
- Weather-based recommendations
- Expected yield estimates and growing tips

### 3. 💧 Smart Irrigation Planner
- Automated irrigation schedules based on crop type and weather
- Water quantity recommendations
- 7-day irrigation planning
- Optimized water usage strategies

### 4. 🦠 AI Disease Detection via Image Upload
- Upload plant images for instant disease identification
- AI-powered image analysis using GPT Vision
- Treatment recommendations
- Prevention measures and severity assessment

### 5. 📈 Market Price Prediction
- AI-powered price forecasts for agricultural commodities
- 3-month price trend analysis
- Market trend predictions (rising/stable/falling)
- Best time to sell recommendations

### 6. 🗺️ Geo-based Soil and Rainfall Insights
- Regional soil type information
- Rainfall pattern analysis
- Monsoon timing predictions
- Water retention characteristics

### 7. 📅 Automated Farming Calendar
- Complete crop lifecycle management
- Planting to harvest timeline
- Activity scheduling with dates
- Task priorities and reminders

### 8. ⚠️ Risk Prediction Engine
- Comprehensive risk analysis (weather, disease, market, operational)
- Risk mitigation strategies
- Overall risk scoring
- Real-time weather integration

### 9. 🎤 Voice-enabled Multilingual Assistant
- AI-powered chat assistant for instant farming help
- Multilingual support (English, Hindi)
- Context-aware responses
- Natural language interaction

### 10. 💰 Expense & Profit Estimator
- Detailed expense tracking (seeds, fertilizers, labor, etc.)
- Profit margin calculations
- ROI analysis
- Break-even analysis and recommendations

### 11. 🚜 Farm Management
- Create and manage multiple farm profiles
- Store farm details (location, soil type, area, crops)
- Track farm operations
- Centralized farm data management

---

## 🏗️ Technology Stack

### Backend
- **Framework:** FastAPI (Python)
- **Database:** MongoDB (Motor async driver)
- **AI Integration:** 
  - OpenAI GPT
  - Image analysis using GPT Vision
- **Weather API:** OpenWeatherMap
- **Authentication:** None (open platform)

### Frontend
- **Framework:** React 19
- **Routing:** React Router v7
- **Styling:** Tailwind CSS 3.4
- **UI Components:** Radix UI (shadcn/ui)
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Charts:** Recharts

---

## 📁 Project Structure

```
/app/
├── backend/
│   ├── server.py           # FastAPI application with all endpoints
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main app with navigation
│   │   ├── App.css        # Global styles
│   │   ├── pages/         # All feature pages
│   │   │   ├── Dashboard.js
│   │   │   ├── Weather.js
│   │   │   ├── CropRecommendation.js
│   │   │   ├── Irrigation.js
│   │   │   ├── DiseaseDetection.js
│   │   │   ├── MarketPrice.js
│   │   │   ├── SoilInsights.js
│   │   │   ├── FarmingCalendar.js
│   │   │   ├── RiskAnalysis.js
│   │   │   ├── VoiceAssistant.js
│   │   │   ├── ExpenseCalculator.js
│   │   │   └── FarmManagement.js
│   │   └── components/    # Reusable UI components
│   ├── package.json
│   └── .env              # Frontend environment variables
└── README.md
```

---

## 🔧 Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB
- Yarn package manager

### Backend Setup

1. **Install Python dependencies:**
```bash
cd /app/backend
pip install -r requirements.txt
```

2. **Configure environment variables:**
```bash
# /app/backend/.env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
CORS_ORIGINS="*"
OPENAI_API_KEY=sk-proj-hse...
OPENWEATHERMAP_API_KEY=your_key_here  # Get free key from openweathermap.org
```

3. **Start the backend:**
```bash
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend Setup

1. **Install dependencies:**
```bash
cd /app/frontend
yarn install
```

2. **Configure environment variables:**
```bash
# /app/frontend/.env
REACT_APP_BACKEND_URL=https://your-backend-url.com
```

3. **Start the frontend:**
```bash
yarn start
```

---

## 🌐 API Endpoints

### Farm Management
- `GET /api/` - API welcome message
- `POST /api/farm/create` - Create new farm
- `GET /api/farms` - List all farms
- `GET /api/farm/{farm_id}` - Get farm details

### Weather
- `GET /api/weather/current?location={city}` - Current weather
- `GET /api/weather/forecast?location={city}` - 7-day forecast

### AI-Powered Features
- `POST /api/crop/recommend` - Get crop recommendations
- `POST /api/irrigation/plan` - Generate irrigation schedule
- `POST /api/disease/detect` - Detect plant diseases (image upload)
- `POST /api/market/predict` - Predict market prices
- `GET /api/soil/insights?location={city}` - Soil and rainfall insights
- `POST /api/calendar/generate` - Generate farming calendar
- `POST /api/risk/analyze` - Comprehensive risk analysis
- `POST /api/chat/assistant` - AI chat assistant
- `POST /api/expense/calculate` - Calculate expenses and profit

---

## 🎨 UI/UX Features

- **Professional Agricultural Theme:** Green and earth-tone gradients
- **Responsive Design:** Works on desktop, tablet, and mobile
- **Intuitive Navigation:** Collapsible sidebar with icons
- **Loading States:** Smooth loading animations
- **Error Handling:** User-friendly error messages
- **Data Visualization:** Charts and graphs for insights
- **File Upload:** Drag-and-drop image upload for disease detection
- **Form Validation:** Client-side validation for all inputs

---

## 🔑 API Keys & Credentials

### OpenAI API Key
The platform uses **OpenAI API Key** for all AI integrations:
- **Key:** `sk-proj...`
- **Works with:** GPT-4V, and other OpenAI models

### OpenWeatherMap API
Get your free API key:
1. Sign up at [openweathermap.org](https://openweathermap.org)
2. Navigate to API Keys section
3. Copy your API key
4. Add to `/app/backend/.env`

**Free Tier Limits:** 60 calls/minute, unlimited daily calls

---

## 🧪 Testing

### Backend API Testing
```bash
# Test API connection
curl http://localhost:8001/api/

# Create a farm
curl -X POST http://localhost:8001/api/farm/create \
  -H "Content-Type: application/json" \
  -d '{
    "user_name": "John Doe",
    "location": "Mumbai",
    "soil_type": "Loamy",
    "total_area": 10.5,
    "current_crops": ["Rice", "Wheat"]
  }'

# Get weather
curl "http://localhost:8001/api/weather/current?location=Mumbai"
```

### Frontend Testing
The application includes `data-testid` attributes for automated testing:
- Dashboard: `dashboard-page`, `features-grid`, `get-started-btn`
- Weather: `weather-page`, `weather-location-input`, `fetch-weather-btn`
- And more for all features...

---

## 🚀 Deployment

The application is production-ready and can be deployed to:
- **Backend:** Any server supporting Python/FastAPI (Railway, Render, AWS, etc.)
- **Frontend:** Vercel, Netlify, AWS S3, etc.
- **Database:** MongoDB Atlas (cloud) or self-hosted

**Important Notes:**
- Set proper CORS origins in production
- Use HTTPS for all endpoints
- Secure API keys using environment variables
- Configure proper MongoDB access controls

---

## 📊 Database Schema

### Collections

**farms**
```javascript
{
  id: String,
  user_name: String,
  location: String,
  latitude: Float (optional),
  longitude: Float (optional),
  soil_type: String,
  total_area: Float,
  current_crops: Array<String>,
  created_at: DateTime
}
```

**crop_recommendations**
```javascript
{
  id: String,
  location: String,
  soil_type: String,
  season: String,
  recommendation: String (AI response),
  timestamp: DateTime
}
```

**disease_detections**
```javascript
{
  id: String,
  filename: String,
  detection_result: String (AI response),
  timestamp: DateTime
}
```

**irrigation_schedules**, **price_predictions**, **farming_calendars**, **risk_analyses**, **expenses** follow similar patterns.

---

## 🤝 Contributing

This is a production-ready MVP. Future enhancements could include:
- User authentication and authorization
- Real-time notifications
- Mobile app (React Native)
- Integration with farm IoT devices
- Advanced analytics dashboard
- Multi-language support
- PDF export for reports

---

## 📄 License

This project is built as an MVP demonstration.

---

## 🙏 Acknowledgments

- **OpenAI** for AI-powered features
- **OpenWeatherMap** for weather data
- **shadcn/ui** for beautiful UI components
- **Tailwind CSS** for styling

---

## 📞 Support

For issues or questions:
1. Check the API documentation above
2. Review error logs in `/var/log/supervisor/`
3. Ensure all environment variables are set correctly
4. Verify MongoDB is running
5. Check that all services are running: `sudo supervisorctl status`

---

## 🎯 Quick Start Commands

```bash
# Check service status
sudo supervisorctl status

# Restart services
sudo supervisorctl restart backend
sudo supervisorctl restart frontend
sudo supervisorctl restart all

# View logs
tail -f /var/log/supervisor/backend.err.log
tail -f /var/log/supervisor/frontend.err.log

# Test APIs
curl http://localhost:8001/api/
curl http://localhost:8001/api/farms
```

---

**Built with ❤️ for farmers using AI-powered technology**

🌾 **Farmex** - Making agriculture smarter, one farm at a time.
