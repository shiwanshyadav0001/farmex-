import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/lib/api';
import { CheckCircle2, DollarSign, PieChart, TrendingUp } from 'lucide-react';
import ResultRenderer from '@/components/ResultRenderer';
import LiveFeatureScene from '@/components/motion/LiveFeatureScene';
import { EmptyFeatureState, FeaturePanel, MetricTile, StatusBadge } from '@/components/feature/InsightPrimitives';

function formatCurrency(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '--';
  return `Rs ${amount.toFixed(2)}`;
}

function ExpenseCalculator() {
  const [farms, setFarms] = useState([]);
  const [formData, setFormData] = useState({
    farm_id: '',
    crop_name: '',
    seed_cost: '',
    fertilizer_cost: '',
    pesticide_cost: '',
    labor_cost: '',
    irrigation_cost: '',
    other_costs: '',
    expected_yield: '',
  });
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    try {
      const response = await axios.get(`${API}/farms`);
      setFarms(response.data.farms);
    } catch (err) {
      console.error('Failed to fetch farms:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAnalysis(null);

    const payload = {
      ...formData,
      seed_cost: parseFloat(formData.seed_cost),
      fertilizer_cost: parseFloat(formData.fertilizer_cost),
      pesticide_cost: parseFloat(formData.pesticide_cost),
      labor_cost: parseFloat(formData.labor_cost),
      irrigation_cost: parseFloat(formData.irrigation_cost),
      other_costs: parseFloat(formData.other_costs),
      expected_yield: parseFloat(formData.expected_yield),
    };

    try {
      const response = await axios.post(`${API}/expense/calculate`, payload);
      setAnalysis(response.data);
    } catch (err) {
      setError('Failed to calculate expenses. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalExpenses =
    parseFloat(formData.seed_cost || 0) +
    parseFloat(formData.fertilizer_cost || 0) +
    parseFloat(formData.pesticide_cost || 0) +
    parseFloat(formData.labor_cost || 0) +
    parseFloat(formData.irrigation_cost || 0) +
    parseFloat(formData.other_costs || 0);

  const finance = analysis?.analysis || {};
  const costBreakdown = [
    { label: 'Seeds', value: Number(formData.seed_cost || 0) },
    { label: 'Fertilizer', value: Number(formData.fertilizer_cost || 0) },
    { label: 'Pesticides', value: Number(formData.pesticide_cost || 0) },
    { label: 'Labor', value: Number(formData.labor_cost || 0) },
    { label: 'Irrigation', value: Number(formData.irrigation_cost || 0) },
    { label: 'Other', value: Number(formData.other_costs || 0) },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#07180f] via-[#0a2617] to-[#103b22] p-6 text-white" data-testid="expense-calculator-page">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 fade-in">
          <LiveFeatureScene type="expense" totalExpenses={totalExpenses} formData={formData} analysis={analysis} />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="card fade-in">
            <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-200 dark:text-gray-100">Expense Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-200">Select Farm</label>
                <select
                  value={formData.farm_id}
                  onChange={(e) => setFormData({ ...formData, farm_id: e.target.value })}
                  className="select-field"
                  required
                  data-testid="expense-farm-select"
                >
                  <option value="">Choose a farm</option>
                  {farms.map((farm) => (
                    <option key={farm.id} value={farm.id}>
                      {farm.user_name} - {farm.location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-200">Crop Name</label>
                <input
                  type="text"
                  value={formData.crop_name}
                  onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
                  placeholder="Enter crop name"
                  className="input-field"
                  required
                  data-testid="expense-crop-input"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  ['seed_cost', 'Seed Cost', 'expense-seed-input'],
                  ['fertilizer_cost', 'Fertilizer Cost', 'expense-fertilizer-input'],
                  ['pesticide_cost', 'Pesticide Cost', 'expense-pesticide-input'],
                  ['labor_cost', 'Labor Cost', 'expense-labor-input'],
                  ['irrigation_cost', 'Irrigation Cost', 'expense-irrigation-input'],
                  ['other_costs', 'Other Costs', 'expense-other-input'],
                ].map(([key, label, testId]) => (
                  <div key={key}>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-200">{label} (Rs)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData[key]}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      placeholder="0.00"
                      className="input-field"
                      required
                      data-testid={testId}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-200">Expected Yield (quintals)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.expected_yield}
                  onChange={(e) => setFormData({ ...formData, expected_yield: e.target.value })}
                  placeholder="0.0"
                  className="input-field"
                  required
                  data-testid="expense-yield-input"
                />
              </div>

              <div className="rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-200">Total Expenses:</span>
                  <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(totalExpenses)}</span>
                </div>
              </div>

              {error && <p className="text-sm text-red-600" data-testid="expense-error">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex w-full items-center justify-center gap-2"
                data-testid="calculate-expense-btn"
              >
                <PieChart className="h-5 w-5" />
                {loading ? 'Calculating...' : 'Calculate Profit'}
              </button>
            </form>
          </div>

          <div className="card fade-in" data-testid="expense-analysis-display">
            <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-200 dark:text-gray-100">Financial Analysis</h2>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <TrendingUp className="mb-4 h-16 w-16 animate-pulse text-emerald-600" />
                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-300">Analyzing financial projections...</p>
              </div>
            ) : analysis ? (
              <div className="space-y-6">
                <FeaturePanel
                  tone="emerald"
                  title="Financial projection complete"
                  subtitle="Same expense inputs now return the same analysis, so your profit planning no longer shifts between clicks."
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge tone="emerald">Stable output</StatusBadge>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ROI signal generated
                    </div>
                  </div>
                </FeaturePanel>

                {(finance.price_per_quintal || finance.total_revenue || finance.profit) ? (
                  <>
                    <div className="grid gap-3 md:grid-cols-2">
                      <MetricTile tone="emerald" label="Total expenses" value={formatCurrency(analysis.total_expenses)} />
                      <MetricTile tone="emerald" label="Price per quintal" value={finance.price_per_quintal || '--'} />
                      <MetricTile tone="emerald" label="Total revenue" value={finance.total_revenue || '--'} />
                      <MetricTile tone={String(finance.profit || '').includes('-') ? 'orange' : 'emerald'} label="Profit" value={finance.profit || '--'} />
                      <MetricTile tone="emerald" label="Profit margin" value={finance.profit_margin || '--'} />
                      <MetricTile tone="emerald" label="ROI" value={finance.roi || '--'} />
                    </div>

                    <FeaturePanel tone="emerald" title="Cost stack" subtitle="Your live input costs are shown as a real breakdown instead of disappearing behind the result box.">
                      <div className="space-y-3">
                        {costBreakdown.map((item) => (
                          <div key={item.label} className="grid gap-2 md:grid-cols-[120px_1fr_auto] md:items-center">
                            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{item.label}</div>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-lime-500"
                                style={{ width: `${totalExpenses > 0 ? Math.max(4, (item.value / totalExpenses) * 100) : 0}%` }}
                              />
                            </div>
                            <div className="text-sm font-bold text-slate-900 dark:text-slate-50">{formatCurrency(item.value)}</div>
                          </div>
                        ))}
                      </div>
                    </FeaturePanel>

                    <div className="grid gap-4">
                      {finance.breakeven_yield ? (
                        <FeaturePanel tone="emerald" title="Break-even point">
                          <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">{finance.breakeven_yield}</p>
                        </FeaturePanel>
                      ) : null}

                      {Array.isArray(finance.recommendations) ? (
                        <FeaturePanel tone="emerald" title="Recommendations">
                          <div className="space-y-3">
                            {finance.recommendations.map((item, index) => (
                              <div key={`${item}-${index}`} className="rounded-2xl border border-emerald-100 bg-white dark:bg-slate-900 px-4 py-4 text-sm leading-7 text-slate-700 dark:text-slate-300">
                                {item}
                              </div>
                            ))}
                          </div>
                        </FeaturePanel>
                      ) : finance.recommendations ? (
                        <FeaturePanel tone="emerald" title="Recommendations">
                          <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">{finance.recommendations}</p>
                        </FeaturePanel>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <FeaturePanel tone="emerald">
                    <ResultRenderer data={finance} />
                  </FeaturePanel>
                )}
              </div>
            ) : (
              <EmptyFeatureState
                icon={DollarSign}
                title="Turn costs into a profit view"
                description="Enter expenses and expected yield to see revenue, margin, ROI, break-even, and action recommendations in a clearer finance layout."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpenseCalculator;
