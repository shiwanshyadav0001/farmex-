import { useState, useEffect } from 'react';
import { useTranslation } from "@/i18n";
import axios from 'axios';
import { API } from '@/lib/api';
import { AlertTriangle, CheckCircle2, Shield } from 'lucide-react';
import ResultRenderer from '@/components/ResultRenderer';
import LiveFeatureScene from '@/components/motion/LiveFeatureScene';
import { EmptyFeatureState, FeaturePanel, MetricTile, StatusBadge } from '@/components/feature/InsightPrimitives';

function ensureArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) return [value];
  return [];
}

function riskTone(score = '') {
  const value = String(score).toLowerCase();
  if (value.includes('high')) return 'orange';
  if (value.includes('medium')) return 'amber';
  return 'emerald';
}

function RiskList({ title, items, tone }) {
  if (!items.length) return null;

  return (
    <FeaturePanel tone={tone} title={title}>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={`${title}-${index}`} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-4 text-sm leading-7 text-slate-700 dark:text-slate-300">
            <ResultRenderer data={item} />
          </div>
        ))}
      </div>
    </FeaturePanel>
  );
}

function RiskAnalysis() {
  const { t, language } = useTranslation();
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [riskAnalysis, setRiskAnalysis] = useState(null);
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

  const selectedFarm = farms.find((farm) => String(farm.id) === String(selectedFarmId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRiskAnalysis(null);

    try {
      const response = await axios.post(`${API}/risk/analyze`, { farm_id: selectedFarmId });
      setRiskAnalysis(response.data);
    } catch (err) {
      setError('Failed to analyze risks. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const analysis = riskAnalysis?.risk_analysis || {};
  const score = analysis.overall_risk_score || 'Unknown';
  const tone = riskTone(score);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0e08] via-[#24110b] to-[#35170f] p-6 text-white" data-testid="risk-analysis-page">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 fade-in">
          <LiveFeatureScene type="risk" selectedFarm={selectedFarm} riskAnalysis={riskAnalysis} />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="card fade-in">
            <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-200 dark:text-gray-100">{t('Select Farm')}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-200">Farm</label>
                <select
                  value={selectedFarmId}
                  onChange={(e) => setSelectedFarmId(e.target.value)}
                  className="select-field"
                  required
                  data-testid="risk-farm-select"
                >
                  <option value="">Choose a farm</option>
                  {farms.map((farm) => (
                    <option key={farm.id} value={farm.id}>
                      {farm.user_name} - {farm.location} ({farm.total_area} acres)
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl border border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-900/10 p-4 backdrop-blur-sm">
                <h3 className="mb-2 text-sm font-black text-orange-900 dark:text-orange-100 uppercase tracking-wider">Risk Categories Analyzed:</h3>
                <ul className="space-y-1 text-sm text-orange-800 dark:text-orange-200 font-medium">
                  <li>• Weather-related risks (drought, flood, frost)</li>
                  <li>• Disease and pest risks</li>
                  <li>• Market price volatility</li>
                  <li>• Operational risks</li>
                  <li>• Mitigation strategies</li>
                </ul>
              </div>

              {error && <p className="text-red-600" data-testid="risk-error">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex w-full items-center justify-center gap-2"
                data-testid="analyze-risk-btn"
              >
                <Shield className="h-5 w-5" />
                {loading ? 'Analyzing Risks...' : 'Analyze Risks'}
              </button>
            </form>
          </div>

          <div className="card fade-in" data-testid="risk-analysis-display">
            <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-200 dark:text-gray-100">{t('Risk Assessment')}</h2>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <AlertTriangle className="mb-4 h-16 w-16 animate-pulse text-orange-600" />
                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-300">Performing comprehensive risk analysis...</p>
              </div>
            ) : riskAnalysis ? (
              <div className="space-y-6">
                <FeaturePanel
                  tone={tone}
                  title="Comprehensive risk report"
                  subtitle="Same farm conditions now return the same risk result, which makes the warning system feel trustworthy."
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge tone={tone}>Stable output</StatusBadge>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <CheckCircle2 className="h-4 w-4 text-orange-600" />
                      Alert model synchronized with weather context
                    </div>
                  </div>
                </FeaturePanel>

                {(analysis.weather_risks || analysis.mitigation_strategies || analysis.overall_risk_score) ? (
                  <>
                    <div className="grid gap-3 md:grid-cols-3">
                      <MetricTile tone={tone} label="Overall risk" value={score} hint="Farm-wide exposure level" />
                      <MetricTile tone="orange" label="Farm" value={selectedFarm?.location || '--'} hint="Current risk target" />
                      <MetricTile tone="cyan" label="Weather" value={riskAnalysis.weather_context ? `${Math.round(riskAnalysis.weather_context.temp)} deg` : '--'} hint={riskAnalysis.weather_context ? `${riskAnalysis.weather_context.humidity}% humidity` : 'No live weather'} />
                    </div>

                    <RiskList title="Weather risks" items={ensureArray(analysis.weather_risks)} tone="orange" />
                    <RiskList title="Disease and pest risks" items={ensureArray(analysis.disease_risks)} tone="amber" />
                    <RiskList title="Market risks" items={ensureArray(analysis.market_risks)} tone="orange" />
                    <RiskList title="Operational risks" items={ensureArray(analysis.operational_risks)} tone="amber" />
                    <RiskList title="Mitigation strategies" items={ensureArray(analysis.mitigation_strategies)} tone="emerald" />
                  </>
                ) : (
                  <FeaturePanel tone="orange">
                    <ResultRenderer data={analysis} />
                  </FeaturePanel>
                )}
              </div>
            ) : (
              <EmptyFeatureState
                icon={Shield}
                title="Map the farm before the risk hits"
                description="Select a farm to see overall exposure, weather risk, disease pressure, market volatility, and mitigation strategies in one place."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RiskAnalysis;
