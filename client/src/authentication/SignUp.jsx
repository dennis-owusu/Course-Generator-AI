import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import OAuth from '@/components/OAuth';
import AuthLayout from '@/components/auth/AuthLayout';
import { FiUser, FiMail, FiLock, FiAlertCircle, FiCheck } from 'react-icons/fi';

const fieldVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: 0.25 + i * 0.1, ease: 'easeOut' },
  }),
};

const SignUp = () => {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const password = formData.password || '';
  const passwordChecks = [
    { label: 'At least 6 characters', valid: password.length >= 6 },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        setError(data.message);
        return;
      }
      navigate('/signin');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join and start generating courses in seconds"
      footer={
        <p>
          Already have an account?{' '}
          <Link to="/signin" className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible" className="relative group">
          <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          <Input
            type="text"
            placeholder="Username"
            className="pl-11 h-12 w-full bg-white/5 border-white/10 text-slate-100 placeholder:text-slate-500 rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:border-indigo-500/60 transition-all"
            id="username"
            onChange={handleChange}
            required
          />
        </motion.div>

        <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible" className="relative group">
          <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          <Input
            type="email"
            placeholder="Email address"
            className="pl-11 h-12 w-full bg-white/5 border-white/10 text-slate-100 placeholder:text-slate-500 rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:border-indigo-500/60 transition-all"
            id="email"
            onChange={handleChange}
            required
          />
        </motion.div>

        <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
          <div className="relative group">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <Input
              type="password"
              placeholder="Password"
              className="pl-11 h-12 w-full bg-white/5 border-white/10 text-slate-100 placeholder:text-slate-500 rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:border-indigo-500/60 transition-all"
              id="password"
              onChange={handleChange}
              required
            />
          </div>

          <AnimatePresence>
            {password.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-2 flex flex-wrap gap-2">
                  {passwordChecks.map((check) => (
                    <span
                      key={check.label}
                      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-colors ${
                        check.valid
                          ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                          : 'text-slate-500 border-white/10 bg-white/5'
                      }`}
                    >
                      <FiCheck className="w-3 h-3" />
                      {check.label}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
          <motion.button
            disabled={loading}
            type="submit"
            whileHover={{ scale: loading ? 1 : 1.015 }}
            whileTap={{ scale: loading ? 1 : 0.985 }}
            className="relative w-full h-12 rounded-xl font-semibold text-white overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-950/50"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading && (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              {loading ? 'Creating account...' : 'Create Account'}
            </span>
          </motion.button>
        </motion.div>
      </form>

      <motion.div
        custom={4}
        variants={fieldVariants}
        initial="hidden"
        animate="visible"
        className="mt-7"
      >
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wider">
            <span className="px-3 bg-[#0c1222] text-slate-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-5">
          <OAuth />
        </div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            key={error}
            initial={{ opacity: 0, x: 0, height: 0 }}
            animate={{
              opacity: 1,
              height: 'auto',
              x: [0, -8, 8, -5, 5, 0],
              transition: { duration: 0.45, ease: 'easeOut' },
            }}
            exit={{ opacity: 0, height: 0, transition: { duration: 0.25 } }}
            className="overflow-hidden"
          >
            <div className="mt-5 flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
              <FiAlertCircle className="shrink-0" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
};

export default SignUp;
