import { motion } from 'framer-motion';
import { AlertTriangle, Calendar, Droplets, Leaf, MapPin, Mic, Shield, Sprout, TrendingUp, Upload } from 'lucide-react';

function SceneShell({ accent = 'emerald', eyebrow, title, subtitle, children }) {
  const accents = {
    emerald: 'from-lime-200 via-white to-emerald-100',
    cyan: 'from-cyan-200 via-white to-sky-100',
    rose: 'from-rose-200 via-white to-orange-100',
    violet: 'from-fuchsia-200 via-white to-violet-100',
    amber: 'from-amber-200 via-white to-yellow-100',
    orange: 'from-orange-200 via-white to-red-100',
    pink: 'from-pink-200 via-white to-rose-100',
    teal: 'from-teal-200 via-white to-lime-100',
  };

  return (
    <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-black/20 px-6 py-8 shadow-[0_30px_110px_rgba(2,6,23,0.28)] sm:px-8 lg:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_22%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0))]" />
      <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
            {eyebrow}
          </div>
          <h1 className={`mt-5 max-w-xl bg-gradient-to-r ${accents[accent]} bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl`}>
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/72 sm:text-lg">{subtitle}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.75, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="relative h-[260px] overflow-hidden rounded-[30px] border border-white/10 bg-white/8 backdrop-blur-xl"
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}

function DataChip({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/40">
        {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-white/88">{value || '--'}</div>
    </div>
  );
}

function CropScene({ formData, recommendation }) {
  const areaValue = Number(formData.area || 0);
  const weather = recommendation?.weather_context;

  return (
    <SceneShell
      accent="emerald"
      eyebrow="Adaptive Crop Engine"
      title="Crop Recommendation"
      subtitle="Live agronomy cues respond to location, soil, season, area, and the current weather context."
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(101,163,13,0.12),transparent_38%),linear-gradient(90deg,rgba(132,204,22,0.08)_1px,transparent_1px),linear-gradient(rgba(132,204,22,0.08)_1px,transparent_1px)] bg-[size:100%_100%,56px_56px,56px_56px]" />
      <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-[#2b1e12]/80 via-[#314825]/45 to-transparent" />
      <motion.div className="absolute left-10 top-8 h-28 w-28 rounded-full border border-lime-200/25" animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 4, repeat: Infinity }}>
        <div className="absolute inset-4 rounded-full border border-lime-200/20" />
        <div className="absolute inset-8 rounded-full border border-lime-200/20" />
      </motion.div>
      <motion.div className="absolute left-28 top-20 h-20 w-[2px] bg-gradient-to-b from-lime-200/80 to-transparent" animate={{ scaleY: [0.7, 1.15, 0.7] }} transition={{ duration: 3.2, repeat: Infinity }} />
      {[0, 1, 2, 3].map((index) => (
        <motion.div
          key={index}
          className="absolute bottom-[32px] rounded-full bg-gradient-to-t from-lime-500/25 to-emerald-200/10"
          style={{ left: 150 + index * 42, width: 26, height: 58 + index * 18 }}
          animate={{ y: [0, -8 - index * 2, 0], rotate: [0, index % 2 === 0 ? 4 : -4, 0] }}
          transition={{ duration: 4 + index * 0.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      <div className="absolute inset-x-5 bottom-5 grid grid-cols-2 gap-3">
        <DataChip icon={MapPin} label="Location" value={formData.location || 'Waiting'} />
        <DataChip icon={Leaf} label="Soil" value={formData.soil_type} />
        <DataChip icon={Sprout} label="Season" value={formData.season} />
        <DataChip icon={Sprout} label="Area" value={areaValue ? `${areaValue} acres` : 'Not set'} />
      </div>
      {weather ? (
        <motion.div
          className="absolute right-5 top-5 rounded-[24px] border border-white/10 bg-black/28 px-4 py-4 text-white"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">Weather Sync</div>
          <div className="mt-2 text-3xl font-black">{Math.round(weather.temp)}°</div>
          <div className="mt-1 text-sm text-white/70">{weather.humidity}% humidity</div>
        </motion.div>
      ) : null}
    </SceneShell>
  );
}

function IrrigationScene({ formData, farms, irrigationPlan }) {
  const activeFarm = farms.find((farm) => String(farm.id) === String(formData.farm_id));
  const schedule = irrigationPlan?.irrigation_plan?.schedule || [];

  return (
    <SceneShell
      accent="cyan"
      eyebrow="Hydration Control Layer"
      title="Smart Irrigation Planner"
      subtitle="Water flow, rainfall risk, and crop scheduling are visualized in motion instead of static cards."
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(125,211,252,0.22),transparent_26%),linear-gradient(180deg,rgba(34,211,238,0.12),transparent_55%)]" />
      {[0, 1, 2, 3].map((index) => (
        <motion.div
          key={index}
          className="absolute left-0 right-0 h-px bg-cyan-200/35"
          style={{ top: 50 + index * 44 }}
          animate={{ x: ['-6%', '4%', '-6%'], opacity: [0.25, 0.75, 0.25] }}
          transition={{ duration: 4 + index, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      <motion.div className="absolute left-10 top-8 h-36 w-36 rounded-full border border-cyan-200/20" animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 5, repeat: Infinity }}>
        <div className="absolute inset-6 rounded-full border border-cyan-200/20" />
        <div className="absolute inset-12 rounded-full border border-cyan-200/20" />
      </motion.div>
      <div className="absolute right-6 top-6 grid w-[190px] gap-3">
        <DataChip icon={MapPin} label="Farm" value={activeFarm?.location || 'Select farm'} />
        <DataChip icon={Droplets} label="Crop" value={formData.crop_type || 'Waiting'} />
      </div>
      <div className="absolute inset-x-6 bottom-5">
        <div className="grid grid-cols-5 gap-2">
          {(schedule.length ? schedule.slice(0, 5) : new Array(5).fill(null)).map((day, index) => (
            <div key={index} className="rounded-2xl border border-white/10 bg-black/22 px-3 py-3">
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">{day?.date?.slice(5) || `Day ${index + 1}`}</div>
              <motion.div
                className="mt-3 h-16 rounded-full bg-gradient-to-t from-cyan-400/70 to-cyan-100/20"
                animate={{ scaleY: [0.45, day?.irrigate ? Math.max(0.35, Math.min(1, Number(day.water_quantity || 0) / 2500)) : 0.15, 0.45] }}
                transition={{ duration: 3.5 + index * 0.35, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: 'bottom' }}
              />
              <div className="mt-2 text-[10px] font-semibold text-white/75 truncate">{day?.irrigate ? `${day.water_quantity}L` : 'Skip'}</div>
            </div>
          ))}
        </div>
      </div>
    </SceneShell>
  );
}

function DiseaseScene({ preview, detection, loading }) {
  return (
    <SceneShell
      accent="rose"
      eyebrow="Diagnostic Scan Layer"
      title="Disease Detection"
      subtitle="The uploaded leaf becomes the live scene, with a moving scan beam and result-aware status overlay."
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(253,164,175,0.18),transparent_26%),linear-gradient(180deg,rgba(251,113,133,0.1),transparent_50%)]" />
      <div className="absolute inset-5 rounded-[28px] border border-white/10 bg-black/35 p-4">
        {preview ? (
          <div className="relative h-full overflow-hidden rounded-[22px] border border-white/10 bg-black/30">
            <img src={preview} alt="Plant preview" className="h-full w-full object-cover opacity-90" />
            <motion.div
              className="absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-emerald-300/40 to-transparent"
              animate={{ top: ['8%', '72%', '8%'] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="absolute inset-4 border border-emerald-200/35" />
            <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/55 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
              {loading ? 'Scanning image' : detection ? 'Scan complete' : 'Scan ready'}
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-[22px] border border-dashed border-white/15 bg-black/20 text-center text-white/60">
            <Upload className="h-14 w-14" />
            <p className="mt-4 max-w-[220px] text-sm leading-6">Upload a plant image and the detection scene will become live here.</p>
          </div>
        )}
      </div>
      <div className="absolute right-6 top-6 w-[190px] rounded-[24px] border border-white/10 bg-black/28 px-4 py-4 text-white">
        <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">Status Layer</div>
        <div className="mt-2 text-base font-semibold">{detection ? detection.filename : 'Awaiting image'}</div>
        <div className="mt-2 text-sm text-white/65">{loading ? 'AI is analyzing visual patterns' : detection ? 'Treatment-ready output generated' : 'No disease result yet'}</div>
      </div>
    </SceneShell>
  );
}

function MarketScene({ formData, prediction }) {
  const bars = [24, 42, 38, 56, 68, 74];
  return (
    <SceneShell
      accent="violet"
      eyebrow="Price Signal Layer"
      title="Market Price Prediction"
      subtitle="Trend motion should feel like price momentum, not just a decorated heading."
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(216,180,254,0.16),transparent_30%),linear-gradient(180deg,rgba(192,132,252,0.08),transparent_55%)]" />
      <svg className="absolute inset-x-6 top-10 h-[120px] w-[calc(100%-48px)]" viewBox="0 0 320 120" fill="none">
        <motion.path
          d="M0 100 C40 92 50 70 86 72 C120 74 140 36 182 40 C216 42 238 18 320 8"
          stroke="rgba(233,213,255,0.9)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0.1, opacity: 0.4 }}
          animate={{ pathLength: 1, opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
      <div className="absolute inset-x-6 bottom-5 grid grid-cols-6 gap-3">
        {bars.map((height, index) => (
          <div key={index} className="rounded-2xl border border-white/10 bg-black/24 px-2 py-3">
            <motion.div
              className="mx-auto w-full rounded-full bg-gradient-to-t from-fuchsia-500/75 to-violet-100/20"
              style={{ height }}
              animate={{ scaleY: [0.72, 1, 0.72] }}
              transition={{ duration: 3.6 + index * 0.25, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        ))}
      </div>
      <div className="absolute right-6 top-6 grid w-[200px] gap-3">
        <DataChip icon={TrendingUp} label="Crop" value={formData.crop_name || 'Waiting'} />
        <DataChip icon={MapPin} label="Location" value={formData.location || 'Waiting'} />
        <DataChip icon={TrendingUp} label="Analysis" value={prediction ? 'Live prediction ready' : 'Waiting for market run'} />
      </div>
    </SceneShell>
  );
}

function SoilScene({ location, insights }) {
  const weather = insights?.current_weather;
  return (
    <SceneShell
      accent="amber"
      eyebrow="Terrain Intelligence Layer"
      title="Soil & Rainfall Insights"
      subtitle="Contour lines, terrain depth, and rainfall memory should feel specific to land analysis."
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(253,186,116,0.18),transparent_26%),linear-gradient(180deg,rgba(251,191,36,0.08),transparent_55%)]" />
      {[0, 1, 2, 3].map((index) => (
        <motion.div
          key={index}
          className="absolute inset-x-8 rounded-full border border-amber-100/20"
          style={{ top: 28 + index * 42, height: 56 + index * 18 }}
          animate={{ x: [0, index % 2 === 0 ? 8 : -8, 0] }}
          transition={{ duration: 5 + index * 0.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      <div className="absolute left-6 bottom-5 grid w-[55%] grid-cols-2 gap-3">
        <DataChip icon={MapPin} label="Region" value={location || insights?.location || 'Waiting'} />
        <DataChip icon={Droplets} label="Rain/Weather" value={weather ? `${Math.round(weather.humidity)}% humidity` : 'No live context'} />
      </div>
      {weather ? (
        <motion.div className="absolute right-6 top-6 rounded-[24px] border border-white/10 bg-black/25 px-4 py-4" animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity }}>
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">Live climate</div>
          <div className="mt-2 text-3xl font-black text-white">{Math.round(weather.temp)}°</div>
          <div className="mt-1 text-sm text-white/65">{weather.humidity}% humidity</div>
        </motion.div>
      ) : null}
    </SceneShell>
  );
}

function CalendarScene({ formData, calendarData }) {
  const steps = [
    formData.planting_date || 'Planting',
    'Field prep',
    'Feeding',
    'Protection',
    calendarData ? 'Harvest path' : 'Harvest',
  ];
  return (
    <SceneShell
      accent="violet"
      eyebrow="Timeline Planning Layer"
      title="Farming Calendar"
      subtitle="This scene should feel like a schedule engine, with a living timeline instead of a repeated banner card."
    >
      <div className="absolute inset-x-8 top-1/2 h-[2px] -translate-y-1/2 bg-white/12" />
      <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 grid grid-cols-5 gap-2">
        {steps.map((step, index) => (
          <div key={step} className="relative">
            <motion.div className="mx-auto h-5 w-5 rounded-full bg-indigo-200 shadow-[0_0_20px_rgba(199,210,254,0.45)]" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2.2 + index * 0.3, repeat: Infinity }} />
            <div className="mt-5 text-center text-xs font-semibold uppercase tracking-[0.16em] text-white/70">{index + 1}</div>
            <div className="mt-2 text-center text-xs text-white/52">{step}</div>
          </div>
        ))}
      </div>
      <div className="absolute left-6 bottom-5 grid w-[52%] grid-cols-2 gap-3">
        <DataChip icon={Calendar} label="Crop" value={formData.crop_name || 'Waiting'} />
        <DataChip icon={Calendar} label="Area" value={formData.area ? `${formData.area} acres` : 'Waiting'} />
      </div>
    </SceneShell>
  );
}

function RiskScene({ selectedFarm, riskAnalysis }) {
  const weather = riskAnalysis?.weather_context;
  return (
    <SceneShell
      accent="orange"
      eyebrow="Threat Mapping Layer"
      title="Risk Prediction Engine"
      subtitle="Risk visuals should pulse like alerts, with weather-linked context and mitigation readiness."
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.22),transparent_24%),linear-gradient(180deg,rgba(249,115,22,0.08),transparent_55%)]" />
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="absolute left-12 top-10 rounded-full border border-orange-200/18"
          style={{ width: 72 + index * 48, height: 72 + index * 48 }}
          animate={{ scale: [0.92, 1.05, 0.92], opacity: [0.35, 0.8, 0.35] }}
          transition={{ duration: 3.4 + index * 0.4, repeat: Infinity }}
        />
      ))}
      <motion.div className="absolute left-[88px] top-[86px] h-6 w-6 rounded-full bg-orange-200 shadow-[0_0_20px_rgba(251,146,60,0.55)]" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2.2, repeat: Infinity }} />
      <div className="absolute right-6 top-6 grid w-[210px] gap-3">
        <DataChip icon={Shield} label="Farm" value={selectedFarm?.location || 'Choose farm'} />
        <DataChip icon={AlertTriangle} label="Engine" value={riskAnalysis ? 'Risk report ready' : 'Waiting for analysis'} />
        <DataChip icon={Droplets} label="Weather" value={weather ? `${Math.round(weather.temp)}° / ${weather.humidity}%` : 'No live weather'} />
      </div>
    </SceneShell>
  );
}

function VoiceScene({ languageLabel, isListening, chatCount }) {
  return (
    <SceneShell
      accent="pink"
      eyebrow="Reactive Voice Layer"
      title="Voice Assistant"
      subtitle="Voice mode should feel like an active signal system, reacting to listening state and conversation depth."
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,114,182,0.14),transparent_38%)]" />
      {[0, 1, 2, 3].map((index) => (
        <motion.div
          key={index}
          className="absolute left-1/2 top-1/2 rounded-full border border-pink-200/20"
          style={{ width: 56 + index * 42, height: 56 + index * 42, marginLeft: -(28 + index * 21), marginTop: -(28 + index * 21) }}
          animate={{ scale: isListening ? [0.94, 1.12, 0.94] : [1, 1.04, 1], opacity: [0.25, 0.8, 0.25] }}
          transition={{ duration: 1.5 + index * 0.3, repeat: Infinity }}
        />
      ))}
      <motion.div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-pink-300/85 text-slate-950 shadow-[0_0_30px_rgba(244,114,182,0.45)]" animate={{ scale: isListening ? [1, 1.14, 1] : [1, 1.03, 1] }} transition={{ duration: 1.6, repeat: Infinity }}>
        <Mic className="h-7 w-7" />
      </motion.div>
      <div className="absolute left-6 bottom-5 grid w-[54%] grid-cols-2 gap-3">
        <DataChip icon={Mic} label="Language" value={languageLabel} />
        <DataChip icon={Mic} label="State" value={isListening ? 'Listening live' : 'Standby'} />
        <DataChip icon={Mic} label="Messages" value={`${chatCount}`} />
      </div>
    </SceneShell>
  );
}

function ExpenseScene({ totalExpenses, formData, analysis }) {
  const categories = [
    Number(formData.seed_cost || 0),
    Number(formData.fertilizer_cost || 0),
    Number(formData.pesticide_cost || 0),
    Number(formData.labor_cost || 0),
    Number(formData.irrigation_cost || 0),
    Number(formData.other_costs || 0),
  ];
  const maxValue = Math.max(...categories, 1);

  return (
    <SceneShell
      accent="emerald"
      eyebrow="Financial Signal Layer"
      title="Expense & Profit Calculator"
      subtitle="Financial motion should react to real cost inputs so the scene feels connected to the working numbers."
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.14),transparent_24%)]" />
      <div className="absolute inset-x-6 bottom-5 grid grid-cols-6 gap-3">
        {categories.map((value, index) => (
          <div key={index} className="rounded-2xl border border-white/10 bg-black/24 px-2 py-3">
            <motion.div
              className="mx-auto w-full rounded-full bg-gradient-to-t from-emerald-500/75 to-lime-100/20"
              style={{ height: `${24 + (value / maxValue) * 92}px` }}
              animate={{ scaleY: [0.82, 1, 0.82] }}
              transition={{ duration: 3.4 + index * 0.25, repeat: Infinity }}
            />
          </div>
        ))}
      </div>
      <div className="absolute right-6 top-6 grid w-[220px] gap-3">
        <DataChip icon={TrendingUp} label="Crop" value={formData.crop_name || 'Waiting'} />
        <DataChip icon={TrendingUp} label="Expenses" value={`Rs ${totalExpenses.toFixed(2)}`} />
        <DataChip icon={TrendingUp} label="Analysis" value={analysis ? 'Projection ready' : 'Waiting for calculation'} />
      </div>
    </SceneShell>
  );
}

function FarmScene({ farms, showForm }) {
  return (
    <SceneShell
      accent="teal"
      eyebrow="Field Mapping Layer"
      title="Farm Management"
      subtitle="Farm management should feel spatial, with a map-grid mood and live portfolio counts."
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(45,212,191,0.08)_1px,transparent_1px),linear-gradient(rgba(45,212,191,0.08)_1px,transparent_1px)] bg-[size:54px_54px]" />
      {farms.slice(0, 4).map((farm, index) => (
        <motion.div
          key={farm.id}
          className="absolute rounded-full border border-teal-200/25 bg-teal-200/10"
          style={{ left: 50 + index * 58, top: 48 + (index % 2) * 62, width: 42 + index * 8, height: 42 + index * 8 }}
          animate={{ y: [0, -8, 0], x: [0, index % 2 === 0 ? 5 : -5, 0] }}
          transition={{ duration: 4 + index * 0.5, repeat: Infinity }}
        />
      ))}
      <div className="absolute right-6 top-6 grid w-[200px] gap-3">
        <DataChip icon={MapPin} label="Farms" value={`${farms.length}`} />
        <DataChip icon={Leaf} label="State" value={showForm ? 'Adding new farm' : 'Portfolio view'} />
      </div>
    </SceneShell>
  );
}

export default function LiveFeatureScene({ type, ...props }) {
  switch (type) {
    case 'crop':
      return <CropScene {...props} />;
    case 'irrigation':
      return <IrrigationScene {...props} />;
    case 'disease':
      return <DiseaseScene {...props} />;
    case 'market':
      return <MarketScene {...props} />;
    case 'soil':
      return <SoilScene {...props} />;
    case 'calendar':
      return <CalendarScene {...props} />;
    case 'risk':
      return <RiskScene {...props} />;
    case 'voice':
      return <VoiceScene {...props} />;
    case 'expense':
      return <ExpenseScene {...props} />;
    case 'farm':
      return <FarmScene {...props} />;
    default:
      return null;
  }
}
