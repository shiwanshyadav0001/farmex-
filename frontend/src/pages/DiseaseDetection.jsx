import { useState } from 'react';
import axios from 'axios';
import { API } from '@/lib/api';
import { AlertCircle, Bug, CheckCircle, ShieldAlert, Upload } from 'lucide-react';
import ResultRenderer from '@/components/ResultRenderer';
import LiveFeatureScene from '@/components/motion/LiveFeatureScene';
import { EmptyFeatureState, FeaturePanel, MetricTile, StatusBadge } from '@/components/feature/InsightPrimitives';

function severityTone(severity = '') {
  const value = String(severity).toLowerCase();
  if (value.includes('high') || value.includes('severe')) return 'orange';
  if (value.includes('medium') || value.includes('moderate')) return 'amber';
  if (value.includes('unknown')) return 'slate';
  return 'emerald';
}

function DiseaseDetection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [detection, setDetection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setDetection(null);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`${API}/disease/detect`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setDetection(response.data);
    } catch (err) {
      setError('Failed to detect disease. Please try again with a different image.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const result = detection?.detection || {};
  const tone = severityTone(result.severity);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#17080b] via-[#241015] to-[#35131c] p-6 text-white" data-testid="disease-detection-page">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 fade-in">
          <LiveFeatureScene type="disease" preview={preview} detection={detection} loading={loading} />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="card fade-in">
            <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-200 dark:text-gray-100">Upload Plant Image</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-green-500">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  data-testid="disease-file-input"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {preview ? (
                    <div>
                      <img src={preview} alt="Preview" className="mx-auto mb-4 max-h-64 rounded-lg shadow-lg" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-300">Click to change image</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                      <p className="mb-2 text-lg font-medium text-gray-700 dark:text-gray-300 dark:text-gray-200">Click to upload image</p>
                      <p className="text-sm text-gray-500">PNG, JPG, WEBP up to 10MB</p>
                    </div>
                  )}
                </label>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600" data-testid="disease-error">
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !selectedFile}
                className="btn-primary flex w-full items-center justify-center gap-2"
                data-testid="detect-disease-btn"
              >
                <Bug className="h-5 w-5" />
                {loading ? 'Analyzing Image...' : 'Detect Disease'}
              </button>
            </form>
          </div>

          <div className="card fade-in" data-testid="disease-result-display">
            <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-200 dark:text-gray-100">Detection Results</h2>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <ShieldAlert className="mb-4 h-16 w-16 animate-pulse text-red-600" />
                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-300">Analyzing plant image with AI...</p>
              </div>
            ) : detection ? (
              <div className="space-y-6">
                <FeaturePanel
                  tone={tone}
                  title="Analysis complete"
                  subtitle="Same image now returns the same disease result, which keeps the diagnosis stable while you review treatment steps."
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge tone={tone}>Stable output</StatusBadge>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <CheckCircle className="h-4 w-4 text-rose-600" />
                      File: {detection.filename}
                    </div>
                  </div>
                </FeaturePanel>

                {(result.disease_name || result.confidence || result.treatment) ? (
                  <>
                    <div className="grid gap-3 md:grid-cols-3">
                      <MetricTile tone={tone} label="Detected" value={result.disease_name || '--'} />
                      <MetricTile tone={tone} label="Confidence" value={result.confidence || '--'} />
                      <MetricTile tone={tone} label="Severity" value={result.severity || '--'} />
                    </div>

                    <div className="grid gap-4">
                      {result.treatment ? (
                        <FeaturePanel tone="rose" title="Treatment">
                          <ResultRenderer data={result.treatment} />
                        </FeaturePanel>
                      ) : null}

                      {result.prevention ? (
                        <FeaturePanel tone="amber" title="Prevention">
                          <ResultRenderer data={result.prevention} />
                        </FeaturePanel>
                      ) : null}

                      {Array.isArray(result.supported_crops) && result.supported_crops.length > 0 ? (
                        <FeaturePanel tone="slate" title="Supported crops in this model">
                          <div className="flex flex-wrap gap-2">
                            {result.supported_crops.map((crop, index) => (
                              <StatusBadge key={`${crop}-${index}`} tone="slate">{crop}</StatusBadge>
                            ))}
                          </div>
                        </FeaturePanel>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <FeaturePanel tone="rose">
                    <ResultRenderer data={result} />
                  </FeaturePanel>
                )}
              </div>
            ) : (
              <EmptyFeatureState
                icon={Bug}
                title="Scan the leaf, not just upload it"
                description="Add a plant image to see the diagnosis, confidence, severity, treatment, and prevention guidance in a more useful clinical layout."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiseaseDetection;
