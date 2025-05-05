import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiBookOpen, FiClock, FiAward, FiLayers } from "react-icons/fi";

const Home = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 text-gray-800 overflow-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 pt-20 pb-32">
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <motion.h1 
                className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                AI COURSE GENERATOR
              </motion.h1>
              
              <motion.p 
                className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Create, Customize, and Conquer Your Learning Journey with Our State-of-the-Art AI Tools, 
                Designed to Make Course Generation Effortless and Engaging.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <button 
                  onClick={() => navigate('/signup')} 
                  className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full text-lg font-semibold text-white hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-1"
                >
                  Get Started
                </button>
                <button 
                  onClick={() => navigate('/signin')} 
                  className="px-8 py-4 bg-transparent border-2 border-indigo-400 text-indigo-600 rounded-full text-lg font-semibold hover:bg-indigo-50 transition-all duration-300"
                >
                  Sign In
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Features Section */}
      <div className="relative z-10 bg-white py-20 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Revolutionize Your Learning Experience
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<FiBookOpen className="w-8 h-8" />}
              title="Personalized Courses"
              description="AI-generated courses tailored to your specific learning goals and preferences."
              delay={0.1}
            />
            <FeatureCard 
              icon={<FiClock className="w-8 h-8" />}
              title="Flexible Timeframes"
              description="Set your own pace with customizable schedules that adapt to your availability."
              delay={0.3}
            />
            <FeatureCard 
              icon={<FiAward className="w-8 h-8" />}
              title="Multiple Difficulty Levels"
              description="Choose from beginner, intermediate, or advanced content to match your expertise."
              delay={0.5}
            />
            <FeatureCard 
              icon={<FiLayers className="w-8 h-8" />}
              title="Comprehensive Resources"
              description="Access curated materials, quizzes, and progress tracking tools for effective learning."
              delay={0.7}
            />
          </div>
        </div>
      </div>
      
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute w-full h-full bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <Orbs />
      </div>
    </div>
  );
};

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="relative z-20 py-6 px-4 bg-white shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <img src="/logo.png" alt="Logo" className="h-10 w-10 mr-3" />
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            AI Course Generator
          </h1>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#pricing">Pricing</NavLink>
          <NavLink href="#about">About</NavLink>
          <button 
            onClick={() => navigate('/signin')} 
            className="px-5 py-2 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-full text-sm font-medium hover:bg-indigo-100 transition-colors"
          >
            Sign In
          </button>
        </div>
        
        <button className="md:hidden text-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </nav>
  );
};

const NavLink = ({ href, children }) => (
  <a 
    href={href} 
    className="text-gray-600 hover:text-indigo-600 transition-colors"
  >
    {children}
  </a>
);

const FeatureCard = ({ icon, title, description, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    viewport={{ once: true }}
    className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all duration-300"
  >
    <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full w-fit mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-3 text-indigo-800">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </motion.div>
);

const Orbs = () => {
  return (
    <>
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      <div className="absolute bottom-1/2 left-1/3 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-6000"></div>
    </>
  );
};

export default Home;