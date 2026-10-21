import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { signInStart, signInSuccess, signInFailure } from '../redux/user/userSlice';
import { Input } from '@/components/ui/input';
import OAuth from '../components/OAuth';
import AuthLayout from '@/components/auth/AuthLayout';
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';

const fieldVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: 0.25 + i * 0.1, ease: 'easeOut' },
  }),
};

const SignIn = () => {
  const [formData, setFormData] = useState({});
  const { loading, error } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(signInStart());
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(signInFailure(data.message));
        return;
      }
      dispatch(signInSuccess(data));
      navigate('/dashboard');
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue your learning journey"
      footer={
        <p>
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors">
            Sign up
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible" className="relative group">
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

        <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible" className="relative group">
          <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          <Input
            type="password"
            placeholder="Password"
            className="pl-11 h-12 w-full bg-white/5 border-white/10 text-slate-100 placeholder:text-slate-500 rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:border-indigo-500/60 transition-all"
            id="password"
            onChange={handleChange}
            required
          />
        </motion.div>

        <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
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
              {loading ? 'Signing in...' : 'Sign In'}
            </span>
          </motion.button>
        </motion.div>
      </form>

      <motion.div
        custom={3}
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

export default SignIn;
