import { useState, useEffect } from 'react';
import { useTranslation } from "@/i18n";
import axios from 'axios';
import { API } from '@/lib/api';
import { CheckCircle2, Droplets, Loader, Waves } from 'lucide-react';
import ResultRenderer from '@/components/ResultRenderer';
import LiveFeatureScene from '@/components/motion/LiveFeatureScene';
import { EmptyFeatureState, FeaturePanel, MetricTile, StatusBadge } from '@/components/feature/InsightPrimitives';

function averageWater(schedule = []) {
  const values = schedule
    .map((day) => Number(day?.water_quantity || 0))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (!values.length) return '--';

  return `${Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)} L/acre`;
}

function Irrigation() {
  const { t, language } = useTranslation();
  const [farms, setFarms] = useState([]);
  const [formData, setFormData] = useState({
    farm_id: '',
    crop_type: '',
  });
  const [irrigationPlan, setIrrigationPlan] = useState(null);
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
    setIrrigationPlan(null);

    try {
      const response = await axios.post(`${API}/irrigation/plan`, formData);
      setIrrigationPlan(response.data);
    } catch (err) {
      setError('Failed to generate irrigation plan. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const schedule = irrigationPlan?.irrigation_plan?.schedule || [];
  const irrigatingDays = schedule.filter((day) => day?.irrigate).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#05141c] via-[#082132] to-[#0b2d4a] p-6 text-white" data-testid="irrigation-page">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 fade-in">
          <LiveFeatureScene type="irrigation" formData={formData} farms={farms} irrigationPlan={irrigationPlan} />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="card fade-in">
            <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-200 dark:text-gray-100">{t('Irrigation Parameters')}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-200">{t('Select Farm')}</label>
                <select
                  value={formData.farm_id}
                  onChange={(e) => setFormData({ ...formData, farm_id: e.target.value })}
                  className="select-field"
                  required
                  data-testid="irrigation-farm-select"
                >
                  <option value="">{t('Choose a farm')}</option>
                  {farms.map((farm) => (
                    <option key={farm.id} value={farm.id}>
                      {farm.user_name} - {farm.location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-200">{t('Crop Type')}</label>
                <input
                  type="text"
                  value={formData.crop_type}
                  onChange={(e) => setFormData({ ...formData, crop_type: e.target.value })}
                  placeholder={t('Enter crop type (e.g., Rice, Wheat, Corn)')}
                  className="input-field"
                  required
                  data-testid="irrigation-crop-input"
                />
              </div>

              {error && <p className="text-red-600" data-testid="irrigation-error">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex w-full items-center justify-center gap-2"
                data-testid="generate-irrigation-plan-btn"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    {t('Generating Plan...')}
                  </>
                ) : (
                  <>
                    <Droplets className="h-5 w-5" />
                    {t('Generate Irrigation Plan')}
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="card fade-in" data-testid="irrigation-plan-display">
            <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-200 dark:text-gray-100">{t('Irrigation Schedule')}</h2>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader className="mb-4 h-16 w-16 animate-spin text-cyan-600" />
                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-300">{t('Creating optimal irrigation schedule...')}</p>
              </div>
            ) : irrigationPlan ? (
              <div className="space-y-6">
                <FeaturePanel
                  tone="cyan"
                  title={t("Plan locked for this input")}
                  subtitle={t("Same farm and crop details now return the same irrigation plan, so the workflow feels dependable.")}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge tone="cyan">{t("Stable output")}</StatusBadge>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <CheckCircle2 className="h-4 w-4 text-cyan-600" />
                      {t("Weather-aware scheduling active")}
                    </div>
                  </div>
                </FeaturePanel>

                {schedule.length > 0 ? (
                  <>
                    <div className="grid gap-3 md:grid-cols-3">
                      <MetricTile tone="cyan" label={t("Irrigation days")} value={`${irrigatingDays} / ${schedule.length}`} hint={t("Days that need watering")} />
                      <MetricTile tone="cyan" label={t("Average water")} value={averageWater(schedule)} hint={t("Across recommended sessions")} />
                      <MetricTile tone="cyan" label={t("Typical time")} value={schedule.find((day) => day?.time)?.time || '--'} hint={t("Best application window")} />
                    </div>

                    <div className="grid gap-4">
                      {schedule.map((day, index) => (
                        <div
                          key={`${day.date}-${index}`}
                          className={`rounded-[28px] border p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] ${
                            day.irrigate ? 'border-cyan-200 bg-white dark:bg-slate-900' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                          }`}
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="max-w-xl">
                              <StatusBadge tone={day.irrigate ? 'cyan' : 'slate'}>{t(day.irrigate ? 'Irrigate' : 'Hold water')}</StatusBadge>
                              <h3 className="mt-3 text-2xl font-black text-slate-900 dark:text-slate-50">{day.date}</h3>
                              <p className="mt-3 text-sm leading-7 text-slate-600">{day.notes || t('Monitor field moisture and adjust only if real rainfall differs from forecast.')}</p>
                            </div>
                            <div className="grid min-w-[230px] grid-cols-2 gap-3">
                              <MetricTile tone={day.irrigate ? 'cyan' : 'slate'} label={t("Water")} value={day.irrigate ? `${day.water_quantity || '--'} L/acre` : t('Skip')} />
                              <MetricTile tone={day.irrigate ? 'cyan' : 'slate'} label={t("Window")} value={day.time || '--'} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <FeaturePanel tone="cyan">
                    <ResultRenderer data={irrigationPlan.irrigation_plan} />
                  </FeaturePanel>
                )}

                {irrigationPlan.weather_forecast && irrigationPlan.weather_forecast.length > 0 && (
                  <FeaturePanel tone="cyan" title={t("7-day rainfall pressure")} subtitle={t("The planner uses this forecast to reduce overwatering and react to incoming rain.")}>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      {irrigationPlan.weather_forecast.slice(0, 8).map((day, index) => (
                        <div key={index} className="rounded-2xl border border-cyan-100 bg-white dark:bg-slate-900 px-4 py-4">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-bold text-slate-900 dark:text-slate-50">{day.date}</div>
                            <Waves className="h-4 w-4 text-cyan-600" />
                          </div>
                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${Math.min(100, Math.max(6, day.rain_probability || 0))}%` }} />
                          </div>
                          <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                            <span>{Math.round(day.temp_max)} deg / {Math.round(day.temp_min)} deg</span>
                            <span className="font-semibold text-cyan-700">{Math.round(day.rain_probability)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </FeaturePanel>
                )}
              </div>
            ) : (
              <EmptyFeatureState
                icon={Droplets}
                title={t("Generate a real irrigation schedule")}
                description={t("Select the farm and crop first. This panel will turn into a day-by-day water plan with timing, quantity, and rainfall pressure.")}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Irrigation;
