import React from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm z-50 animate-fade-in">
      <div className="relative flex flex-col items-center">
        {/* Lottie Animation */}
        <DotLottieReact
          src="https://lottie.host/98b490a6-5733-4eec-b9c4-5b9b81d1b106/TNGqyuPwnr.lottie"
          loop
          autoplay
          className="w-64 h-64 sm:w-80 sm:h-80"
        />
       
        {/* Loading Text */}
        <p className="mt-4 text-indigo-900 text-lg font-semibold">Generating Your Course...</p>
      </div> 
    </div>
  )
}

export default Loader