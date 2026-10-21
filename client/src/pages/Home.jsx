import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiBookOpen, FiClock, FiAward, FiLayers, FiArrowRight, FiCpu } from "react-icons/fi";

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const featuresRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);

    const ctx = gsap.context(() => {
      // Parallax orbs drift as the user scrolls
      gsap.to('.hero-orb-1', {
        y: 120,
        scrollTrigger: { trigger: document.body, start: 'top top', end: '60% top', scrub: 1.2 },
      });
      gsap.to('.hero-orb-2', {
        y: -100,
        scrollTrigger: { trigger: document.body, start: 'top top', end: '60% top', scrub: 1.4 },
      });
      gsap.to('.hero-orb-3', {
        y: 160, x: -60,
        scrollTrigger: { trigger: document.body, start: 'top top', end: '60% top', scrub: 1.6 },
      });

      // Feature cards cascade in on scroll
      gsap.from('.feature-card', {
        opacity: 0,
        y: 60,
        rotateX: -8,
        transformPerspective: 800,
        stagger: 0.15,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      });

      // Section heading underline sweep
      gsap.from('.features-heading-line', {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top 70%',
        },
      });
    });

    return () => ctx.revert();
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
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-medium"
              >
                <FiCpu className="w-4 h-4" />
                Powered by state-of-the-art AI
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                <SplitReveal text="AI COURSE" delay={0.2} />
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                  <SplitReveal text="GENERATOR" delay={0.5} />
                </span>
              </h1>

              <motion.p
                className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
              >
                Create, Customize, and Conquer Your Learning Journey with Our State-of-the-Art AI Tools,
                Designed to Make Course Generation Effortless and Engaging.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <MagneticButton
                  onClick={() => navigate('/signup')}
                  className="group px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full text-lg font-semibold text-white hover:shadow-xl hover:shadow-indigo-500/30 transition-shadow duration-300"
                >
                  <span className="flex items-center gap-2">
                    Get Started
                    <FiArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </MagneticButton>
                <MagneticButton
                  onClick={() => navigate('/signin')}
                  className="px-8 py-4 bg-white/70 backdrop-blur border-2 border-indigo-200 text-indigo-600 rounded-full text-lg font-semibold hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-300"
                >
                  Sign In
                </MagneticButton>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Features Section */}
      <div ref={featuresRef} className="relative z-10 bg-white py-20 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 inline-block">
              Revolutionize Your Learning Experience
            </h2>
            <div className="features-heading-line mt-4 h-1 w-24 mx-auto rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<FiBookOpen className="w-8 h-8" />}
              title="Personalized Courses"
              description="AI-generated courses tailored to your specific learning goals and preferences."
            />
            <FeatureCard
              icon={<FiClock className="w-8 h-8" />}
              title="Flexible Timeframes"
              description="Set your own pace with customizable schedules that adapt to your availability."
            />
            <FeatureCard
              icon={<FiAward className="w-8 h-8" />}
              title="Multiple Difficulty Levels"
              description="Choose from beginner, intermediate, or advanced content to match your expertise."
            />
            <FeatureCard
              icon={<FiLayers className="w-8 h-8" />}
              title="Comprehensive Resources"
              description="Access curated materials, quizzes, and progress tracking tools for effective learning."
            />
          </div>
        </div>
      </div>

      {/* Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute w-full h-full bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <Orbs />
      </div>
    </div>
  );
};

/* Letters cascade in one-by-one with a spring pop */
const SplitReveal = ({ text, delay = 0 }) => (
  <span className="inline-block" aria-label={text}>
    {text.split('').map((char, i) => (
      <motion.span
        key={i}
        className="inline-block"
        initial={{ opacity: 0, y: 40, rotateX: -90 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{
          delay: delay + i * 0.04,
          type: 'spring',
          stiffness: 200,
          damping: 16,
        }}
      >
        {char === ' ' ? ' ' : char}
      </motion.span>
    ))}
  </span>
);

/* Button subtly follows the cursor for a tactile, premium feel */
const MagneticButton = ({ children, className, onClick }) => {
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    const el = ref.current;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    gsap.to(el, { x: relX * 0.25, y: relY * 0.25, duration: 0.4, ease: 'power2.out' });
  };

  const handleMouseLeave = () => {
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
  };

  return (
    <button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={className}
    >
      {children}
    </button>
  );
};

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <motion.nav
      className="relative z-20 py-6 px-4 bg-white/80 backdrop-blur-md shadow-sm sticky top-0"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
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
          <motion.button
            onClick={() => navigate('/signin')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="px-5 py-2 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-full text-sm font-medium hover:bg-indigo-100 transition-colors"
          >
            Sign In
          </motion.button>
        </div>

        <button className="md:hidden text-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </motion.nav>
  );
};

const NavLink = ({ href, children }) => (
  <a
    href={href}
    className="relative text-gray-600 hover:text-indigo-600 transition-colors after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-indigo-500 after:transition-all after:duration-300 hover:after:w-full"
  >
    {children}
  </a>
);

const FeatureCard = ({ icon, title, description }) => (
  <div className="feature-card group bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:shadow-indigo-100 hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300">
    <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full w-fit mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-3 text-indigo-800">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const Orbs = () => {
  return (
    <>
      <div className="hero-orb-1 absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="hero-orb-2 absolute top-1/3 right-1/4 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="hero-orb-3 absolute bottom-1/4 right-1/3 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      <div className="absolute bottom-1/2 left-1/3 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-6000"></div>
    </>
  );
};

export default Home;
