import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Cloud,
  DollarSign,
  Droplets,
  Map,
  Mic,
  ShieldCheck,
  Sprout,
  Tractor,
  Zap,
  TrendingUp,
  Leaf,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import axios from 'axios';
import { API } from '@/lib/api';
import { motion, useMotionValue, useTransform, useSpring, useInView } from 'framer-motion';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Sector
} from 'recharts';

import TiltCard from '@/components/motion/TiltCard';
import MagneticButton from '@/components/motion/MagneticButton';
import RevealOnScroll from '@/components/motion/RevealOnScroll';

const FarmScene = lazy(() => import('@/components/3d/FarmScene'));

const features = [
  {
    icon: Cloud,
    title: 'Weather Forecast',
    description: 'Current conditions and forecast support for location-based farm planning.',
    path: '/weather',
    accent: 'from-sky-500 to-cyan-400',
    glow: 'rgba(56, 189, 248, 0.15)',
  },
  {
    icon: Sprout,
    title: 'Crop Recommendation',
    description: 'AI-assisted crop suggestions based on location, soil, season, and area.',
    path: '/crop-recommendation',
    accent: 'from-emerald-500 to-lime-400',
    glow: 'rgba(52, 211, 153, 0.15)',
  },
  {
    icon: Droplets,
    title: 'Irrigation Planner',
    description: 'Water scheduling tools to help optimize irrigation and farm resource use.',
    path: '/irrigation',
    accent: 'from-cyan-500 to-blue-500',
    glow: 'rgba(6, 182, 212, 0.15)',
  },
  {
    icon: Map,
    title: 'Soil Insights',
    description: 'Regional soil and rainfall insights for better field-level decisions.',
    path: '/soil-insights',
    accent: 'from-amber-500 to-orange-400',
    glow: 'rgba(245, 158, 11, 0.15)',
  },
  {
    icon: ShieldCheck,
    title: 'Risk Analysis',
    description: 'Weather, disease, market, and operational risk review for each farm.',
    path: '/risk-analysis',
    accent: 'from-orange-500 to-red-500',
    glow: 'rgba(249, 115, 22, 0.15)',
  },
  {
    icon: Mic,
    title: 'Voice Assistant',
    description: 'Simple assistant flow for quick agricultural guidance in English, Hindi, and Marathi.',
    path: '/voice-assistant',
    accent: 'from-pink-500 to-rose-500',
    glow: 'rgba(236, 72, 153, 0.15)',
  },
];

const quickLinks = [
  { icon: Tractor, label: 'Farm Management', path: '/farm-management' },
  { icon: Calendar, label: 'Farming Calendar', path: '/farming-calendar' },
  { icon: DollarSign, label: 'Expense Calculator', path: '/expense-calculator' },
];

/* ─── Animated Counter ─── */
function AnimatedCounter({ value, duration = 2, suffix = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = parseInt(value);
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─── Animated Gradient Border ─── */
function GradientBorder({ children, className = '' }) {
  return (
    <div className={`relative group ${className}`}>
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute -inset-[1px] rounded-[29px] opacity-0 group-hover:opacity-40 transition-opacity duration-500"
        style={{
          background: 'conic-gradient(from 0deg, #4ade80, #22c55e, #059669, #06b6d4, #4ade80)',
        }}
      />
      {children}
    </div>
  );
}

function Dashboard() {
  const { t, language } = useTranslation();
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePieIndex, setActivePieIndex] = useState(-1);
  const [activeBarIndex, setActiveBarIndex] = useState(-1);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const cropData = useMemo(() => {
    const counts = {};
    farms.forEach(farm => {
      const crops = Array.isArray(farm.current_crops) ? farm.current_crops : [];
      crops.forEach(c => {
        counts[c] = (counts[c] || 0) + 1;
      });
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [farms]);

  const areaData = useMemo(() => {
    return farms.map(farm => ({
      name: farm.location || 'Unnamed Farm',
      area: parseFloat(farm.total_area) || 0,
      crops: Array.isArray(farm.current_crops) ? farm.current_crops : []
    }));
  }, [farms]);

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    try {
      const profile = JSON.parse(localStorage.getItem('farmex-profile') || '{}');
      if (profile.email) {
        const response = await axios.get(`${API}/farms`, { params: { user_email: profile.email } });
        setFarms(response.data.farms || []);
      }
    } catch (err) {
      console.error('Failed to fetch farms:', err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#fcfdfa] dark:bg-[#020617] transition-colors duration-500" data-testid="dashboard-page">
      {/* ═══ HERO SECTION ═══ */}
      <section className="relative min-h-[500px] overflow-hidden border-b border-emerald-100/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 dark:bg-slate-950">
        {/* 3D Immersive Background */}
        <div className="absolute inset-0 z-0">
          <Suspense fallback={<div className="absolute inset-0 bg-emerald-50 dark:bg-emerald-900/20 dark:bg-slate-950 animate-pulse" />}>
            <FarmScene farmCount={farms.length} activeCategory="general" />
          </Suspense>
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 z-[1] opacity-30 dark:opacity-10 [background-image:linear-gradient(rgba(16,185,129,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(6,95,70,0.08)_1px,transparent_1px)] [background-size:68px_68px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 sm:px-8 sm:py-14">
          <RevealOnScroll direction="up" stagger={0.15}>
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <motion.div
                className="inline-flex items-center gap-2 rounded-full border border-emerald-200 dark:border-emerald-800/50 bg-white dark:bg-slate-900/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-emerald-800 dark:text-emerald-300 shadow-sm"
                whileHover={{ scale: 1.05 }}
              >
                <Tractor className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                {t('Farmex AI Agriculture Platform')}
              </motion.div>

            </div>
          </RevealOnScroll>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-8 w-8 text-emerald-500 rounded-full border-4 border-emerald-200 dark:border-emerald-800/50 border-t-emerald-600"
              />
            </div>
          ) : farms.length > 0 ? (
            <RevealOnScroll direction="depth" stagger={0.2}>
              <div className="grid items-start gap-6 lg:grid-cols-2">
                {/* ═══ CROP DISTRIBUTION REDESIGN ═══ */}
                <TiltCard maxTilt={3} className="rounded-[32px] relative z-20 shadow-2xl min-h-[350px]">
                  <div className="rounded-[32px] border border-emerald-100/50 dark:border-slate-800 bg-white dark:bg-slate-900/80 backdrop-blur-md p-6 shadow-xl overflow-hidden relative">
                    <h2 className="text-xl font-black text-slate-900 dark:text-slate-50 mb-6 flex items-center gap-2">
                      <Sprout className="h-5 w-5 text-emerald-500" />
                      {t('Crop Distribution')}
                    </h2>
                    
                    <div className="grid gap-6 md:grid-cols-[1fr_120px]">
                      <div className="h-[250px] relative">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                          <PieChart>
                            <Pie 
                              activeIndex={activePieIndex}
                              activeShape={{ outerRadius: 90 }}
                              data={cropData} 
                              cx="50%" 
                              cy="50%" 
                              innerRadius={65} 
                              outerRadius={80} 
                              paddingAngle={4} 
                              dataKey="value"
                              onMouseEnter={(_, index) => setActivePieIndex(index)}
                              onMouseMove={(_, index) => { if(activePieIndex !== index) setActivePieIndex(index); }}
                              onMouseLeave={() => setActivePieIndex(-1)}
                            >
                              {cropData.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={COLORS[index % COLORS.length]} 
                                  stroke={activePieIndex === index ? '#4ade80' : 'none'}
                                  strokeWidth={3}
                                />
                              ))}
                            </Pie>
                            <RechartsTooltip content={() => null} />
                          </PieChart>
                        </ResponsiveContainer>
                        {/* High-Contrast Hole Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="text-center">
                            {activePieIndex >= 0 && cropData[activePieIndex] ? (
                              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} key={activePieIndex}>
                                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 leading-none">
                                  {cropData[activePieIndex].value}
                                </div>
                                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-300 uppercase mt-1">{t('Farms')}</div>
                              </motion.div>
                            ) : (
                              <div className="text-slate-300 dark:text-slate-600">
                                <Leaf className="h-6 w-6 mx-auto opacity-30" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Analysis Side-Panel (Crop) */}
                      <div className="flex flex-col justify-center border-l border-emerald-50 dark:border-slate-800/50 pl-4 h-[250px]">
                        <div className="text-[10px] font-bold text-emerald-600/50 dark:text-emerald-400/30 uppercase tracking-[2px] mb-2">{t('Details')}</div>
                        {activePieIndex >= 0 && cropData[activePieIndex] ? (
                          <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
                            <div>
                              <div className="text-xl font-black text-slate-900 dark:text-slate-50 leading-tight">{cropData[activePieIndex].name}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-300 mt-1">{t('Total representation across your holdings.')}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[activePieIndex % COLORS.length] }} />
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                {((cropData[activePieIndex].value / farms.length) * 100).toFixed(0)}% {t('Coverage')}
                              </span>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="text-sm text-slate-400 italic leading-relaxed">
                            {t('Move cursor over sectors for deep-dive analysis.')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TiltCard>

                {/* ═══ FARM ACREAGE REDESIGN ═══ */}
                <TiltCard maxTilt={3} className="rounded-[32px] relative z-20 shadow-2xl min-h-[350px]">
                  <div className="rounded-[32px] border border-emerald-100/50 dark:border-slate-800 bg-white dark:bg-slate-900/80 backdrop-blur-md p-6 shadow-xl overflow-hidden">
                    <h2 className="text-xl font-black text-slate-900 dark:text-slate-50 mb-6 flex items-center gap-2">
                      <Tractor className="h-5 w-5 text-emerald-500" />
                      {t('Acreage Analysis')}
                    </h2>
                    
                    <div className="grid gap-6 md:grid-cols-[1fr_120px]">
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                          <BarChart 
                            data={areaData}
                            onMouseMove={(state) => {
                              if (state.activeTooltipIndex !== undefined) {
                                setActiveBarIndex(state.activeTooltipIndex);
                              }
                            }}
                            onMouseLeave={() => setActiveBarIndex(-1)}
                          >
                            <XAxis dataKey="name" hide />
                            <Bar dataKey="area" isAnimationActive={false}>
                              {areaData.map((entry, index) => (
                                <Cell 
                                  key={`cell-bar-${index}`} 
                                  fill={activeBarIndex === index ? '#10b981' : 'rgba(16,185,129,0.2)'}
                                  className="transition-all duration-300"
                                  radius={[4, 4, 0, 0]}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Analysis Side-Panel (Farm) */}
                      <div className="flex flex-col justify-center border-l border-emerald-50 dark:border-slate-800/50 pl-4 h-[250px]">
                        <div className="text-[10px] font-bold text-emerald-600/50 dark:text-emerald-400/30 uppercase tracking-[2px] mb-2">{t('Status')}</div>
                        {activeBarIndex >= 0 && areaData[activeBarIndex] ? (
                          <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-3">
                            <div>
                              <div className="text-lg font-black text-slate-900 dark:text-slate-50 truncate max-w-[120px]" title={areaData[activeBarIndex].name}>
                                {areaData[activeBarIndex].name}
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-300 font-bold uppercase mt-1">{areaData[activeBarIndex].area} {t('Acres')}</div>
                            </div>
                            <div className="pt-2">
                              <div className="text-[9px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest mb-1">{t('Produce')}</div>
                              <div className="flex flex-wrap gap-1">
                                {areaData[activeBarIndex].crops.slice(0, 3).map((c, i) => (
                                  <span key={i} className="text-[9px] font-bold text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/40 dark:bg-emerald-950 px-1.5 py-0.5 rounded-md">
                                    {c}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="text-sm text-slate-400 italic leading-relaxed">
                            {t('Inspecting farm land area and yields.')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </div>
            </RevealOnScroll>
          ) : (
            <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
              <RevealOnScroll direction="left" stagger={0.12}>
                <div>
                  <motion.h1
                    className="max-w-4xl text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl"
                    data-testid="dashboard-title"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {t('Smarter farm decisions with weather, soil, crop, and risk insights in one place')}
                  </motion.h1>
                  <motion.p
                    className="mt-4 max-w-3xl text-base leading-7 text-slate-700 dark:text-slate-300 dark:text-slate-400"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {t('Farmex helps farmers plan crops, manage water, study risks, organize farm records, and get practical guidance through a clean and simple interface.')}
                  </motion.p>

                  <motion.div
                    className="mt-6 flex flex-wrap gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <MagneticButton strength={0.3} radius={120}>
                      <Link
                        to="/farm-management"
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] relative overflow-hidden"
                        data-testid="get-started-btn"
                      >
                        <motion.div
                          animate={{ x: ['-200%', '200%'] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12"
                        />
                        <span className="relative z-10">{t('Get Started')}</span>
                        <ArrowRight className="relative z-10 h-4 w-4" />
                      </Link>
                    </MagneticButton>

                    <MagneticButton strength={0.2} radius={100}>
                      <Link
                        to="/weather"
                        className="inline-flex items-center gap-2 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 dark:text-slate-100 transition hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                        data-testid="check-weather-btn"
                      >
                        {t('Check Weather')}
                        <Cloud className="h-4 w-4" />
                      </Link>
                    </MagneticButton>
                  </motion.div>
                </div>
              </RevealOnScroll>

              {farms.length === 0 && (
                <RevealOnScroll direction="right" delay={0.3}>
                  <TiltCard maxTilt={10}>
                    <div className="rounded-[24px] border border-emerald-100 dark:border-slate-800 bg-white dark:bg-slate-900/90 backdrop-blur-sm p-5 shadow-xl">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">{t('Core Platform Coverage')}</h2>
                      <div className="mt-5 space-y-3">
                        {[
                          t('Decision support with crop recommendation and farm planning'),
                          t('Resource optimization through irrigation and expense tools'),
                          t('Integrated weather, soil, and crop-related insights'),
                          t('Rural-friendly flows with simple forms and voice assistant'),
                        ].map((item, i) => (
                          <motion.div
                            key={item}
                            className="flex items-start gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                          >
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                            <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">{item}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </TiltCard>
                </RevealOnScroll>
              )}
            </div>
          )}

          {/* Stats strip */}
          {!loading && (
            <RevealOnScroll direction="up" delay={0.4}>
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Active Farms', value: farms.length || 12, icon: Leaf, suffix: '+' },
                  { label: 'Crop Types', value: cropData.length || 8, icon: Sprout, suffix: '+' },
                  { label: 'AI Insights', value: 150, icon: Zap, suffix: '+' },
                  { label: 'Uptime', value: 99, icon: TrendingUp, suffix: '%' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    className="rounded-xl border border-emerald-100 dark:border-slate-800 bg-white dark:bg-slate-900/70 backdrop-blur-sm p-3 text-center"
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ scale: 1.05, y: -4 }}
                  >
                    <stat.icon className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
                    <div className="text-xl font-black text-slate-900 dark:text-slate-50">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-300 mt-1 font-medium">{t(stat.label)}</div>
                  </motion.div>
                ))}
              </div>
            </RevealOnScroll>
          )}
        </div>
      </section>

      {/* ═══ BENTO GRID FEATURES ═══ */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
        <RevealOnScroll direction="up">
          <div className="mb-12 text-center lg:text-left">
            <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-50" data-testid="features-heading">
              {t('Agricultural OS Ecosystem')}
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-slate-700 dark:text-slate-300">
              {t('A cinematic suite of tools designed to maximize farm yield and minimize operation risks through deep tech integration.')}
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-6 lg:grid-rows-2" data-testid="features-grid">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            // Bento logic
            const isLarge = i === 0 || i === 4;
            const colSpan = isLarge ? 'lg:col-span-3' : 'lg:col-span-2';

            return (
              <RevealOnScroll key={feature.title} direction="depth" delay={i * 0.1} className={colSpan}>
                <Link to={feature.path} className="block h-full group">
                  <TiltCard maxTilt={10} glareColor={feature.glow} className="h-full">
                    <div className="flex flex-col h-full rounded-[32px] border border-white/40 dark:border-white/5 bg-white dark:bg-slate-900/40 backdrop-blur-xl p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] transition-all group-hover:shadow-[0_8px_32px_0_rgba(16,185,129,0.15)] group-hover:bg-white dark:bg-slate-900/60 dark:group-hover:bg-slate-900/60 overflow-hidden relative">
                      {/* Background glow */}
                      <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full blur-[60px] opacity-20 bg-gradient-to-br ${feature.accent}`} />
                      
                      <motion.div
                        className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.accent} shadow-lg`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <Icon className="h-7 w-7 text-white" />
                      </motion.div>
                      
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">{t(feature.title)}</h3>
                        <p className="mt-3 text-base leading-relaxed text-slate-700 dark:text-slate-300">{t(feature.description)}</p>
                      </div>

                      <div className="mt-8 flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 transition-colors group-hover:text-emerald-500">
                          {t('Explore Module')}
                          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-2" />
                        </div>
                        
                        {isLarge && (
                          <div className="h-1 w-24 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-emerald-50 dark:bg-emerald-900/200" 
                              initial={{ width: 0 }}
                              whileInView={{ width: '60%' }}
                              transition={{ duration: 1, delay: 0.5 }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </TiltCard>
                </Link>
              </RevealOnScroll>
            );
          })}
        </div>
      </section>

      {/* ═══ QUICK ACCESS SECTION ═══ */}
      <section className="mx-auto max-w-7xl px-6 pb-10 sm:px-8">
        <RevealOnScroll direction="up" delay={0.2}>
          <div className="rounded-[24px] border border-emerald-100 dark:border-slate-800 bg-white dark:bg-slate-900/90 backdrop-blur-sm p-6 shadow-sm relative overflow-hidden">
            {/* Subtle gradient overlay for depth */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-gradient-to-br from-emerald-400/10 via-transparent to-cyan-400/10 rounded-[24px]" />

            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{t('Quick access')}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                  {t('Jump directly into the modules most useful for setting up and validating the product.')}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {quickLinks.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                    >
                      <MagneticButton strength={0.25} radius={80} showParticles={false}>
                        <Link
                          to={item.path}
                          className="inline-flex min-w-[200px] items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-4 py-3 text-sm text-slate-900 dark:text-slate-50 dark:text-slate-200 transition hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:bg-emerald-900/20 dark:hover:bg-slate-800 hover:shadow-lg"
                        >
                          <span className="inline-flex items-center gap-3">
                            <Icon className="h-5 w-5 text-emerald-600" />
                            {t(item.label)}
                          </span>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </MagneticButton>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </section>
    </div>
  );
}

export default Dashboard;
