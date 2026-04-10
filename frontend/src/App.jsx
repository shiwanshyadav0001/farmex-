import React, { useMemo, useState, useEffect, Component } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from '@/pages/Dashboard';
import Weather from '@/pages/Weather';
import CropRecommendation from '@/pages/CropRecommendation';
import Irrigation from '@/pages/Irrigation';
import DiseaseDetection from '@/pages/DiseaseDetection';
import MarketPrice from '@/pages/MarketPrice';
import SoilInsights from '@/pages/SoilInsights';
import FarmingCalendar from '@/pages/FarmingCalendar';
import RiskAnalysis from '@/pages/RiskAnalysis';
import VoiceAssistant from '@/pages/VoiceAssistant';
import ExpenseCalculator from '@/pages/ExpenseCalculator';
import FarmManagement from '@/pages/FarmManagement';
import Auth from '@/pages/Auth';
import PitchDeck from '@/pages/PitchDeck';
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  Cloud,
  DollarSign,
  Droplets,
  Bug,
  Home,
  Leaf,
  LineChart,
  Map,
  Menu,
  Mic,
  Sprout,
  Tractor,
  X,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';
import { LanguageProvider, useTranslation } from '@/i18n';
import { ThemeProvider, useTheme } from 'next-themes';

export { API } from '@/lib/api';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <motion.button
      whileHover={{ scale: 1.1, rotate: 15 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="flex items-center justify-center rounded-full border border-emerald-200 bg-white p-2 text-slate-800 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 glow-pulse"
      title="Toggle Dark Mode"
    >
      <AnimatePresence mode="wait">
        {theme === 'dark' ? (
          <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.3 }}>
            <Sun className="h-4 w-4 text-amber-400" />
          </motion.div>
        ) : (
          <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.3 }}>
            <Moon className="h-4 w-4 text-indigo-600" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

const menuItems = [
  { path: '/', icon: Home, label: 'Dashboard', hint: 'Overview' },
  { path: '/weather', icon: Cloud, label: 'Weather Forecast', hint: 'Live climate' },
  { path: '/crop-recommendation', icon: Sprout, label: 'Crop Recommendation', hint: 'AI crop fit' },
  { path: '/irrigation', icon: Droplets, label: 'Irrigation Planner', hint: 'Water planning' },
  { path: '/disease-detection', icon: Bug, label: 'Disease Detection', hint: 'Image diagnosis' },
  { path: '/market-price', icon: LineChart, label: 'Market Prices', hint: 'Price outlook' },
  { path: '/soil-insights', icon: Map, label: 'Soil & Rainfall', hint: 'Land intelligence' },
  { path: '/farming-calendar', icon: Calendar, label: 'Farming Calendar', hint: 'Season planning' },
  { path: '/risk-analysis', icon: AlertTriangle, label: 'Risk Analysis', hint: 'Farm risks' },
  { path: '/voice-assistant', icon: Mic, label: 'Voice Assistant', hint: 'Ask Farmex' },
  { path: '/expense-calculator', icon: DollarSign, label: 'Expense Calculator', hint: 'Profit view' },
  { path: '/farm-management', icon: Tractor, label: 'Farm Management', hint: 'Farm records' },
  { path: '/pitch-deck', icon: BookOpen, label: 'Pitch Deck', hint: 'Presentation' },
];

/* ─── Page Transition Wrapper ─── */
const pageVariants = {
  initial: {
    opacity: 0,
    y: 10,
    scale: 0.99,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 1.01,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* ─── Error Resilience ─── */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Farmex Crash:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-12 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/10 text-red-500">
            <AlertTriangle className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Interface Error</h2>
          <p className="mt-2 max-w-sm text-slate-500 dark:text-slate-400">
            A visual component failed to render correctly. This usually happens if data is missing or corrupted.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-8 rounded-full bg-emerald-500 px-8 py-3 font-bold text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AnimatedPage({ children }) {
  return (
    <ErrorBoundary>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ minHeight: '100%' }}
      >
        {children}
      </motion.div>
    </ErrorBoundary>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AnimatedPage><Dashboard /></AnimatedPage>} />
        <Route path="/weather" element={<AnimatedPage><Weather /></AnimatedPage>} />
        <Route path="/crop-recommendation" element={<AnimatedPage><CropRecommendation /></AnimatedPage>} />
        <Route path="/irrigation" element={<AnimatedPage><Irrigation /></AnimatedPage>} />
        <Route path="/disease-detection" element={<AnimatedPage><DiseaseDetection /></AnimatedPage>} />
        <Route path="/market-price" element={<AnimatedPage><MarketPrice /></AnimatedPage>} />
        <Route path="/soil-insights" element={<AnimatedPage><SoilInsights /></AnimatedPage>} />
        <Route path="/farming-calendar" element={<AnimatedPage><FarmingCalendar /></AnimatedPage>} />
        <Route path="/risk-analysis" element={<AnimatedPage><RiskAnalysis /></AnimatedPage>} />
        <Route path="/voice-assistant" element={<AnimatedPage><VoiceAssistant /></AnimatedPage>} />
        <Route path="/expense-calculator" element={<AnimatedPage><ExpenseCalculator /></AnimatedPage>} />
        <Route path="/farm-management" element={<AnimatedPage><FarmManagement /></AnimatedPage>} />
        <Route path="/pitch-deck" element={<AnimatedPage><PitchDeck /></AnimatedPage>} />
      </Routes>
    </AnimatePresence>
  );
}

function Navigation() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const { t, language, setLanguage, languages, locale } = useTranslation();

  const activePage = useMemo(
    () => menuItems.find((item) => item.path === location.pathname)?.label || 'Dashboard',
    [location.pathname]
  );

  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }).format(new Date()),
    [locale]
  );

  return (
    <div className="flex min-h-screen bg-[#f4f7f1] dark:bg-slate-950">
      <aside
        className={`${
          isSidebarOpen ? 'w-[296px]' : 'w-[88px]'
        } farmex-sidebar fixed inset-y-0 left-0 z-30 flex flex-col overflow-hidden transition-all duration-300`}
        data-testid="sidebar"
      >
        {/* Sidebar ambient glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute bottom-20 left-4 w-24 h-24 bg-lime-400/8 rounded-full blur-[50px] pointer-events-none" />

        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-3" data-testid="logo-section">
            <motion.div
              className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-300/20"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {/* Pulsing glow behind logo */}
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-2xl bg-emerald-400/20 blur-lg"
              />
              <Leaf className="relative h-6 w-6" />
            </motion.div>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-3xl font-black tracking-tight text-white">Farmex</h1>
                <p className="text-xs uppercase tracking-[0.26em] text-emerald-200/70">Agri Operating System</p>
              </motion.div>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9, rotate: 90 }}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="rounded-xl p-2 text-emerald-100 transition hover:bg-white/10"
            data-testid="sidebar-toggle-btn"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </motion.button>
        </div>

        {isSidebarOpen && (
          <motion.div
            className="mx-4 rounded-[28px] border border-white/10 bg-white/6 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-200/65">{t('Today')}</p>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-white">{t(activePage)}</p>
                <p className="text-sm text-emerald-100/70">{todayLabel}</p>
              </div>
              <motion.div
                className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {t('Live')}
                </span>
              </motion.div>
            </div>
          </motion.div>
        )}

        <nav className="mt-5 flex-1 space-y-1 overflow-y-auto px-3 pb-5" data-testid="navigation-menu">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  to={item.path}
                  className={`group flex items-center gap-3 rounded-2xl px-4 py-3 transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-400 to-lime-300 text-slate-950 shadow-xl shadow-emerald-500/20'
                      : 'text-emerald-50/90 hover:bg-white/8 hover:text-white'
                  }`}
                  data-testid={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <motion.div
                    className={`rounded-xl p-2 ${isActive ? 'bg-black/10' : 'bg-white/5 group-hover:bg-white/10'}`}
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.15 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Icon className="h-4 w-4" />
                  </motion.div>
                  {isSidebarOpen && (
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{t(item.label)}</div>
                      <div className={`truncate text-xs ${isActive ? 'text-slate-800/70' : 'text-emerald-100/55'}`}>
                        {t(item.hint)}
                      </div>
                    </div>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute right-3 h-2 w-2 rounded-full bg-slate-900"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {isSidebarOpen && (
          <motion.div
            className="m-4 mt-2 rounded-[24px] border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.03] p-4 relative overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Shimmer effect */}
            <motion.div
              animate={{ x: ['-200%', '200%'] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none"
            />
            <p className="relative text-sm font-semibold text-white">{t('Farm records, AI advice, weather, and risk tools in one place.')}</p>
          </motion.div>
        )}
      </aside>

      <div className={`flex min-h-screen flex-1 flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-[296px]' : 'ml-[88px]'}`}>
        <header className="sticky top-0 z-20 border-b border-emerald-100/70 bg-[#f4f7f1]/90 dark:bg-slate-950/90 dark:border-slate-800 backdrop-blur-xl">
          <div className="flex items-center justify-between px-6 py-4 sm:px-8">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-emerald-700/65 dark:text-emerald-400/80">{t('Farmex Workspace')}</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{t(activePage)}</h2>
            </motion.div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">{t('Language')}</label>
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition-all hover:border-emerald-400"
              >
                {languages.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.label}
                  </option>
                ))}
              </select>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  localStorage.removeItem('farmex-authenticated');
                  localStorage.removeItem('farmex-profile');
                  window.dispatchEvent(new Event('storage'));
                }}
                className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 tracking-tight transition-colors dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400 dark:hover:bg-red-900/30"
                title="Sign out of Farmex"
              >
                <LogOut className="h-4 w-4" />
                {t('Logout')}
              </motion.button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <AnimatedRoutes />
        </main>
      </div>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('farmex-authenticated') === 'true';
  });

  useEffect(() => {
    const checkAuthStatus = () => {
      setIsAuthenticated(localStorage.getItem('farmex-authenticated') === 'true');
    };
    window.addEventListener('storage', checkAuthStatus);
    return () => window.removeEventListener('storage', checkAuthStatus);
  }, []);

  if (!isAuthenticated) {
    return <Auth onAuthenticate={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="App dark:bg-slate-950 dark:text-slate-50 min-h-screen">
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <LanguageProvider>
          <BrowserRouter>
            <Navigation />
          </BrowserRouter>
        </LanguageProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;
