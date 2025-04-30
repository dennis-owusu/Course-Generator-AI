import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useSignUp,
  SignedOut,
  SignUp as ClerkSignUp,
} from "@clerk/clerk-react";

const SignUp = () => {
  const navigate = useNavigate();
  const { setActive } = useSignUp();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUpComplete = async (session) => {
    try {
      setLoading(true);
      await setActive({ session: session.id });
      navigate('/dashboard'); // Redirect to dashboard after sign-up
    } catch (err) {
      console.error('Error during sign-up completion:', err);
      setError('An error occurred during sign-up completion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {loading ? (
        <p className="text-lg font-semibold">Loading...</p>
      ) : (
        <div className="w-full max-w-md p-6 shadow-md rounded-lg">
          <SignedOut>
            <ClerkSignUp
              path="/sign-up"
              routing="path"
              signInUrl="/sign-in"
              afterSignUp={(session) => handleSignUpComplete(session)}
            />
          </SignedOut>
          <p className="text-sm text-red-500 mt-4">{error && error}</p>
        </div>
      )}
    </div>
  );
};

export default SignUp;