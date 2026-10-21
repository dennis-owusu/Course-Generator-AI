import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import { getApiUrl } from './lib/api-config'
import { signInSuccess, signOutSuccess } from './redux/user/userSlice'
import Home from './pages/Home'
import SignUp from './authentication/SignUp'
import Dashboard from './pages/Dashboard'
import DashboardHome from './pages/DashboardHome'
import MyCourses from './pages/MyCourses'
import AIStudyAssistant from './pages/AIStudyAssistant'
import CaseStudyAssistant from './pages/CaseStudyAssistant'
import ClinicalPractice from './pages/ClinicalPractice'
import Assignments from './pages/Assignments'
import StudyGroups from './pages/StudyGroups'
import Leaderboard from './pages/Leaderboard'
import Settings from './pages/Settings'
import LiveClasses from './pages/LiveClasses'
import CreateCourse from './pages/CreateCourse'
import CourseDetail from './pages/CourseDetail'
import Upgrade from './pages/Upgrade'
import SignIn from './authentication/SignIn'

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await axios.get(getApiUrl('/api/auth/me'), { withCredentials: true })
        if (res.data?.success && res.data.user) {
          dispatch(signInSuccess(res.data.user))
        }
      } catch (err) {
        // No active session
        dispatch(signOutSuccess())
      }
    }
    verifySession()
  }, [dispatch])

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public / auth routes */}
        <Route path='/' element={<PageTransition><Home /></PageTransition>} />
        <Route path='/signin' element={<SignIn />} />
        <Route path='/signup' element={<SignUp />} />

        {/* Legacy redirects */}
        <Route path='/leaderboard' element={<Navigate to='/dashboard/leaderboard' replace />} />
        <Route path='/create-course' element={<PageTransition><CreateCourse /></PageTransition>} />
        <Route path='/course/:courseId' element={<PageTransition><CourseDetail /></PageTransition>} />

        {/* Dashboard shell with nested sidebar pages */}
        <Route path='/dashboard' element={<Dashboard />}>
          <Route index element={<DashboardHome />} />
          <Route path='my-courses' element={<MyCourses />} />
          <Route path='ai-study-assistant' element={<AIStudyAssistant />} />
          <Route path='case-study-assistant' element={<CaseStudyAssistant />} />
          <Route path='clinical-practice' element={<ClinicalPractice />} />
          <Route path='live-classes' element={<LiveClasses />} />
          <Route path='assignments' element={<Assignments />} />
          <Route path='study-groups' element={<StudyGroups />} />
          <Route path='leaderboard' element={<Leaderboard />} />
          <Route path='settings' element={<Settings />} />
          <Route path='upgrade' element={<Upgrade />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}

export default App
