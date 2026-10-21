import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { FiBookOpen, FiCpu, FiTrendingUp } from 'react-icons/fi';

const panelFeatures = [
  { icon: <FiCpu />, text: 'AI-crafted curricula in seconds' },
  { icon: <FiBookOpen />, text: 'Structured chapters & resources' },
  { icon: <FiTrendingUp />, text: 'Track progress as you learn' },
];

const AuthLayout = ({ title, subtitle, children, footer }) => {
  const orbsRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Continuous slow drift for ambient orbs
      gsap.to('.auth-orb-1', {
        x: 60, y: -40, scale: 1.15,
        duration: 9, repeat: -1, yoyo: true, ease: 'sine.inOut',
      });
      gsap.to('.auth-orb-2', {
        x: -50, y: 60, scale: 0.9,
        duration: 11, repeat: -1, yoyo: true, ease: 'sine.inOut',
      });
      gsap.to('.auth-orb-3', {
        x: 40, y: 50, scale: 1.1,
        duration: 13, repeat: -1, yoyo: true, ease: 'sine.inOut',
      });
      // Gentle rotation of the decorative ring
      gsap.to('.auth-ring', {
        rotation: 360, duration: 40, repeat: -1, ease: 'none',
        transformOrigin: 'center center',
      });
    }, orbsRef);

    // Subtle parallax on the brand panel following the cursor
    const panel = panelRef.current;
    const handleMouseMove = (e) => {
      const rect = panel.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to('.auth-parallax', {
        x: relX * 18, y: relY * 18,
        duration: 0.8, ease: 'power2.out',
      });
    };
    panel.addEventListener('mousemove', handleMouseMove);

    return () => {
      ctx.revert();
      panel.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 overflow-hidden">
      {/* Brand / visual panel */}
      <div
        ref={panelRef}
        className="hidden lg:flex relative w-1/2 flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950"
      >
        {/* Ambient orbs */}
        <div ref={orbsRef} className="absolute inset-0 pointer-events-none">
          <div className="auth-orb-1 absolute -top-20 -left-20 w-96 h-96 rounded-full bg-indigo-600/30 blur-3xl" />
          <div className="auth-orb-2 absolute top-1/2 -right-24 w-[28rem] h-[28rem] rounded-full bg-purple-600/25 blur-3xl" />
          <div className="auth-orb-3 absolute -bottom-24 left-1/4 w-80 h-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <svg className="auth-ring absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] opacity-20" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="90" stroke="url(#ringGrad)" strokeWidth="0.5" strokeDasharray="4 6" />
            <circle cx="100" cy="100" r="70" stroke="url(#ringGrad)" strokeWidth="0.5" strokeDasharray="2 8" />
            <defs>
              <linearGradient id="ringGrad" x1="0" y1="0" x2="200" y2="200">
                <stop stopColor="#818cf8" />
                <stop offset="1" stopColor="#c084fc" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <motion.div
          className="auth-parallax relative z-10 flex items-center gap-3"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <img src="/logo.png" alt="Logo" className="h-11 w-11 drop-shadow-lg" />
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300">
            AI Course Generator
          </span>
        </motion.div>

        <div className="auth-parallax relative z-10">
          <motion.h2
            className="text-4xl xl:text-5xl font-bold leading-tight"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
          >
            Learn anything,
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400">
              generated just for you.
            </span>
          </motion.h2>

          <motion.p
            className="mt-4 text-slate-400 max-w-md"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
          >
            Turn any topic into a complete, personalized course — powered by AI.
          </motion.p>

          <div className="mt-10 space-y-4">
            {panelFeatures.map((f, i) => (
              <motion.div
                key={f.text}
                className="flex items-center gap-3 text-slate-300"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.45 + i * 0.15, ease: 'easeOut' }}
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-indigo-300">
                  {f.icon}
                </span>
                <span className="text-sm">{f.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.p
          className="relative z-10 text-xs text-slate-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          © {new Date().getFullYear()} AI Course Generator
        </motion.p>
      </div>

      {/* Form panel */}
      <div className="relative flex-1 flex items-center justify-center p-6 sm:p-10">
        {/* Mobile-only ambient glow */}
        <div className="lg:hidden absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-purple-600/20 blur-3xl" />
        </div>

        <motion.div
          className="relative w-full max-w-md"
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-2xl shadow-indigo-950/40 p-8 sm:p-10">
            <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
              <img src="/logo.png" alt="Logo" className="h-9 w-9" />
              <span className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300">
                AI Course Generator
              </span>
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
              <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
            </motion.div>

            <div className="mt-8">{children}</div>
          </div>

          {footer && (
            <motion.div
              className="mt-6 text-center text-sm text-slate-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {footer}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
