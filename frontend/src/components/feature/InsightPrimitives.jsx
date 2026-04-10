function toneClasses(tone = 'emerald') {
  const tones = {
    emerald: {
      panel: 'border-emerald-200/50 bg-emerald-50/80 dark:bg-emerald-950/20 dark:border-emerald-900/40',
      badge: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-400',
      metric: 'border-emerald-100 bg-white dark:bg-slate-900 dark:border-slate-800',
    },
    cyan: {
      panel: 'border-cyan-200/50 bg-cyan-50/80 dark:bg-cyan-950/20 dark:border-cyan-900/40',
      badge: 'border-cyan-200 bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:border-cyan-800 dark:text-cyan-400',
      metric: 'border-cyan-100 bg-white dark:bg-slate-900 dark:border-slate-800',
    },
    amber: {
      panel: 'border-amber-200/50 bg-amber-50/80 dark:bg-amber-950/20 dark:border-amber-900/40',
      badge: 'border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-400',
      metric: 'border-amber-100 bg-white dark:bg-slate-900 dark:border-slate-800',
    },
    orange: {
      panel: 'border-orange-200/50 bg-orange-50/80 dark:bg-orange-950/20 dark:border-orange-900/40',
      badge: 'border-orange-200 bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:border-orange-800 dark:text-orange-400',
      metric: 'border-orange-100 bg-white dark:bg-slate-900 dark:border-slate-800',
    },
    rose: {
      panel: 'border-rose-200/50 bg-rose-50/80 dark:bg-rose-950/20 dark:border-rose-900/40',
      badge: 'border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-400',
      metric: 'border-rose-100 bg-white dark:bg-slate-900 dark:border-slate-800',
    },
    violet: {
      panel: 'border-violet-200/50 bg-violet-50/80 dark:bg-violet-950/20 dark:border-violet-900/40',
      badge: 'border-violet-200 bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:border-violet-800 dark:text-violet-400',
      metric: 'border-violet-100 bg-white dark:bg-slate-900 dark:border-slate-800',
    },
    slate: {
      panel: 'border-slate-200 bg-slate-50/80 dark:bg-slate-900/50 dark:border-slate-800',
      badge: 'border-slate-200 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      metric: 'border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800',
    },
  };

  return tones[tone] || tones.emerald;
}

export function FeaturePanel({ tone = 'emerald', title, subtitle, children, className = '' }) {
  const classes = toneClasses(tone);

  return (
    <section className={`rounded-[28px] border p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] ${classes.panel} ${className}`}>
      {title ? <h3 className="text-lg font-black text-slate-900 dark:text-white">{title}</h3> : null}
      {subtitle ? <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{subtitle}</p> : null}
      <div className={title || subtitle ? 'mt-4' : ''}>{children}</div>
    </section>
  );
}

export function renderValue(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    if (value.min !== undefined && value.max !== undefined) {
      return `${value.min} - ${value.max}`;
    }
    return JSON.stringify(value);
  }
  return String(value);
}

export function MetricTile({ label, value, hint, tone = 'emerald' }) {
  const classes = toneClasses(tone);

  return (
    <div className={`rounded-2xl border px-4 py-4 ${classes.metric}`}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-2 text-xl font-black text-slate-900 dark:text-white">{renderValue(value)}</div>
      {hint ? <div className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{hint}</div> : null}
    </div>
  );
}

export function StatusBadge({ children, tone = 'emerald' }) {
  const classes = toneClasses(tone);

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${classes.badge}`}>
      {renderValue(children)}
    </span>
  );
}

export function EmptyFeatureState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-8 py-16 text-center text-slate-500">
      {Icon ? <Icon className="h-16 w-16 text-slate-300 dark:text-slate-700" /> : null}
      <h3 className="mt-4 text-xl font-bold text-slate-700 dark:text-slate-200">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 dark:text-slate-400">{description}</p>
    </div>
  );
}
