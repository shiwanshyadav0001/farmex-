import { useState } from 'react';
import { useTranslation } from "@/i18n";
import axios from 'axios';
import { API } from '@/lib/api';
import { Calendar, CheckCircle2, Clock } from 'lucide-react';
import ResultRenderer from '@/components/ResultRenderer';
import LiveFeatureScene from '@/components/motion/LiveFeatureScene';
import { EmptyFeatureState, FeaturePanel, MetricTile, StatusBadge } from '@/components/feature/InsightPrimitives';

function priorityTone(priority = '') {
  const value = String(priority).toLowerCase();
  if (value.includes('high')) return 'orange';
  if (value.includes('medium')) return 'amber';
  return 'emerald';
}

function FarmingCalendar() {
  const { t, language } = useTranslation();
  const [formData, setFormData] = useState({
    crop_name: '',
    planting_date: '',
    area: '',
  });
  const [calendar, setCalendar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCalendar(null);

    try {
      const response = await axios.post(`${API}/calendar/generate`, { ...formData, language });
      setCalendar(response.data);
    } catch (err) {
      setError(t('Failed to generate farming calendar. Please try again.'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const activities = calendar?.calendar?.activities || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1022] via-[#14193a] to-[#1f214d] p-6 text-white" data-testid="farming-calendar-page">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 fade-in">
          <LiveFeatureScene type="calendar" formData={formData} calendarData={calendar} />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="card fade-in">
            <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-200 dark:text-gray-100">{t('Calendar Parameters')}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-200">{t('Crop Name')}</label>
                <input
                  type="text"
                  value={formData.crop_name}
                  onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
                  placeholder={t("Enter crop name (e.g., Rice, Wheat, Corn)")}
                  className="input-field"
                  required
                  data-testid="calendar-crop-input"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-200">{t('Planting Date')}</label>
                <input
                  type="date"
                  value={formData.planting_date}
                  onChange={(e) => setFormData({ ...formData, planting_date: e.target.value })}
                  className="input-field"
                  required
                  data-testid="calendar-date-input"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-200">{t('Farm Area (acres)')}</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder={t("Enter area in acres")}
                  className="input-field"
                  required
                  data-testid="calendar-area-input"
                />
              </div>

              {error && <p className="text-red-600" data-testid="calendar-error">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex w-full items-center justify-center gap-2"
                data-testid="generate-calendar-btn"
              >
                <Calendar className="h-5 w-5" />
                {loading ? t('Generating...') : t('Generate Calendar')}
              </button>
            </form>
          </div>

          <div className="card fade-in" data-testid="farming-calendar-display">
            <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-200 dark:text-gray-100">{t('Activity Timeline')}</h2>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Clock className="mb-4 h-16 w-16 animate-pulse text-indigo-600" />
                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-300">{t("Creating your farming calendar...")}</p>
              </div>
            ) : calendar ? (
              <div className="space-y-6">
                <FeaturePanel
                  tone="violet"
                  title={`${t("Calendar for")} ${calendar.crop}`}
                  subtitle={t("Same crop, planting date, and area now return the same activity timeline, so planning stays steady.")}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge tone="violet">{t("Stable output")}</StatusBadge>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <CheckCircle2 className="h-4 w-4 text-violet-600" />
                      {t("Timeline synced from planting to harvest")}
                    </div>
                  </div>
                </FeaturePanel>

                {activities.length > 0 ? (
                  <>
                    <div className="grid gap-3 md:grid-cols-3">
                      <MetricTile tone="violet" label={t("Activities")} value={`${activities.length}`} hint={t("Timeline checkpoints")} />
                      <MetricTile tone="violet" label={t("Planting date")} value={formData.planting_date || '--'} hint={t("Schedule anchor")} />
                      <MetricTile tone="violet" label={t("Area")} value={formData.area ? `${formData.area} acres` : '--'} hint={t("Production scope")} />
                    </div>

                    <FeaturePanel tone="violet" title={t("Farming timeline")} subtitle={t("Tasks are laid out as milestones instead of a generic JSON block.")}>
                      <div className="space-y-4">
                        {activities.map((item, index) => (
                          <div key={`${item.date}-${item.activity}-${index}`} className="grid gap-4 rounded-[26px] border border-violet-100 bg-white dark:bg-slate-900 p-5 md:grid-cols-[120px_1fr_auto] md:items-start">
                            <div className="text-sm font-bold text-slate-900 dark:text-slate-50">{item.date}</div>
                            <div>
                              <h3 className="text-lg font-black text-slate-900 dark:text-slate-50">{item.activity}</h3>
                              <ResultRenderer data={item.description} />
                            </div>
                            <div className="md:justify-self-end">
                              <StatusBadge tone={priorityTone(item.priority)}>{t(item.priority) || t('Planned')}</StatusBadge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </FeaturePanel>
                  </>
                ) : (
                  <FeaturePanel tone="violet">
                    <ResultRenderer data={calendar.calendar} />
                  </FeaturePanel>
                )}
              </div>
            ) : (
              <EmptyFeatureState
                icon={Calendar}
                title={t("Build a season timeline")}
                description={t("Enter crop details to generate a complete farming timeline with optimal planting dates and activity reminders.")}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FarmingCalendar;
