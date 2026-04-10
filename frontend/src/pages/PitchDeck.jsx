import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Printer, Share2, Award, Zap, Cpu, Target, Layers, BookOpen } from 'lucide-react';
import MagneticButton from '@/components/motion/MagneticButton';

const slides = [
  {
    id: 'intro',
    title: 'Problem Statement Title',
    content: (
      <div className="space-y-6 text-2xl font-medium">
        <div className="flex items-center gap-4 border-l-4 border-amber-400 pl-6">
          <span className="text-amber-400 font-black">•</span>
          <span>Track: 3 RURAL INNOVATION & AGRITECH</span>
        </div>
        <div className="flex items-center gap-4 border-l-4 border-amber-400 pl-6">
          <span className="text-amber-400 font-black">•</span>
          <span>PS ID: 301</span>
        </div>
        <div className="flex items-center gap-4 border-l-4 border-amber-400 pl-6">
          <span className="text-amber-400 font-black">•</span>
          <span>Team Name: GlitchWave</span>
        </div>
        <div className="flex items-center gap-4 border-l-4 border-amber-400 pl-6">
          <span className="text-amber-400 font-black">•</span>
          <span>Team Leader name: Jitesh Kanojiya</span>
        </div>
      </div>
    ),
    image: 'https://images.unsplash.com/photo-1464822759023-fed62272b3ee?auto=format&fit=crop&q=80&w=1920',
  },
  {
    id: 'solution',
    title: 'IDEA TITLE: Farmex Agri-OS',
    content: (
      <div className="space-y-8">
        <h2 className="text-4xl font-black text-white underline decoration-amber-400 decoration-4 underline-offset-8">Proposed Solution :</h2>
        <p className="text-2xl leading-relaxed text-slate-300">
          Farmex is a full-stack <span className="text-amber-400 font-bold">AI-powered web platform</span> designed to help farmers make data-driven agricultural decisions <span className="text-emerald-400 font-bold">without relying on IoT devices</span> or expensive hardware.
        </p>
        <div className="grid grid-cols-2 gap-6 mt-8">
          {[
            'Market Price Predictions', 'Real-time Soil Health',
            'Automated Irrigation Planning', 'AI Disease Detection',
            'Pest Advisory & Mitigation', 'Dynamic Farming Calendar'
          ].map((feat, i) => (
            <div key={i} className="flex items-center gap-3 bg-white dark:bg-slate-900/5 p-4 rounded-2xl border border-white/10">
              <Zap className="text-amber-400 h-6 w-6" />
              <span className="text-xl font-bold">{feat}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1920',
  },
  {
    id: 'tech',
    title: 'Technical Approach',
    content: (
      <div className="grid grid-cols-2 gap-12">
        <div className="space-y-8">
          <section>
            <h3 className="text-amber-400 text-xl font-black tracking-widest uppercase mb-4">Frontend</h3>
            <ul className="text-xl space-y-2 text-slate-200">
              <li>• React.js / Vite (High Performance)</li>
              <li>• Tailwind CSS (Glassmorphic UI)</li>
              <li>• Three.js (3D Farm Visualizations)</li>
              <li>• Progressive Web App (PWA)</li>
            </ul>
          </section>
          <section>
            <h3 className="text-amber-400 text-xl font-black tracking-widest uppercase mb-4">Database</h3>
            <ul className="text-xl space-y-2 text-slate-200">
              <li>• MongoDB Atlas (Scale-out)</li>
              <li>• Vector Embeddings for AI Search</li>
              <li>• Real-time Caching (Redis ready)</li>
            </ul>
          </section>
        </div>
        <div className="space-y-8">
          <section>
            <h3 className="text-amber-400 text-xl font-black tracking-widest uppercase mb-4">Backend</h3>
            <ul className="text-xl space-y-2 text-slate-200">
              <li>• FastAPI (Python Backend)</li>
              <li>• Asynchronous Task Queues</li>
              <li>• Secure JWT Authentication</li>
            </ul>
          </section>
          <section>
            <h3 className="text-amber-400 text-xl font-black tracking-widest uppercase mb-4">AI / ML Models</h3>
            <ul className="text-xl space-y-2 text-slate-200">
              <li>• OpenAI GPT-4 Fine-tuned</li>
              <li>• CNN (Plant Disease Classification)</li>
              <li>• ARIMA/LSTM (Price Forecasting)</li>
            </ul>
          </section>
        </div>
      </div>
    ),
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1920',
  },
  {
    id: 'viability',
    title: 'Feasibility & Viability',
    content: (
      <div className="grid grid-cols-2 gap-12">
        <div className="space-y-8">
          <section>
            <h3 className="text-amber-400 text-xl font-black tracking-widest uppercase mb-4">Feasibility</h3>
            <p className="text-xl text-slate-300 leading-relaxed"> No dependency on hardware devices. Uses existing public APIs and government datasets. Easily deployable as a global web app.</p>
          </section>
          <section>
            <h3 className="text-amber-400 text-xl font-black tracking-widest uppercase mb-4">Solutions</h3>
            <p className="text-xl text-slate-300 leading-relaxed"> API fallback caching for low bandwidth. Offline-first PWA design for rural accessibility. Lightweight architecture.</p>
          </section>
        </div>
        <div className="space-y-8">
          <section>
            <h3 className="text-amber-400 text-xl font-black tracking-widest uppercase mb-4">Potential Challenges</h3>
            <p className="text-xl text-slate-300 leading-relaxed"> API data uptime, dataset quality variations across regions, and initial user digital literacy.</p>
          </section>
          <section>
            <h3 className="text-amber-400 text-xl font-black tracking-widest uppercase mb-4">Scalability</h3>
            <p className="text-xl text-slate-300 leading-relaxed"> Modular microservices architecture allowing easy expansion into New Agri-Segments (e.g., Livestock).</p>
          </section>
        </div>
      </div>
    ),
  },
  {
    id: 'impact',
    title: 'Impact & Benefits',
    content: (
      <div className="grid grid-cols-3 gap-8">
        <div className="bg-white dark:bg-slate-900/5 p-6 rounded-[32px] border border-white/10">
          <Award className="text-amber-400 h-10 w-10 mb-4" />
          <h3 className="text-2xl font-black mb-4">Social</h3>
          <p className="text-slate-400 text-lg leading-relaxed">Digital empowerment, multilingual support, and accessibility for low-literacy users.</p>
        </div>
        <div className="bg-white dark:bg-slate-900/5 p-6 rounded-[32px] border border-white/10">
          <Zap className="text-emerald-400 h-10 w-10 mb-4" />
          <h3 className="text-2xl font-black mb-4">Environmental</h3>
          <p className="text-slate-400 text-lg leading-relaxed">Water conservation through smart irrigation and reduced resource wastage.</p>
        </div>
        <div className="bg-white dark:bg-slate-900/5 p-6 rounded-[32px] border border-white/10">
          <Target className="text-blue-400 h-10 w-10 mb-4" />
          <h3 className="text-2xl font-black mb-4">Economic</h3>
          <p className="text-slate-400 text-lg leading-relaxed">Increased farmer income through better market timing and yield optimization.</p>
        </div>
      </div>
    ),
  },
  {
    id: 'references',
    title: 'References & Tech Stack',
    content: (
      <div className="grid grid-cols-2 gap-12 text-xl">
        <div className="space-y-6">
          <h3 className="text-amber-400 font-black tracking-widest uppercase">Key APIs</h3>
          <ul className="space-y-2 text-slate-300">
            <li>• OpenWeather API (Climate)</li>
            <li>• Agmarknet (Market Mandi Data)</li>
            <li>• SoilGrids (Global Datasets)</li>
            <li>• Government Agri Portals</li>
          </ul>
        </div>
        <div className="space-y-6">
          <h3 className="text-amber-400 font-black tracking-widest uppercase">Tech Stack</h3>
          <ul className="space-y-2 text-slate-300">
            <li>• Frontend: React / Vite / Framer Motion</li>
            <li>• Backend: FastAPI / Python</li>
            <li>• Database: MongoDB / Atlas</li>
            <li>• AI: OpenAI / scikit-learn</li>
          </ul>
        </div>
      </div>
    ),
  }
];

export default function PitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="pitch-deck-container min-h-screen p-8 flex flex-col items-center justify-center">
      {/* Presentation Controls */}
      <div className="print-controls fixed top-6 right-6 z-50 flex gap-4">
        <MagneticButton onClick={() => window.print()} className="bg-white dark:bg-slate-900/10 hover:bg-white dark:bg-slate-900/20 p-4 rounded-full text-white backdrop-blur-xl border border-white/20">
          <Printer className="h-6 w-6" />
        </MagneticButton>
      </div>

      <div className="slide-content relative bg-slate-950 flex flex-col p-20 select-none">
        {/* Header Overlay (Same as PDF) */}
        <div className="absolute top-0 left-0 right-0 p-10 flex justify-between items-center z-10 slide-header">
          <div className="flex items-center gap-4">
            <div className="bg-white dark:bg-slate-900 p-2 rounded-full">
               <img src="https://upload.wikimedia.org/wikipedia/en/2/2e/Shree_L._R._Tiwari_College_of_Engineering_Logo.png" alt="Logo" className="h-12 w-12 object-contain" />
            </div>
            <div>
              <h1 className="text-white font-black text-xl leading-none">SHREE L.R. TIWARI</h1>
              <p className="text-white/60 text-[10px] tracking-[0.3em] font-medium mt-1">College of Engineering</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-amber-400 font-black text-3xl italic tracking-tighter">NEO FUTURE</h2>
          </div>
        </div>

        {/* Slide Body */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slides[currentSlide].id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="flex-1 flex flex-col justify-center mt-20"
          >
            <h2 className="slide-title-glitch text-5xl font-black mb-12 border-b border-amber-400/30 pb-4 inline-block">
              {slides[currentSlide].title}
            </h2>
            <div className="relative z-10 max-w-4xl">
              {slides[currentSlide].content}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Watermark / Background Texture */}
        <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
          {slides[currentSlide].image && (
            <img src={slides[currentSlide].image} className="absolute inset-0 w-full h-full object-cover blur-sm" alt="Bg" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        {/* Footer info */}
        <div className="absolute bottom-10 left-10 right-10 flex justify-between items-center text-white/30 text-sm font-medium tracking-widest uppercase">
          <span>{currentSlide + 1} / {slides.length}</span>
          <span>Farmex Agri-Tech OS • Continuous Innovation</span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="print-controls mt-10 flex gap-8">
        <MagneticButton onClick={prevSlide} className="bg-white dark:bg-slate-900/5 hover:bg-emerald-50 dark:bg-emerald-900/200/20 p-6 rounded-full text-white border border-white/10 transition-colors">
          <ChevronLeft className="h-8 w-8" />
        </MagneticButton>
        <MagneticButton onClick={nextSlide} className="bg-emerald-50 dark:bg-emerald-900/200 p-6 rounded-full text-white shadow-[0_0_30px_rgba(16,185,129,0.5)] transform hover:scale-110 transition-transform">
          <ChevronRight className="h-8 w-8" />
        </MagneticButton>
      </div>
    </div>
  );
}
