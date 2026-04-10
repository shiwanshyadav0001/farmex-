import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { API } from '@/lib/api';
import { AlertTriangle, Cloud, CloudRain, Droplets, Eye, MapPin, RefreshCw, Thermometer, Waves, Wind } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n';

const WeatherSceneFX = lazy(() => import('@/components/3d/WeatherSceneFX'));

const surfaceClassName =
  'relative overflow-hidden rounded-[30px] border border-slate-200/50 dark:border-white/10 bg-white/70 dark:bg-white/10 shadow-[0_30px_90px_rgba(2,6,23,0.1)] dark:shadow-[0_30px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl';

function Weather() {
  const { t } = useTranslation();
  const [location, setLocation] = useState('');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detectedLocation, setDetectedLocation] = useState('');
  const [searchedLocation, setSearchedLocation] = useState('');
  const autoLoadedRef = useRef(false);

  const fetchWeather = async (targetLocation = location, options = {}) => {
    const normalizedLocation = targetLocation.trim();
    if (!normalizedLocation) {
      setError(t('Please enter a location'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [currentRes, forecastRes] = await Promise.all([
        axios.get(`${API}/weather/current`, { params: { location: normalizedLocation } }),
        axios.get(`${API}/weather/forecast`, { params: { location: normalizedLocation } }),
      ]);

      setCurrentWeather(currentRes.data);
      setForecast(forecastRes.data.forecast);
      setLocation(normalizedLocation);

      if (options.fromAutoLocation) {
        setDetectedLocation(normalizedLocation);
        setSearchedLocation('');
      } else {
        setSearchedLocation(normalizedLocation);
      }
    } catch (err) {
      setError(t('Failed to fetch weather data. Please try again.'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoadedRef.current) return;

    const profile = JSON.parse(localStorage.getItem('farmex-profile') || '{}');
    const savedLocation = profile?.currentLocation?.label?.trim();
    if (!savedLocation) return;

    autoLoadedRef.current = true;
    setLocation(savedLocation);
    setDetectedLocation(savedLocation);
    fetchWeather(savedLocation, { fromAutoLocation: true });
  }, []);

  useEffect(() => {
    const syncProfileLocation = () => {
      const profile = JSON.parse(localStorage.getItem('farmex-profile') || '{}');
      const savedLocation = profile?.currentLocation?.label?.trim();
      if (!savedLocation || detectedLocation === savedLocation) return;

      setDetectedLocation(savedLocation);
      if (!searchedLocation && !loading) {
        setLocation(savedLocation);
        fetchWeather(savedLocation, { fromAutoLocation: true });
      }
    };

    window.addEventListener('storage', syncProfileLocation);
    syncProfileLocation();
    return () => window.removeEventListener('storage', syncProfileLocation);
  }, [detectedLocation, searchedLocation, loading]);

  const weatherDescription = currentWeather?.weather?.description || '';
  const temperature = currentWeather?.weather?.temp;
  const rainProbability = forecast[0]?.rain_probability;

  const theme = useMemo(() => {
    const text = weatherDescription.toLowerCase();

    if (text.includes('thunder') || text.includes('storm')) {
      return {
        page: 'from-blue-50 via-indigo-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950',
        accent: 'from-blue-600 via-indigo-700 to-slate-800 dark:from-blue-400 dark:via-indigo-200 dark:to-slate-100',
        chip: 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/15 dark:text-blue-100 border-blue-200 dark:border-blue-300/20',
      };
    }

    if (text.includes('rain') || text.includes('drizzle') || text.includes('shower')) {
      return {
        page: 'from-sky-50 via-cyan-100 to-blue-200 dark:from-slate-950 dark:via-sky-950 dark:to-cyan-950',
        accent: 'from-sky-600 via-cyan-700 to-blue-800 dark:from-sky-300 dark:via-cyan-100 dark:to-white',
        chip: 'bg-sky-500/10 text-sky-700 dark:bg-sky-500/15 dark:text-sky-100 border-sky-200 dark:border-sky-300/20',
      };
    }

    if (text.includes('mist') || text.includes('fog') || text.includes('haze')) {
      return {
        page: 'from-slate-50 via-emerald-50 to-cyan-100 dark:from-slate-950 dark:via-slate-800 dark:to-emerald-950',
        accent: 'from-slate-700 via-emerald-800 to-cyan-800 dark:from-slate-100 dark:via-emerald-100 dark:to-cyan-100',
        chip: 'bg-slate-500/10 text-slate-700 dark:bg-white/10 dark:text-slate-100 border-slate-200 dark:border-white/10',
      };
    }

    return {
      page: 'from-emerald-50 via-teal-50 to-lime-100 dark:from-[#04120d] dark:via-[#0a2a1d] dark:to-[#0f4c37]',
      accent: 'from-emerald-700 via-teal-800 to-lime-800 dark:from-lime-200 dark:via-white dark:to-emerald-100',
      chip: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-100 border-emerald-200 dark:border-emerald-300/20',
    };
  }, [weatherDescription]);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.page} p-4 text-slate-900 dark:text-white sm:p-6 transition-colors duration-500`} data-testid="weather-page">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="relative overflow-hidden rounded-[36px] border border-slate-200/50 dark:border-white/10 bg-white/80 dark:bg-black/20 shadow-[0_40px_120px_rgba(2,6,23,0.1)] dark:shadow-[0_40px_120px_rgba(2,6,23,0.45)]">
          <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/20 to-black/60" />}>
            <WeatherSceneFX description={weatherDescription} />
          </Suspense>

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0))]" />

          <div className="relative z-10 grid gap-8 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl"
            >
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] ${theme.chip}`}>
                  <CloudRain className="h-4 w-4" />
                  {t('Atmospheric Weather Intelligence')}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/50 dark:border-white/10 bg-white/20 dark:bg-white/5 px-4 py-2 text-sm text-slate-700 dark:text-white/75 backdrop-blur-md">
                  <MapPin className="h-4 w-4" />
                  {searchedLocation || detectedLocation || location || t('Choose a location')}
                </span>
                {detectedLocation && (
                  <button
                    type="button"
                    onClick={() => fetchWeather(detectedLocation, { fromAutoLocation: true })}
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 dark:border-emerald-300/15 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-800 dark:text-emerald-100 transition hover:bg-emerald-400/20 backdrop-blur-md"
                  >
                    <MapPin className="h-4 w-4" />
                    {t('Current location')}: {detectedLocation}
                  </button>
                )}
              </div>

              <h1 className={`max-w-xl bg-gradient-to-r ${theme.accent} bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl`} data-testid="weather-title">
                {t('Weather that feels alive on the screen')}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-800 dark:text-white/80 sm:text-lg">
                {t('See real-time conditions, animated atmosphere, and forecast signals in one premium weather workspace designed for faster farm decisions.')}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <div className="rounded-3xl border border-slate-200/50 dark:border-white/10 bg-white/90 dark:bg-black/25 px-5 py-4 backdrop-blur-xl">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-600 dark:text-white/60">{t('Now')}</div>
                  <div className="mt-2 text-5xl font-black text-slate-900 dark:text-white">{temperature != null ? `${temperature}°` : '--'}</div>
                </div>
                <div className="rounded-3xl border border-slate-200/50 dark:border-white/10 bg-white/90 dark:bg-black/25 px-5 py-4 backdrop-blur-xl">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-600 dark:text-white/60">{t('Condition')}</div>
                  <div className="mt-2 text-lg font-semibold capitalize text-slate-800 dark:text-white">{weatherDescription || t('Waiting for live data')}</div>
                </div>
                <div className="rounded-3xl border border-slate-200/50 dark:border-white/10 bg-white/90 dark:bg-black/25 px-5 py-4 backdrop-blur-xl">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-600 dark:text-white/60">{t('Rain chance')}</div>
                  <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{rainProbability != null ? `${Math.round(rainProbability)}%` : '--'}</div>
                </div>
                {detectedLocation && searchedLocation && searchedLocation !== detectedLocation && (
                  <div className="rounded-3xl border border-emerald-300/10 dark:border-emerald-300/10 bg-emerald-400/10 px-5 py-4 backdrop-blur-xl">
                    <div className="text-xs uppercase tracking-[0.22em] text-slate-600 dark:text-white/60">{t('Detected home weather')}</div>
                    <div className="mt-2 text-sm font-semibold text-emerald-800 dark:text-emerald-100">{detectedLocation}</div>
                    <button
                      type="button"
                      onClick={() => fetchWeather(detectedLocation, { fromAutoLocation: true })}
                      className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/30 dark:border-emerald-300/15 bg-white/10 dark:bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800 dark:text-emerald-100 transition hover:bg-white/20"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      {t('Back to current location')}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className={`${surfaceClassName} p-5 sm:p-6`}
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-600 dark:text-white/60">{t('Live Search')}</div>
                  <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{t('Weather Forecast')}</div>
                </div>
                <Cloud className="h-8 w-8 text-slate-600 dark:text-white/70" />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-white/90">{t('Location')}</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    onKeyDown={(event) => event.key === 'Enter' && fetchWeather(location)}
                    placeholder={t('Enter city name (e.g., Mumbai, Delhi)')}
                    className="w-full rounded-2xl border border-slate-300 dark:border-white/12 bg-white/60 dark:bg-black/25 px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/35 outline-none transition focus:border-emerald-500 dark:focus:border-emerald-300/40 focus:ring-4 focus:ring-emerald-500/10 dark:focus:ring-emerald-200/10"
                    data-testid="weather-location-input"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => fetchWeather(location)}
                    disabled={loading}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-lime-300 px-5 py-3 font-semibold text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                    data-testid="fetch-weather-btn"
                  >
                    {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Cloud className="h-5 w-5" />}
                    {t('Get Weather')}
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const profile = JSON.parse(localStorage.getItem('farmex-profile') || '{}');
                        if (!profile.email) {
                          alert('You must be logged in to send weather alerts.');
                          return;
                        }
                        await axios.post(`${API}/weather/warning`, {
                          user_email: profile.email,
                          user_name: profile.name,
                          location: location.trim(),
                        });
                        alert('Warning system activated. Alert email sent!');
                      } catch (requestError) {
                        alert('Failed to send alert');
                      }
                    }}
                    disabled={loading || !location.trim()}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-300/20 bg-red-500/15 px-5 py-3 font-semibold text-red-100 transition hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <AlertTriangle className="h-5 w-5" />
                    {t('Scan & Alert')}
                  </button>
                </div>
              </div>

              {error && <p className="mt-4 rounded-2xl border border-red-300/20 bg-red-500/10 px-4 py-3 text-sm text-red-100" data-testid="weather-error">{error}</p>}
            </motion.div>
          </div>
        </section>

        {currentWeather && (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" data-testid="current-weather-card">
            {[
              {
                label: t('Temperature'),
                value: `${currentWeather.weather.temp}°C`,
                detail: t('Feels like {value}°C', { value: currentWeather.weather.feels_like }),
                icon: Thermometer,
                accent: 'from-orange-300/25 to-red-400/10',
              },
              {
                label: t('Humidity'),
                value: `${currentWeather.weather.humidity}%`,
                detail: t('Moisture in the air'),
                icon: Droplets,
                accent: 'from-cyan-300/25 to-sky-400/10',
              },
              {
                label: t('Wind Speed'),
                value: `${currentWeather.weather.wind_speed} m/s`,
                detail: t('Active airflow'),
                icon: Wind,
                accent: 'from-violet-300/25 to-indigo-400/10',
              },
              {
                label: t('Condition'),
                value: currentWeather.weather.description,
                detail: t('Visual atmosphere sync'),
                icon: Eye,
                accent: 'from-emerald-300/25 to-lime-400/10',
              },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.08 * index, ease: [0.16, 1, 0.3, 1] }}
                className={`${surfaceClassName} p-5`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.accent}`} />
                <div className="relative">
                  <div className="mb-10 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.24em] text-slate-600 dark:text-white/60">{item.label}</span>
                    <item.icon className="h-6 w-6 text-slate-700 dark:text-white/70" />
                  </div>
                  <div className="text-3xl font-black capitalize text-slate-900 dark:text-white">{item.value}</div>
                  <div className="mt-2 text-sm text-slate-800 dark:text-white/80">{item.detail}</div>
                </div>
              </motion.div>
            ))}
          </section>
        )}

        {forecast.length > 0 && (
          <section className={`${surfaceClassName} p-5 sm:p-6`} data-testid="forecast-card">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-slate-600 dark:text-white/60">{t('Forecast Window')}</div>
                <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{t('7-Day Forecast')}</h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/50 dark:border-white/10 bg-white/20 dark:bg-white/5 px-4 py-2 text-sm text-slate-700 dark:text-white/70 backdrop-blur-md">
                <Waves className="h-4 w-4" />
                {t('Animated atmosphere follows live condition data')}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {forecast.map((day, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.05 * index, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-[26px] border border-slate-200/50 dark:border-white/10 bg-white/90 dark:bg-black/20 p-5 backdrop-blur-xl transition hover:-translate-y-1.5 hover:bg-white/100 dark:hover:bg-black/25"
                  data-testid={`forecast-day-${index}`}
                >
                  <div className="mb-3 text-sm font-medium text-slate-600 dark:text-white/70">{day.date}</div>
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-black text-slate-900 dark:text-white">{Math.round(day.temp_max)}°</div>
                      <div className="text-sm text-slate-600 dark:text-white/60">{Math.round(day.temp_min)}°</div>
                    </div>
                    <Cloud className="h-10 w-10 text-emerald-600 dark:text-sky-200" />
                  </div>
                  <div className="mb-4 text-sm capitalize text-slate-800 dark:text-white/90">{day.description}</div>
                  <div className="space-y-2 text-xs text-slate-700 dark:text-white/70">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-emerald-500 dark:text-sky-200" />
                      <span>{t('{value}% humidity', { value: day.humidity })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CloudRain className="h-4 w-4 text-teal-500 dark:text-cyan-200" />
                      <span>{t('Rain: {value}%', { value: Math.round(day.rain_probability) })}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default Weather;
