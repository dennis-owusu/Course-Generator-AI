import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
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
          console.log(result)
          setShowSuccessModal(true);
          setTimeout(() => {
            setShowSuccessModal(false);
          }, 2000);
          navigate('/dashboard?tab=home');
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
      <button
        onClick={handleGoogleClick}
        className="p-3 border border-gray-300 flex items-center justify-center gap-3 rounded-lg w-full hover:bg-gray-50 transition-colors shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
        disabled={loading}
      >
        <FcGoogle className="w-6 h-6" />
        <span className="font-medium text-gray-700">{loading ? 'Processing...' : 'Continue with Google'}</span>
      </button>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-12 transform transition-all duration-500 ease-in-out animate-fade-in-up max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                <svg
                  width="124"
                  height="124"
                  viewBox="0 0 124 124"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="animate-scale-in"
                >
                  <path
                    d="M48.9781 6.74924C55.3273 -2.24974 68.6727 -2.24975 75.0219 6.74924L75.4298 7.32744C78.9766 12.3545 85.1003 14.8911 91.163 13.8443L91.8603 13.724C102.713 11.8503 112.15 21.2869 110.276 32.1397L110.156 32.837C109.109 38.8997 111.645 45.0234 116.673 48.5702L117.251 48.9781C126.25 55.3273 126.25 68.6727 117.251 75.0219L116.673 75.4298C111.645 78.9766 109.109 85.1003 110.156 91.163L110.276 91.8603C112.15 102.713 102.713 112.15 91.8603 110.276L91.163 110.156C85.1003 109.109 78.9766 111.645 75.4298 116.673L75.0219 117.251C68.6727 126.25 55.3273 126.25 48.9781 117.251L48.5702 116.673C45.0234 111.645 38.8997 109.109 32.837 110.156L32.1397 110.276C21.2869 112.15 11.8503 102.713 13.724 91.8603L13.8443 91.163C14.8911 85.1003 12.3545 78.9766 7.32744 75.4298L6.74924 75.0219C-2.24975 68.6727 -2.24975 55.3273 6.74924 48.9781L7.32744 48.5702C12.3545 45.0234 14.8911 38.8997 13.8443 32.837L13.724 32.1397C11.8503 21.2869 21.2869 11.8503 32.1397 13.724L32.837 13.8443C38.8997 14.8911 45.0234 12.3545 48.5702 7.32745L48.9781 6.74924Z"
                    fill="#C8E6C9"
                    className="animate-fade-in"
                  />
                  <path
                    d="M51.2344 83.6044H51.2394H51.2394H51.2395H51.2395H51.2396H51.2396H51.2397H51.2397H51.2397H51.2398H51.2398H51.2399H51.2399H51.2399H51.24H51.24H51.2401H51.2401H51.2402H51.2402H51.2402H51.2403H51.2403H51.2404H51.2404H51.2405H51.2405H51.2405H51.2406H51.2406H51.2407H51.2407H51.2407H51.2408H51.2408H51.2409H51.2409H51.241H51.241H51.241H51.2411H51.2411H51.2412H51.2412H51.2413H51.2413H51.2413H51.2414H51.2414H51.2415H51.2415H51.2415H51.2416H51.2416H51.2417H51.2417H51.2418H51.2418H51.2418H51.2419H51.2419H51.242H51.242H51.2421H51.2421H51.2421H51.2422H51.2422H51.2423H51.2423H51.2423H51.2424H51.2424H51.2425H51.2425H51.2426H51.2426H51.2426H51.2427H51.2427H51.2428H51.2428H51.2429H51.2429H51.2429H51.243H51.243H51.2431H51.2431H51.2431H51.2432H51.2432H51.2433H51.2433H51.2434H51.2434H51.2434H51.2435H51.2435H51.2436H51.2436H51.2437H51.2437H51.2437H51.2438H51.2438H51.2439H51.2439H51.2439H51.244H51.244H51.2441H51.2441H51.2442H51.2442H51.2442H51.2443H51.2443H51.2444H51.2444H51.2444H51.2445H51.2445H51.2446H51.2446H51.2447H51.2447H51.2447H51.2448H51.2448H51.2449H51.2449H51.245H51.245H51.245H51.2451H51.2451H51.2452H51.2452H51.2453H51.2453H51.2453H51.2454H51.2454H51.2455H51.2455H51.2455H51.2456H51.2456H51.2457H51.2457H51.2458H51.2458H51.2458H51.2459H51.2459H51.246H51.246H51.2461H51.2461H51.2461H51.2462H51.2462H51.2463H51.2463H51.2463H51.2464H51.2464H51.2465H51.2465H51.2466H51.2466H51.2466H51.2467H51.2467H51.2468H51.2468H51.2469H51.2469H51.2469H51.247H51.247H51.2471H51.2471H51.2471H51.2472H51.2472H51.2473H51.2473H51.2474H51.2474H51.2474H51.2475H51.2475H51.2476H51.2476H51.2477H51.2477H51.2477H51.2478H51.2478H51.2479H51.2479H51.2479H51.248H51.248H51.2481H51.2481H51.2482H51.2482H51.2482H51.2483H51.2483H51.2484H51.2484H51.2484H51.2485H51.2485H51.2486H51.2486H51.2487H51.2487H51.2487H51.2488H51.2488H51.2489H51.2489H51.249H51.249H51.249H51.2491H51.2491H51.2492H51.2492H51.2492H51.2493H51.2493H51.2494H51.2494H51.2495H51.2495H51.2495H51.2496H51.2496H51.2497H51.2497H51.2498H51.2498H51.2498H51.2499H51.2499H51.25H51.25H51.25H51.2501H51.2501H51.2502C52.2268 83.6044 53.1665 83.2172 53.8572 82.5225C53.8578 82.5219 53.8584 82.5213 53.859 82.5207L89.6898 46.6899C91.1302 45.2495 91.1302 42.9141 89.6898 41.4736C88.2493 40.0332 85.9141 40.0332 84.4736 41.4736L51.2665 74.6808L39.5435 62.7719C39.5433 62.7718 39.5432 62.7717 39.5431 62.7715C38.1148 61.3191 35.7763 61.3068 34.3274 62.7312L34.3262 62.7324C32.8774 64.1615 32.8559 66.4962 34.2872 67.9478C34.2874 67.948 34.2876 67.9482 34.2878 67.9484L48.6206 82.5033L48.621 82.5038C49.3137 83.2063 50.2528 83.5994 51.2344 83.6044Z"
                    fill="#43A048"
                    stroke="#43A048"
                    strokeWidth="2"
                    className="animate-draw-checkmark"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Congratulations!</h2>
              <p className="text-gray-600">You have successfully signed in!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OAuth;