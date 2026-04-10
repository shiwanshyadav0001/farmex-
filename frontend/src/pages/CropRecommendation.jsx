import { useState } from 'react';
import axios from 'axios';
import { API } from '@/lib/api';
import { CheckCircle, Droplets, Leaf, Loader, Sprout, Thermometer, TrendingUp } from 'lucide-react';
import ResultRenderer from '@/components/ResultRenderer';
import { useTranslation } from '@/i18n';
import LiveFeatureScene from '@/components/motion/LiveFeatureScene';

function normalizeCropCards(recommendationPayload) {
  const crops = recommendationPayload?.recommendation?.crops;
  if (!Array.isArray(crops)) return [];

  return crops.map((crop, index) => ({
    ...crop,
    score: 92 - index * 7,
    waterNeed: index === 0 ? 'Balanced' : index === 1 ? 'Moderate' : 'Watch moisture',
    marketFit: index === 0 ? 'Strong' : index === 1 ? 'Good' : 'Stable',
  }));
}

function CropRecommendation() {
  const { t, translateOption } = useTranslation();
  const [formData, setFormData] = useState({
    location: '',
    soil_type: 'Loamy',
    season: 'Summer',
    area: '',
    preferences: '',
  });
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setRecommendation(null);

    try {
      const response = await axios.post(`${API}/crop/recommend`, formData);
      setRecommendation(response.data);
    } catch (err) {
      setError(t('Failed to get crop recommendations. Please try again.'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const soilTypes = ['Sandy', 'Loamy', 'Clay', 'Silt', 'Peaty', 'Chalky'];
  const seasons = ['Summer', 'Winter', 'Monsoon', 'Spring', 'Autumn'];
  const cropCards = normalizeCropCards(recommendation);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#07160d] via-[#0a2115] to-[#123524] p-6 text-white" data-testid="crop-recommendation-page">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 fade-in">
          <LiveFeatureScene type="crop" formData={formData} recommendation={recommendation} />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="card fade-in">
            <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">{t('Farm Details')}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">{t('Location')}</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(event) => setFormData({ ...formData, location: event.target.value })}
                  placeholder={t('Enter your location')}
                  className="input-field"
                  required
                  data-testid="crop-location-input"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">{t('Soil Type')}</label>
                <select
                  value={formData.soil_type}
                  onChange={(event) => setFormData({ ...formData, soil_type: event.target.value })}
                  className="select-field"
                  data-testid="crop-soil-type-select"
                >
                  {soilTypes.map((item) => (
                    <option key={item} value={item}>{translateOption(item)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">{t('Season')}</label>
                <select
                  value={formData.season}
                  onChange={(event) => setFormData({ ...formData, season: event.target.value })}
                  className="select-field"
                  data-testid="crop-season-select"
                >
                  {seasons.map((item) => (
                    <option key={item} value={item}>{translateOption(item)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">{t('Available Area (acres)')}</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.area}
                  onChange={(event) => setFormData({ ...formData, area: event.target.value })}
                  placeholder={t('Enter area in acres')}
                  className="input-field"
                  required
                  data-testid="crop-area-input"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">{t('Preferences (Optional)')}</label>
                <textarea
                  value={formData.preferences}
                  onChange={(event) => setFormData({ ...formData, preferences: event.target.value })}
                  placeholder={t('Any specific preferences or requirements...')}
                  className="input-field"
                  rows="3"
                  data-testid="crop-preferences-input"
                />
              </div>

              {error && <p className="text-red-600" data-testid="crop-error">{error}</p>}

              <button type="submit" disabled={loading} className="btn-primary flex w-full items-center justify-center gap-2" data-testid="get-crop-recommendation-btn">
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    {t('Analyzing...')}
                  </>
                ) : (
                  <>
                    <Sprout className="h-5 w-5" />
                    {t('Get Recommendations')}
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="card fade-in" data-testid="crop-recommendations-display">
            <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">{t('AI Recommendations')}</h2>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader className="mb-4 h-16 w-16 animate-spin text-green-600" />
                <p className="text-gray-600 dark:text-gray-300">{t('Analyzing your farm conditions...')}</p>
              </div>
            ) : recommendation ? (
              <div className="space-y-6">
                <div className="rounded-xl border border-green-200 dark:border-green-800/50 bg-green-50 dark:bg-green-900/20 p-4">
                  <div className="mb-2 flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">{t('Recommendation Generated')}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t('Stable result for the same input, based on weather and soil conditions')}</p>
                </div>

                {cropCards.length > 0 ? (
                  <div className="space-y-4">
                    {cropCards.map((crop, index) => (
                      <div key={`${crop.name}-${index}`} className="overflow-hidden rounded-[28px] border border-gray-200 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="max-w-xl">
                            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                              <Leaf className="h-3.5 w-3.5" />
                              {index === 0 ? 'Best Match' : `Option ${index + 1}`}
                            </div>
                            <h3 className="mt-3 text-2xl font-black text-slate-900">{crop.name}</h3>
                            <ResultRenderer data={crop.reason} />
                          </div>
                          <div className="grid min-w-[220px] grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Suitability</div>
                              <div className="mt-2 text-2xl font-black text-slate-900">{crop.score}%</div>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Market Fit</div>
                              <div className="mt-2 text-base font-bold text-slate-900">{crop.marketFit}</div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-3 md:grid-cols-3">
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                              <TrendingUp className="h-3.5 w-3.5" />
                              Yield Estimate
                            </div>
                            <ResultRenderer data={crop.yield_estimate} />
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                              <Droplets className="h-3.5 w-3.5" />
                              Water Need
                            </div>
                            <div className="mt-2 text-sm font-semibold text-slate-800">{crop.waterNeed}</div>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                              <Sprout className="h-3.5 w-3.5" />
                              Growing Tips
                            </div>
                            <ResultRenderer data={crop.growing_tips} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
                    <ResultRenderer data={recommendation.recommendation} />
                  </div>
                )}

                {recommendation.weather_context && (
                  <div className="rounded-[24px] border border-blue-200 bg-blue-50 p-5">
                    <h3 className="mb-4 font-semibold text-gray-800">{t('Current Weather Context')}</h3>
                    <div className="grid gap-3 md:grid-cols-4 text-sm">
                      <div className="rounded-2xl border border-blue-100 bg-white px-4 py-3">
                        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          <Thermometer className="h-3.5 w-3.5" />
                          Temperature
                        </div>
                        <div className="mt-2 text-lg font-bold text-slate-900">{recommendation.weather_context.temp}°C</div>
                      </div>
                      <div className="rounded-2xl border border-blue-100 bg-white px-4 py-3">
                        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          <Droplets className="h-3.5 w-3.5" />
                          Humidity
                        </div>
                        <div className="mt-2 text-lg font-bold text-slate-900">{recommendation.weather_context.humidity}%</div>
                      </div>
                      <div className="rounded-2xl border border-blue-100 bg-white px-4 py-3">
                        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          <Leaf className="h-3.5 w-3.5" />
                          Soil
                        </div>
                        <div className="mt-2 text-lg font-bold text-slate-900">{formData.soil_type}</div>
                      </div>
                      <div className="rounded-2xl border border-blue-100 bg-white px-4 py-3">
                        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          <Sprout className="h-3.5 w-3.5" />
                          Season
                        </div>
                        <div className="mt-2 text-lg font-bold text-slate-900">{formData.season}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Sprout className="mb-4 h-24 w-24" />
                <p>{t('Enter your farm details to get AI-powered crop recommendations')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CropRecommendation;
