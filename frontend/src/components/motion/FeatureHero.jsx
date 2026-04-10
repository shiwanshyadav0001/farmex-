import { motion } from 'framer-motion';

const orbSets = {
  crop: ['from-lime-300/30 to-emerald-500/10', 'from-emerald-300/20 to-teal-400/10', 'from-yellow-200/15 to-lime-300/10'],
  irrigation: ['from-cyan-300/30 to-blue-500/10', 'from-sky-300/20 to-cyan-400/10', 'from-blue-200/15 to-cyan-300/10'],
  disease: ['from-rose-300/28 to-red-500/10', 'from-amber-300/18 to-rose-400/10', 'from-red-200/15 to-orange-300/10'],
  market: ['from-fuchsia-300/28 to-violet-500/10', 'from-purple-300/20 to-pink-400/10', 'from-indigo-200/15 to-purple-300/10'],
  soil: ['from-amber-300/28 to-orange-500/10', 'from-orange-300/20 to-yellow-400/10', 'from-lime-200/15 to-amber-300/10'],
  calendar: ['from-indigo-300/28 to-violet-500/10', 'from-sky-300/20 to-indigo-400/10', 'from-purple-200/15 to-indigo-300/10'],
  risk: ['from-orange-300/28 to-red-500/10', 'from-yellow-300/20 to-orange-400/10', 'from-red-200/15 to-orange-300/10'],
  voice: ['from-pink-300/28 to-rose-500/10', 'from-fuchsia-300/20 to-pink-400/10', 'from-purple-200/15 to-pink-300/10'],
  expense: ['from-emerald-300/28 to-green-500/10', 'from-teal-300/20 to-emerald-400/10', 'from-lime-200/15 to-green-300/10'],
  farm: ['from-teal-300/28 to-green-500/10', 'from-green-300/20 to-lime-400/10', 'from-cyan-200/15 to-teal-300/10'],
};

const gridSets = {
  crop: 'rgba(132, 204, 22, 0.12)',
  irrigation: 'rgba(34, 211, 238, 0.12)',
  disease: 'rgba(251, 113, 133, 0.12)',
  market: 'rgba(168, 85, 247, 0.12)',
  soil: 'rgba(251, 146, 60, 0.12)',
  calendar: 'rgba(129, 140, 248, 0.12)',
  risk: 'rgba(251, 146, 60, 0.12)',
  voice: 'rgba(236, 72, 153, 0.12)',
  expense: 'rgba(16, 185, 129, 0.12)',
  farm: 'rgba(20, 184, 166, 0.12)',
};

const modePanels = {
  crop: [
    { label: 'Growth bands', width: 'w-40', top: 'top-8', left: 'left-10', rotate: '-rotate-6' },
    { label: 'Soil depth', width: 'w-32', top: 'top-28', right: 'right-16', rotate: 'rotate-6' },
    { label: 'Season fit', width: 'w-36', bottom: 'bottom-10', left: 'left-28', rotate: 'rotate-3' },
  ],
  irrigation: [
    { label: 'Flow pressure', width: 'w-40', top: 'top-10', left: 'left-10', rotate: '-rotate-6' },
    { label: 'Water cycles', width: 'w-36', top: 'top-32', right: 'right-12', rotate: 'rotate-6' },
    { label: 'Moisture pulse', width: 'w-44', bottom: 'bottom-10', left: 'left-20', rotate: '-rotate-3' },
  ],
  disease: [
    { label: 'Leaf scan', width: 'w-36', top: 'top-10', left: 'left-12', rotate: '-rotate-6' },
    { label: 'Pattern detect', width: 'w-40', top: 'top-28', right: 'right-12', rotate: 'rotate-6' },
    { label: 'Care signal', width: 'w-36', bottom: 'bottom-10', left: 'left-24', rotate: 'rotate-3' },
  ],
  market: [
    { label: 'Price beam', width: 'w-40', top: 'top-10', left: 'left-12', rotate: '-rotate-6' },
    { label: 'Demand pulse', width: 'w-36', top: 'top-28', right: 'right-10', rotate: 'rotate-6' },
    { label: 'Trend wave', width: 'w-44', bottom: 'bottom-10', left: 'left-24', rotate: '-rotate-3' },
  ],
  soil: [
    { label: 'Terrain layer', width: 'w-40', top: 'top-10', left: 'left-10', rotate: '-rotate-6' },
    { label: 'Rainfall band', width: 'w-36', top: 'top-28', right: 'right-10', rotate: 'rotate-6' },
    { label: 'Water hold', width: 'w-44', bottom: 'bottom-10', left: 'left-20', rotate: 'rotate-3' },
  ],
  calendar: [
    { label: 'Planting phase', width: 'w-44', top: 'top-10', left: 'left-10', rotate: '-rotate-6' },
    { label: 'Task rhythm', width: 'w-36', top: 'top-28', right: 'right-12', rotate: 'rotate-6' },
    { label: 'Harvest arc', width: 'w-40', bottom: 'bottom-10', left: 'left-24', rotate: '-rotate-3' },
  ],
  risk: [
    { label: 'Storm index', width: 'w-36', top: 'top-10', left: 'left-10', rotate: '-rotate-6' },
    { label: 'Heat alert', width: 'w-36', top: 'top-28', right: 'right-12', rotate: 'rotate-6' },
    { label: 'Mitigation path', width: 'w-44', bottom: 'bottom-10', left: 'left-24', rotate: 'rotate-3' },
  ],
  voice: [
    { label: 'Voice wave', width: 'w-36', top: 'top-10', left: 'left-10', rotate: '-rotate-6' },
    { label: 'Language orbit', width: 'w-40', top: 'top-28', right: 'right-12', rotate: 'rotate-6' },
    { label: 'Reply stream', width: 'w-44', bottom: 'bottom-10', left: 'left-24', rotate: '-rotate-3' },
  ],
  expense: [
    { label: 'Cost stack', width: 'w-36', top: 'top-10', left: 'left-10', rotate: '-rotate-6' },
    { label: 'Profit line', width: 'w-40', top: 'top-28', right: 'right-12', rotate: 'rotate-6' },
    { label: 'Return signal', width: 'w-44', bottom: 'bottom-10', left: 'left-24', rotate: 'rotate-3' },
  ],
  farm: [
    { label: 'Field grid', width: 'w-36', top: 'top-10', left: 'left-10', rotate: '-rotate-6' },
    { label: 'Map pin', width: 'w-32', top: 'top-28', right: 'right-12', rotate: 'rotate-6' },
    { label: 'Crop map', width: 'w-44', bottom: 'bottom-10', left: 'left-24', rotate: 'rotate-3' },
  ],
};

export default function FeatureHero({
  title,
  subtitle,
  mode = 'crop',
  icon: Icon,
  accent = 'from-emerald-300 via-white to-lime-100',
  badge = 'Premium Feature Mode',
}) {
  const orbs = orbSets[mode] || orbSets.crop;
  const panels = modePanels[mode] || modePanels.crop;
  const gridColor = gridSets[mode] || gridSets.crop;

  return (
    <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-black/20 px-6 py-8 shadow-[0_30px_110px_rgba(2,6,23,0.28)] sm:px-8 lg:px-10">
      <div className="absolute inset-0 opacity-60" style={{ backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`, backgroundSize: '56px 56px' }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0))]" />

      {orbs.map((orb, index) => (
        <motion.div
          key={orb}
          className={`absolute rounded-full bg-gradient-to-br ${orb} blur-3xl`}
          style={{
            width: index === 0 ? 220 : index === 1 ? 160 : 120,
            height: index === 0 ? 220 : index === 1 ? 160 : 120,
            top: index === 0 ? -40 : index === 1 ? 70 : 'auto',
            right: index === 0 ? -30 : index === 1 ? 140 : 30,
            bottom: index === 2 ? -20 : 'auto',
            left: index === 2 ? 40 : 'auto',
          }}
          animate={{ y: [0, -18, 0], x: [0, index === 0 ? -14 : 10, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 6 + index, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
            {Icon ? <Icon className="h-4 w-4" /> : null}
            {badge}
          </span>
          <h1 className={`mt-5 max-w-xl bg-gradient-to-r ${accent} bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl`}>
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/72 sm:text-lg">
            {subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20, rotateX: 10, rotateY: -8 }}
          animate={{ opacity: 1, x: 0, rotateX: 0, rotateY: 0 }}
          transition={{ duration: 0.8, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="relative h-[240px] perspective-1500"
        >
          <div className="absolute inset-0 preserve-3d">
            {panels.map((panel, index) => (
              <motion.div
                key={panel.label}
                className={`absolute ${panel.width} ${panel.top || ''} ${panel.bottom || ''} ${panel.left || ''} ${panel.right || ''} ${panel.rotate || ''} rounded-[28px] border border-white/12 bg-white/10 p-4 text-white/85 backdrop-blur-2xl shadow-[0_18px_60px_rgba(2,6,23,0.28)] preserve-3d`}
                animate={{
                  y: [0, index % 2 === 0 ? -12 : 10, 0],
                  rotateX: [0, index % 2 === 0 ? 6 : -5, 0],
                  rotateY: [0, index % 2 === 0 ? -7 : 7, 0],
                }}
                transition={{ duration: 5 + index, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">Motion Layer</div>
                <div className="mt-3 text-sm font-semibold">{panel.label}</div>
                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-white/85 to-white/35"
                    initial={{ width: '28%' }}
                    animate={{ width: ['28%', index % 2 === 0 ? '82%' : '66%', '28%'] }}
                    transition={{ duration: 4 + index, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
