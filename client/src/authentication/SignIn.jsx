import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signInStart, signInSuccess, signInFailure } from '../redux/user/userSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import OAuth from '../components/OAuth';
import { FiMail, FiLock } from 'react-icons/fi';

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
      // Replace with your actual API endpoint for signin
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      console.log(data);
      if (data.success === false) {
        dispatch(signInFailure(data.message));
        return;
      }
      dispatch(signInSuccess(data));
      navigate('/dashboard?tab=home'); // Navigate to home or dashboard after successful signin
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white p-4'>
      <div className='w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden'>
        <div className='bg-indigo-600 p-6 text-center'>
          <img src='/logo.png' alt='Logo' className='h-12 mx-auto mb-2' />
          <h1 className='text-3xl font-bold text-white'>Welcome Back</h1>
          <p className='text-indigo-200 mt-1'>Sign in to continue your learning journey</p>
        </div>
        
        <div className='p-6'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <FiMail className='text-gray-400' />
              </div>
              <Input
                type='email'
                placeholder='Email'
                className='pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                id='email'
                onChange={handleChange}
                required
              />
            </div>
            
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <FiLock className='text-gray-400' />
              </div>
              <Input
                type='password'
                placeholder='Password'
                className='pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                id='password'
                onChange={handleChange}
                required
              />
            </div>

            <Button
              disabled={loading}
              type='submit'
              className='w-full bg-indigo-600 text-white p-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70'
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className='mt-6'>
            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-gray-300'></div>
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='px-2 bg-white text-gray-500'>Or continue with</span>
              </div>
            </div>
            
            <div className='mt-6'>
              <OAuth />
            </div>
          </div>
          
          <div className='mt-6 text-center'>
            <p className='text-gray-600'>Don't have an account? 
              <Link to='/signup' className='text-indigo-600 font-medium hover:text-indigo-500 ml-1'>
                Sign up
              </Link>
            </p>
          </div>
          
          {error && (
            <div className='mt-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm'>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignIn;
