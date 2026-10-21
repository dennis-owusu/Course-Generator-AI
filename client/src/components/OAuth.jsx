import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { app } from '../firebase';
import { signInFailure, signInSuccess } from '../redux/user/userSlice'
import { useDispatch } from 'react-redux';

const OAuth = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = getAuth(app);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoogleClick = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      if (result) {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: result.user.displayName,
            username: result.user.displayName,
            email: result.user.email,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          dispatch(signInSuccess(data));
          setShowSuccessModal(true);
          setTimeout(() => {
            setShowSuccessModal(false);
            navigate('/dashboard');
          }, 1600);
        } else {
          dispatch(signInFailure(data.message));
        }
      }
    } catch (error) {
      console.error('Error:', error);
      dispatch(signInFailure(error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <motion.button
        onClick={handleGoogleClick}
        whileHover={{ scale: loading ? 1 : 1.015 }}
        whileTap={{ scale: loading ? 1 : 0.985 }}
        className="h-12 px-4 border border-white/10 bg-white/5 flex items-center justify-center gap-3 rounded-xl w-full hover:bg-white/10 hover:border-white/20 transition-colors focus:ring-2 focus:ring-indigo-500/60 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? (
          <span className="w-5 h-5 border-2 border-slate-500 border-t-slate-200 rounded-full animate-spin" />
        ) : (
          <FcGoogle className="w-5 h-5" />
        )}
        <span className="font-medium text-slate-200">{loading ? 'Processing...' : 'Continue with Google'}</span>
      </motion.button>

      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-slate-900 border border-white/10 rounded-2xl p-10 max-w-sm w-full mx-4 shadow-2xl shadow-indigo-950/50"
              initial={{ opacity: 0, scale: 0.85, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 12 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            >
              <div className="text-center">
                <motion.div
                  className="w-16 h-16 mx-auto bg-emerald-500/15 border border-emerald-500/30 rounded-full flex items-center justify-center mb-5"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="w-8 h-8 text-emerald-400"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <motion.path
                      d="M20 6L9 17l-5-5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
                    />
                  </svg>
                </motion.div>
                <h2 className="text-xl font-bold text-slate-100 mb-2">Welcome!</h2>
                <p className="text-slate-400 text-sm">You have successfully signed in.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OAuth;
