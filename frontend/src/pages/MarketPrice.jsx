import { useState } from 'react';
import axios from 'axios';
import { API } from '@/lib/api';
import { BarChart3, CheckCircle2, Loader, TrendingUp } from 'lucide-react';
import ResultRenderer from '@/components/ResultRenderer';
import LiveFeatureScene from '@/components/motion/LiveFeatureScene';
import { EmptyFeatureState, FeaturePanel, MetricTile, StatusBadge, renderValue } from '@/components/feature/InsightPrimitives';

function trendTone(trend = '') {
  const value = String(trend).toLowerCase();
  if (value.includes('rise') || value.includes('up')) return 'emerald';
  if (value.includes('fall') || value.includes('down')) return 'orange';
  return 'violet';
}

function MarketPrice() {
  const [formData, setFormData] = useState({
    crop_name: '',
    location: '',
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const popularCrops = ['Rice', 'Wheat', 'Corn', 'Cotton', 'Sugarcane', 'Soybean', 'Potato', 'Tomato', 'Onion', 'Tea'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPrediction(null);

    try {
      const response = await axios.post(`${API}/market/predict`, formData);
      setPrediction(response.data);
    } catch (err) {
      setError('Failed to predict market prices. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const market = prediction?.prediction || {};
  const forecast = Array.isArray(market.forecast) ? market.forecast : [];
  const tone = trendTone(market.trend);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#12081b] via-[#1b102d] to-[#291340] p-6 text-white" data-testid="market-price-page">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 fade-in">
          <LiveFeatureScene type="market" formData={formData} prediction={prediction} />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="card fade-in">
            <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-200 dark:text-gray-100">Market Analysis</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-200">Crop Name</label>
                <input
                  type="text"
                  value={formData.crop_name}
                  onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
                  placeholder="Enter crop name"
                  className="input-field"
                  list="crop-suggestions"
                  required
                  data-testid="market-crop-input"
                />
                <datalist id="crop-suggestions">
                  {popularCrops.map((crop) => (
                    <option key={crop} value={crop} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-200">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter your location"
                  className="input-field"
                  required
                  data-testid="market-location-input"
                />
              </div>

              <div className="rounded-lg border border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-900/20 p-4">
                <h3 className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200 dark:text-gray-100">Popular Crops:</h3>
                <div className="flex flex-wrap gap-2">
                  {popularCrops.map((crop) => (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => setFormData({ ...formData, crop_name: crop })}
                      className="rounded-full border border-blue-300 bg-white dark:bg-slate-900 px-3 py-1 text-sm text-gray-700 dark:text-gray-300 transition-colors hover:bg-blue-100"
                    >
                      {crop}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-red-600" data-testid="market-error">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex w-full items-center justify-center gap-2"
                data-testid="predict-market-price-btn"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Analyzing Market...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-5 w-5" />
                    Predict Prices
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="card fade-in" data-testid="market-prediction-display">
            <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-200 dark:text-gray-100">Price Forecast</h2>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader className="mb-4 h-16 w-16 animate-spin text-purple-600" />
                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-300">Analyzing market trends...</p>
              </div>
            ) : prediction ? (
              <div className="space-y-6">
                <FeaturePanel
                  tone="violet"
                  title={`Market signal for ${prediction.crop}`}
                  subtitle="Same crop and location now return the same prediction, so price planning does not jump around between clicks."
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge tone="violet">Stable output</StatusBadge>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <CheckCircle2 className="h-4 w-4 text-violet-600" />
                      Market trend analysis ready
                    </div>
                  </div>
                </FeaturePanel>

                {market.current_price_range || forecast.length ? (
                  <>
                    <div className="grid gap-3 md:grid-cols-3">
                      <MetricTile tone="violet" label="Current range" value={market.current_price_range || '--'} hint="Estimated mandi range" />
                      <MetricTile tone={tone} label="Trend" value={market.trend || '--'} hint="Near-term outlook" />
                      <MetricTile tone="violet" label="Best action" value={market.recommendation ? 'Decision ready' : '--'} hint={formData.location || 'Waiting for location'} />
                    </div>

                    {forecast.length > 0 ? (
                      <FeaturePanel tone="violet" title="3-month forecast track" subtitle="Each month is shown as a forward-looking price pulse rather than plain JSON text.">
                        <div className="grid gap-4 md:grid-cols-3">
                          {forecast.map((item, index) => (
                            <div key={`${item.month}-${index}`} className="rounded-[28px] border border-violet-100 bg-white dark:bg-slate-900 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
                              <StatusBadge tone={trendTone(item.trend)}>{item.trend || 'stable'}</StatusBadge>
                              <h3 className="mt-3 text-2xl font-black text-slate-900 dark:text-slate-50">{item.month}</h3>
                              <div className="mt-3 text-lg font-bold text-slate-700 dark:text-slate-300">{renderValue(item.price_range) || '--'}</div>
                            </div>
                          ))}
                        </div>
                      </FeaturePanel>
                    ) : null}

                    <div className="grid gap-4">
                      {Array.isArray(market.factors) && market.factors.length > 0 ? (
                        <FeaturePanel tone="violet" title="Price drivers" subtitle="These are the strongest reasons behind the current market outlook.">
                          <div className="flex flex-wrap gap-2">
                            {market.factors.map((factor, index) => (
                              <StatusBadge key={`${factor}-${index}`} tone="violet">{factor}</StatusBadge>
                            ))}
                          </div>
                        </FeaturePanel>
                      ) : null}

                      {market.recommendation ? (
                        <FeaturePanel tone={tone} title="Sell recommendation" subtitle="Action guidance generated from the current price range and trend signal.">
                          <ResultRenderer data={market.recommendation} />
                        </FeaturePanel>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <FeaturePanel tone="violet">
                    <ResultRenderer data={market} />
                  </FeaturePanel>
                )}

                <FeaturePanel tone="amber" title="Planning note" subtitle="Market prices remain estimates, but the UI now presents them in a clearer decision-ready format.">
                  <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">Actual mandi prices can still vary by week, trader demand, arrivals, and weather-linked supply changes.</p>
                </FeaturePanel>
              </div>
            ) : (
              <EmptyFeatureState
                icon={BarChart3}
                title="Turn inputs into a live price outlook"
                description="Enter a crop and location to see current range, monthly direction, demand factors, and the best selling recommendation."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MarketPrice;
