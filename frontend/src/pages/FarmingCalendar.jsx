import { useState } from 'react';
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
      const response = await axios.post(`${API}/calendar/generate`, formData);
      setCalendar(response.data);
    } catch (err) {
      setError('Failed to generate farming calendar. Please try again.');
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
            <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Calendar Parameters</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">Crop Name</label>
                <input
                  type="text"
                  value={formData.crop_name}
                  onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
                  placeholder="Enter crop name (e.g., Rice, Wheat, Corn)"
                  className="input-field"
                  required
                  data-testid="calendar-crop-input"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">Planting Date</label>
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
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">Farm Area (acres)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="Enter area in acres"
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
                {loading ? 'Generating...' : 'Generate Calendar'}
              </button>
            </form>
          </div>

          <div className="card fade-in" data-testid="farming-calendar-display">
            <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Activity Timeline</h2>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Clock className="mb-4 h-16 w-16 animate-pulse text-indigo-600" />
                <p className="text-gray-600 dark:text-gray-300">Creating your farming calendar...</p>
              </div>
            ) : calendar ? (
              <div className="space-y-6">
                <FeaturePanel
                  tone="violet"
                  title={`Calendar for ${calendar.crop}`}
                  subtitle="Same crop, planting date, and area now return the same activity timeline, so planning stays steady."
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge tone="violet">Stable output</StatusBadge>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <CheckCircle2 className="h-4 w-4 text-violet-600" />
                      Timeline synced from planting to harvest
                    </div>
                  </div>
                </FeaturePanel>

                {activities.length > 0 ? (
                  <>
                    <div className="grid gap-3 md:grid-cols-3">
                      <MetricTile tone="violet" label="Activities" value={`${activities.length}`} hint="Timeline checkpoints" />
                      <MetricTile tone="violet" label="Planting date" value={formData.planting_date || '--'} hint="Schedule anchor" />
                      <MetricTile tone="violet" label="Area" value={formData.area ? `${formData.area} acres` : '--'} hint="Production scope" />
                    </div>

                    <FeaturePanel tone="violet" title="Farming timeline" subtitle="Tasks are laid out as milestones instead of a generic JSON block.">
                      <div className="space-y-4">
                        {activities.map((item, index) => (
                          <div key={`${item.date}-${item.activity}-${index}`} className="grid gap-4 rounded-[26px] border border-violet-100 bg-white p-5 md:grid-cols-[120px_1fr_auto] md:items-start">
                            <div className="text-sm font-bold text-slate-900">{item.date}</div>
                            <div>
                              <h3 className="text-lg font-black text-slate-900">{item.activity}</h3>
                              <ResultRenderer data={item.description} />
                            </div>
                            <div className="md:justify-self-end">
                              <StatusBadge tone={priorityTone(item.priority)}>{item.priority || 'Planned'}</StatusBadge>
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
                title="Build a season timeline"
                description="Enter crop, planting date, and area to turn this panel into a complete farming schedule with milestone dates and priorities."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FarmingCalendar;
