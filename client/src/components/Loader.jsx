import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">

        <DotLottieReact
          src="https://lottie.host/98b490a6-5733-4eec-b9c4-5b9b81d1b106/TNGqyuPwnr.lottie"
          loop
          autoplay
          className='w-80 h-80'
        />
    </div>
  );
};

export default Loader;