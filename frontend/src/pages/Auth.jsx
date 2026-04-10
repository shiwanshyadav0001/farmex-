import { useMemo, useState, lazy, Suspense } from 'react';
import { Leaf, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FarmScene = lazy(() => import('@/components/3d/FarmScene'));

const highlights = [
  'Live crop planning with localized farm guidance',
  'Faster decisions with weather, market, and risk signals',
  'Cleaner records for season planning and field execution',
];

function saveProfile(profile) {
  localStorage.setItem('farmex-profile', JSON.stringify(profile));
}

function buildLocationLabel(data) {
  const address = data?.address || {};
  return (
    address.city ||
    address.town ||
    address.village ||
    address.county ||
    address.state_district ||
    address.state ||
    data?.display_name?.split(',').slice(0, 2).join(', ') ||
    ''
  );
}

function updateProfileLocation(profile) {
  if (typeof window === 'undefined' || !navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}`,
          { headers: { Accept: 'application/json' } }
        );
        const data = response.ok ? await response.json() : null;
        const label = buildLocationLabel(data) || `${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)}`;
        const nextProfile = {
          ...profile,
          currentLocation: {
            label,
            latitude: coords.latitude,
            longitude: coords.longitude,
            detectedAt: new Date().toISOString(),
          },
        };

        saveProfile(nextProfile);
        window.dispatchEvent(new Event('storage'));
      } catch (error) {
        console.error('Could not resolve current location', error);
      }
    },
    (error) => {
      console.error('Location permission or detection failed', error);
    },
    {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000,
    }
  );
}

export default function Auth({ onAuthenticate }) {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const title = useMemo(
    () => (mode === 'login' ? 'Welcome back to Farmex' : 'Create your Farmex account'),
    [mode]
  );

  const subtitle = useMemo(
    () =>
      mode === 'login'
        ? 'Step back into your farm workspace with weather, crop, and planning tools in one calm flow.'
        : 'Start with one secure account and unlock your animated agriculture workspace.',
    [mode]
  );

  const handleChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const existingUsers = JSON.parse(localStorage.getItem('farmex-users') || '[]');
    
    // Normalize data
    const email = formData.email.trim().toLowerCase();
    const password = formData.password.trim();
    const confirmPassword = formData.confirmPassword.trim();
    const name = formData.name.trim();

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      const userExists = existingUsers.some((user) => user.email.toLowerCase() === email);
      if (userExists) {
        setError('An account with this email already exists.');
        return;
      }
      const newUser = {
        name: name || 'Farmer',
        email: email,
        password: password,
      };
      existingUsers.push(newUser);
      localStorage.setItem('farmex-users', JSON.stringify(existingUsers));
      const profile = {
        name: newUser.name,
        email: newUser.email,
        authenticatedAt: new Date().toISOString(),
      };
      fetch('http://127.0.0.1:8001/api/email/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_name: profile.name, user_email: profile.email }),
      }).catch((err) => console.error('Could not send welcome email request', err));
      localStorage.setItem('farmex-authenticated', 'true');
      saveProfile(profile);
      updateProfileLocation(profile);
      onAuthenticate(profile);
    } else if (mode === 'login') {
      const validUser = existingUsers.find(
        (user) => user.email.toLowerCase() === email && user.password === password
      );
      if (!validUser) {
        setError('Invalid email or password.');
        return;
      }
      const profile = {
        name: validUser.name,
        email: validUser.email,
        authenticatedAt: new Date().toISOString(),
      };
      localStorage.setItem('farmex-authenticated', 'true');
      saveProfile(profile);
      updateProfileLocation(profile);
      onAuthenticate(profile);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.1 } },
    exit: { opacity: 0, scale: 1.05 },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#f0fdf4] text-[#10211d]">
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<div className="absolute inset-0 bg-emerald-50" />}>
          <FarmScene />
        </Suspense>
      </div>

      {/* Soft natural overlay */}
      <div className="absolute inset-0 z-[1] bg-white/5 backdrop-blur-[1px]" />

      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="z-10 w-full max-w-6xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center"
      >
        <div className="flex flex-col gap-6">
          <motion.div variants={itemVariants} className="flex items-center gap-4">
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-2xl bg-emerald-400/30 blur-xl"
              />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2e7d32] text-white shadow-lg ring-4 ring-white/50">
                <Leaf className="h-7 w-7" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-[#1b3a24]">Farmex</h1>
              <p className="text-xs font-bold uppercase tracking-[0.4em] text-[#2e7d32]/60">Agri Operating System</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-700 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-[#ffb300] mr-2 animate-pulse" />
              Live Farm Working Background
            </div>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-[#1b3a24]">
              {title}
            </h2>
            <p className="text-lg text-[#1b3a24]/80 font-medium leading-relaxed max-w-lg">{subtitle}</p>
          </motion.div>

          <motion.ul variants={itemVariants} className="grid grid-cols-1 gap-4 text-[#1b3a24]/70 text-base font-bold">
            {highlights.map((item, i) => (
              <motion.li
                key={item}
                className="flex items-center gap-4 bg-white/40 p-3 rounded-2xl border border-white/60 backdrop-blur-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 + 0.5, duration: 0.5 }}
              >
                <div className="h-8 w-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <span>{item}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        <motion.div variants={itemVariants} className="relative w-full max-w-md mx-auto">
          {/* Card Shadow */}
          <div className="absolute -inset-4 bg-emerald-400/20 blur-3xl rounded-[3rem]" />

          <div className="relative rounded-[3rem] border-4 border-white bg-white/70 p-8 backdrop-blur-2xl shadow-2xl">
            <div className="flex p-1.5 bg-emerald-50/80 rounded-2xl mb-6 relative">
              <div 
                className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#2e7d32] shadow-lg rounded-xl transition-all duration-500 ${mode === 'login' ? 'left-1.5' : 'left-[50.5%]'}`} 
                style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
              />
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className={`relative flex-1 py-3 text-sm font-black z-10 rounded-xl transition-colors duration-300 ${mode === 'login' ? 'text-white' : 'text-emerald-800/40 hover:text-emerald-800/60'}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); }}
                className={`relative flex-1 py-3 text-sm font-black z-10 rounded-xl transition-colors duration-300 ${mode === 'register' ? 'text-white' : 'text-emerald-800/40 hover:text-emerald-800/60'}`}
              >
                Register
              </button>
            </div>

            <div className="mb-6 text-center">
              <h2 className="text-2xl font-black text-[#1b3a24] mb-2">
                {mode === 'login' ? 'Welcome back' : 'Start growing'}
              </h2>
              <p className="text-emerald-800/60 font-medium text-sm">
                {mode === 'login'
                  ? 'Access your agricultural workspace.'
                  : 'Join the next generation of farm command.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="popLayout">
                {mode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-[10px] font-black text-emerald-800/40 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      required
                      className="w-full bg-white/50 border-2 border-emerald-50 rounded-2xl px-5 py-3 text-[#1b3a24] placeholder-emerald-200 focus:outline-none focus:border-[#2e7d32] focus:ring-4 focus:ring-[#2e7d32]/10 transition-all font-bold"
                      placeholder="Farmer Name"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-[10px] font-black text-emerald-800/40 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  className="w-full bg-white/50 border-2 border-emerald-50 rounded-2xl px-5 py-3 text-[#1b3a24] placeholder-emerald-200 focus:outline-none focus:border-[#2e7d32] focus:ring-4 focus:ring-[#2e7d32]/10 transition-all font-bold"
                  placeholder="farmer@farmex.io"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-emerald-800/40 uppercase tracking-widest mb-1.5 ml-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                  className="w-full bg-white/50 border-2 border-emerald-50 rounded-2xl px-5 py-3 text-[#1b3a24] placeholder-emerald-200 focus:outline-none focus:border-[#2e7d32] focus:ring-4 focus:ring-[#2e7d32]/10 transition-all font-bold"
                  placeholder="••••••••"
                />
              </div>

              <AnimatePresence mode="popLayout">
                {mode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-[10px] font-black text-emerald-800/40 uppercase tracking-widest mb-1.5 ml-1">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      required
                      className="w-full bg-white/50 border-2 border-emerald-50 rounded-2xl px-5 py-3 text-[#1b3a24] placeholder-emerald-200 focus:outline-none focus:border-[#2e7d32] focus:ring-4 focus:ring-[#2e7d32]/10 transition-all font-bold"
                      placeholder="••••••••"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-600 text-sm font-bold p-4 bg-red-50 rounded-2xl border-2 border-red-100"
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="group relative w-full flex items-center justify-center gap-3 bg-[#2e7d32] text-white font-black text-lg py-4 rounded-2xl shadow-[0_15px_30px_-5px_rgba(46,125,50,0.4)] transition-all mt-4"
              >
                <span className="relative z-10">{mode === 'login' ? 'Enter Command Center' : 'Create Farm OS'}</span>
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <div className="flex items-center justify-center gap-2 text-emerald-800/30 text-xs font-bold mt-6">
                <ShieldCheck className="h-4 w-4" />
                <span>Agricultural standard encryption</span>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
