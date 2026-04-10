import { useState } from 'react';
import { useTranslation } from "@/i18n";
import axios from 'axios';
import { API } from '@/lib/api';
import { CheckCircle2, CloudRain, Map, MapPin } from 'lucide-react';
import ResultRenderer from '@/components/ResultRenderer';
import LiveFeatureScene from '@/components/motion/LiveFeatureScene';
import { EmptyFeatureState, FeaturePanel, MetricTile, StatusBadge } from '@/components/feature/InsightPrimitives';

function SoilInsights() {
  const { t, language } = useTranslation();
  const [location, setLocation] = useState('');
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInsights(null);

    try {
      const response = await axios.get(`${API}/soil/insights`, { params: { location } });
      setInsights(response.data);
    } catch (err) {
      setError('Failed to fetch soil insights. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const detail = insights?.insights || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1107] via-[#26180a] to-[#38210f] p-6 text-white" data-testid="soil-insights-page">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 fade-in">
          <LiveFeatureScene type="soil" location={location} insights={insights} />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="card fade-in">
            <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-200 dark:text-gray-100">{t('Location Analysis')}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-200">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t('Enter location (city or region)')}
                  className="input-field"
                  required
                  data-testid="soil-location-input"
                />
              </div>

              {error && <p className="text-red-600" data-testid="soil-error">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex w-full items-center justify-center gap-2"
                data-testid="get-soil-insights-btn"
              >
                <MapPin className="h-5 w-5" />
                {loading ? 'Analyzing...' : 'Get Insights'}
              </button>
            </form>

            <div className="mt-6 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 p-6 shadow-sm">
              <h3 className="mb-3 font-semibold text-amber-900">What You&apos;ll Get:</h3>
              <ul className="space-y-2 text-sm text-amber-800">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  Soil type distribution in your region
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  Rainfall patterns and monsoon timing
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  Water retention characteristics
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  Irrigation requirements
                </li>
              </ul>
            </div>
          </div>

          <div className="card fade-in" data-testid="soil-insights-display">
            <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-200 dark:text-gray-100">{t('Regional Insights')}</h2>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Map className="mb-4 h-16 w-16 animate-pulse text-amber-600" />
                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-300">Gathering geo-based insights...</p>
              </div>
            ) : insights ? (
              <div className="space-y-6">
                <FeaturePanel
                  tone="amber"
                  title={`Analysis for ${insights.location}`}
                  subtitle="Same location now returns the same soil insight pack, so your land profile stays consistent."
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge tone="amber">Stable output</StatusBadge>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <CheckCircle2 className="h-4 w-4 text-amber-600" />
                      Terrain profile ready
                    </div>
                  </div>
                </FeaturePanel>

                {(detail.soil_types || detail.rainfall_pattern || detail.characteristics) ? (
                  <>
                    <div className="grid gap-3 md:grid-cols-3">
                      <MetricTile tone="amber" label="Soil types" value={Array.isArray(detail.soil_types) ? detail.soil_types.length : '--'} hint="Regional type signals" />
                      <MetricTile tone="amber" label="Water retention" value={detail.water_retention || '--'} hint="Moisture holding behavior" />
                      <MetricTile tone="amber" label="Irrigation need" value={detail.irrigation_needs ? 'Defined' : '--'} hint="Field watering guidance" />
                    </div>

                    {Array.isArray(detail.soil_types) && detail.soil_types.length > 0 ? (
                      <FeaturePanel tone="amber" title="Dominant soil profile" subtitle="These soil types shape crop suitability and water behavior in the selected region.">
                        <div className="flex flex-wrap gap-2">
                          {detail.soil_types.map((soilType, index) => (
                            <StatusBadge key={`${soilType}-${index}`} tone="amber">{soilType}</StatusBadge>
                          ))}
                        </div>
                      </FeaturePanel>
                    ) : null}

                    <div className="grid gap-4">
                      {detail.characteristics ? (
                        <FeaturePanel tone="amber" title="Soil characteristics">
                          <ResultRenderer data={detail.characteristics} />
                        </FeaturePanel>
                      ) : null}

                      {detail.rainfall_pattern ? (
                        <FeaturePanel tone="amber" title="Rainfall pattern">
                          <ResultRenderer data={detail.rainfall_pattern} />
                        </FeaturePanel>
                      ) : null}

                      {Array.isArray(detail.monsoon_months) && detail.monsoon_months.length > 0 ? (
                        <FeaturePanel tone="amber" title="Monsoon window">
                          <div className="flex flex-wrap gap-2">
                            {detail.monsoon_months.map((month, index) => (
                              <StatusBadge key={`${month}-${index}`} tone="amber">{month}</StatusBadge>
                            ))}
                          </div>
                        </FeaturePanel>
                      ) : null}

                      {detail.irrigation_needs ? (
                        <FeaturePanel tone="amber" title="Irrigation requirement">
                          <ResultRenderer data={detail.irrigation_needs} />
                        </FeaturePanel>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <FeaturePanel tone="amber">
                    <ResultRenderer data={detail} />
                  </FeaturePanel>
                )}

                {insights.current_weather ? (
                  <FeaturePanel tone="cyan" title="Current climate context" subtitle="Live weather is shown next to the regional soil signal so land advice feels grounded in present conditions.">
                    <div className="grid gap-3 md:grid-cols-3">
                      <MetricTile tone="cyan" label="Temperature" value={`${Math.round(insights.current_weather.temp)} deg`} />
                      <MetricTile tone="cyan" label="Humidity" value={`${insights.current_weather.humidity}%`} />
                      <MetricTile tone="cyan" label="Weather" value={insights.current_weather.description || '--'} hint="Current sky state" />
                    </div>
                  </FeaturePanel>
                ) : null}
              </div>
            ) : (
              <EmptyFeatureState
                icon={CloudRain}
                title="Read the land before planting"
                description="Enter a location to see soil types, rainfall memory, monsoon timing, and irrigation behavior for that region."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SoilInsights;
