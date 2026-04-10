import { useTranslation } from '@/i18n';

function labelize(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatPrimitiveValue(value) {
  if (typeof value === 'string') {
    if (value === 'local-model') {
      return 'Farmex AI';
    }
    if (value === 'fallback') {
      return 'Farmex AI Fallback';
    }
  }
  return String(value);
}

function PrimitiveValue({ value }) {
  const { translateString } = useTranslation();
  const displayValue = typeof value === 'string' ? translateString(value) : String(value);
  return <span className="text-sm leading-7 text-slate-700">{formatPrimitiveValue(displayValue)}</span>;
}

function ResultNode({ label, value, depth = 0 }) {
  const { translateLabel } = useTranslation();
  const translatedLabel = label ? translateLabel(label) || labelize(label) : null;

  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return null;
    }

    const primitiveItems = value.every(
      (item) => item === null || ['string', 'number', 'boolean'].includes(typeof item)
    );

    return (
      <div className={depth === 0 ? 'space-y-3' : 'space-y-2'}>
        {translatedLabel && <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{translatedLabel}</h4>}
        {primitiveItems ? (
          <div className="flex flex-wrap gap-2">
            {value.map((item, index) => (
              <span
                key={`${label}-${index}`}
                className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800"
              >
                {String(item)}
              </span>
            ))}
          </div>
        ) : (
          <div className="grid gap-3">
            {value.map((item, index) => (
              <div key={`${label}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <ResultNode value={item} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value).filter(([, childValue]) => childValue !== null && childValue !== undefined && childValue !== '');
    if (entries.length === 0) {
      return null;
    }

    return (
      <div className={depth === 0 ? 'space-y-4' : 'space-y-3'}>
        {translatedLabel && <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{translatedLabel}</h4>}
        <div className={depth === 0 ? 'space-y-4' : 'space-y-3'}>
          {entries.map(([childKey, childValue]) => {
            const isPrimitive = childValue === null || ['string', 'number', 'boolean'].includes(typeof childValue);

            if (isPrimitive) {
              return (
                <div key={childKey} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{translateLabel(childKey) || labelize(childKey)}</div>
                  <div className="mt-2">
                    <PrimitiveValue value={childValue} />
                  </div>
                </div>
              );
            }

            return <ResultNode key={childKey} label={childKey} value={childValue} depth={depth + 1} />;
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      {translatedLabel && <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{translatedLabel}</div>}
      <div className="mt-2">
        <PrimitiveValue value={value} />
      </div>
    </div>
  );
}

function ResultRenderer({ data }) {
  if (data === null || data === undefined || data === '') {
    return null;
  }

  if (typeof data === 'string') {
    return <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{data}</div>;
  }

  return <ResultNode value={data} />;
}

export default ResultRenderer;
