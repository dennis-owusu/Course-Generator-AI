import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { getApiUrl } from '../lib/api-config'
import {
  HiOutlineBookOpen,
  HiOutlineFire,
  HiOutlineBeaker,
  HiOutlineClipboardDocumentList,
  HiOutlineArrowRight,
  HiOutlinePaperAirplane,
  HiOutlineTrophy,
  HiOutlineSparkles,
  HiOutlineExclamationCircle,
} from 'react-icons/hi2'

const HeroImage = () => (
  <img
    src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Professional%20Ghanaian%20nursing%20students%20in%20modern%20clinical%20simulation%20lab%2C%20wearing%20white%20uniforms%2C%20practicing%20patient%20care%20on%20a%20medical%20manikin%2C%20bright%20clean%20hospital%20training%20room%2C%20warm%20lighting%2C%20diverse%20young%20adults%2C%20confident%20and%20focused%2C%20realistic%20photography&image_size=landscape_4_3"
    alt="Ghanaian nursing students in clinical simulation training"
    className="w-full h-full object-cover rounded-2xl"
  />
)

const DashboardHome = () => {
  const navigate = useNavigate()
  const { currentUser } = useSelector(state => state.user)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({ coursesInProgress: 0, studyStreak: 0, upcomingClinical: 0, assignmentsDue: 0, completedLessons: 0, points: 0, rank: 0 })
  const [courses, setCourses] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: 'Hello! I am your AI Nursing Study Assistant. Ask me anything about nursing concepts, clinical skills, pharmacology, or exam preparation.' },
  ])
  const [input, setInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!currentUser?._id) return

    const fetchDashboard = async () => {
      try {
        setLoading(true)
        setError('')
        const [statsRes, coursesRes, lbRes] = await Promise.all([
          axios.get(getApiUrl(`/api/dashboard/stats/${currentUser._id}`), { withCredentials: true }),
          axios.get(getApiUrl(`/api/dashboard/my-courses/${currentUser._id}`), { withCredentials: true }),
          axios.get(getApiUrl('/api/dashboard/leaderboard/top'), { withCredentials: true }),
        ])
        if (statsRes.data?.success) setStats(statsRes.data.stats)
        if (coursesRes.data?.success) setCourses(coursesRes.data.courses)
        if (lbRes.data?.success) setLeaderboard(lbRes.data.leaderboard)
      } catch (err) {
        console.error('Error loading dashboard:', err)
        setError(err.response?.data?.message || 'Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [currentUser?._id])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg = { id: Date.now(), sender: 'user', text: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setChatLoading(true)

    try {
      const res = await axios.post(getApiUrl('/api/ai-assistant/ask'), { message: userMsg.text }, { withCredentials: true })
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: res.data.reply }])
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: 'Sorry, I could not reach the AI service. Please try again later.',
      }])
    } finally {
      setChatLoading(false)
    }
  }

  const firstName = currentUser?.name?.split(' ')[0] || currentUser?.username || 'Ama'

  const statCards = [
    { label: 'Courses in Progress', value: stats.coursesInProgress, desc: 'Keep the momentum going', icon: HiOutlineBookOpen, color: 'bg-[#DDF3E8] text-[#103B46]' },
    { label: 'Study Streak', value: stats.studyStreak, desc: 'days in a row', icon: HiOutlineFire, color: 'bg-[#FEF3C7] text-[#92400E]' },
    { label: 'Upcoming Clinical Session', value: stats.upcomingClinical, desc: 'Next 7 days', icon: HiOutlineBeaker, color: 'bg-[#E0F2FE] text-[#075985]' },
    { label: 'Assignments Due', value: stats.assignmentsDue, desc: 'Due this week', icon: HiOutlineClipboardDocumentList, color: 'bg-[#FFE4E6] text-[#9F1239]' },
  ]

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#164E56]" role="status" aria-label="Loading dashboard"></div>
      </div>
    )
  }

  return (
    <div className="max-w-[1440px] mx-auto">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-800 text-sm" role="alert">
          <HiOutlineExclamationCircle className="w-5 h-5" aria-hidden="true" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
        {/* Main column */}
        <div className="space-y-6">
          {/* Hero banner */}
          <section className="relative overflow-hidden rounded-2xl bg-[#103B46] p-6 sm:p-8 lg:p-10 text-white shadow-lg">
            <div className="relative z-10 max-w-lg">
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#E8B95D] mb-3">Welcome Back</p>
              <h1 className="font-['Playfair_Display'] text-3xl sm:text-4xl lg:text-[42px] font-bold leading-tight mb-3">
                Your journey.<br />Their wellbeing.
              </h1>
              <p className="text-sm sm:text-[15px] text-[#DDF3E8]/90 leading-relaxed mb-6 max-w-md">
                Continue building the clinical knowledge and compassionate care skills that Ghana's communities need. Every lesson brings you closer to your nursing calling.
              </p>
              <button
                onClick={() => navigate('/dashboard/my-courses')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E8B95D] hover:bg-[#D4A84D] text-[#172E35] text-sm font-bold rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#103B46]"
              >
                Explore My Courses
                <HiOutlineArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <div className="hidden lg:block absolute top-0 right-0 h-full w-[45%] p-6">
              <div className="h-full w-full rounded-2xl overflow-hidden">
                <HeroImage />
              </div>
            </div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-[#164E56]/40 blur-2xl" aria-hidden="true" />
          </section>

          {/* Statistics */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl p-4 border border-[#E4EBE8] shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <HiOutlineArrowRight className="w-4 h-4 text-[#718087]" aria-hidden="true" />
                </div>
                <p className="text-2xl font-bold text-[#172E35]">{stat.value}</p>
                <p className="text-xs font-semibold text-[#172E35] mt-0.5">{stat.label}</p>
                <p className="text-[11px] text-[#718087] mt-0.5">{stat.desc}</p>
              </div>
            ))}
          </section>

          {/* My Courses */}
          <section className="bg-white rounded-2xl border border-[#E4EBE8] shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-['Lora'] text-xl font-bold text-[#172E35]">My Courses</h2>
                <p className="text-xs text-[#718087] mt-0.5">Continue where you left off</p>
              </div>
              <button
                onClick={() => navigate('/dashboard/my-courses')}
                className="text-xs font-semibold text-[#164E56] hover:text-[#103B46] flex items-center gap-1 transition-colors"
              >
                View All <HiOutlineArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>

            {courses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-[#718087] mb-3">No enrolled courses yet.</p>
                <button
                  onClick={() => navigate('/create-course')}
                  className="px-4 py-2 bg-[#164E56] hover:bg-[#103B46] text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Generate Your First Course
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {courses.slice(0, 3).map((course) => (
                  <div
                    key={course._id}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-[#E4EBE8] hover:border-[#164E56]/30 hover:shadow-sm transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#103B46] flex items-center justify-center flex-shrink-0">
                      <HiOutlineBookOpen className="w-6 h-6 text-white" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-[#172E35] truncate">{course.title}</h3>
                      <p className="text-xs text-[#718087] truncate">{course.description}</p>
                      <div className="mt-2.5 flex items-center gap-3">
                        <div className="flex-1 h-2 bg-[#F7FAF9] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#42A889]"
                            style={{ width: `${course.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-[#172E35] w-8 text-right">{course.progress || 0}%</span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/course/${course._id}`)}
                      className="w-full sm:w-auto px-4 py-2 bg-[#F7FAF9] hover:bg-[#164E56] hover:text-white text-[#172E35] text-xs font-semibold rounded-lg border border-[#E4EBE8] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#164E56]"
                    >
                      Continue
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* AI Study Assistant */}
          <section className="bg-white rounded-2xl border border-[#E4EBE8] shadow-sm overflow-hidden flex flex-col h-[480px]">
            <div className="p-4 border-b border-[#E4EBE8] flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#103B46] flex items-center justify-center">
                <HiOutlineSparkles className="w-5 h-5 text-[#E8B95D]" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-bold text-[#172E35]">AI Nursing Study Assistant</h2>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#42A889] animate-pulse" aria-hidden="true" />
                  <span className="text-[10px] text-[#718087]">Online now</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F7FAF9]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[90%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#164E56] text-white rounded-br-md'
                        : 'bg-white text-[#172E35] border border-[#E4EBE8] rounded-bl-md shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-white border border-[#E4EBE8] shadow-sm">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#718087] animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#718087] animate-bounce [animation-delay:0.1s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#718087] animate-bounce [animation-delay:0.2s]" />
                    </span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 border-t border-[#E4EBE8] bg-white">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a nursing question..."
                  disabled={chatLoading}
                  className="flex-1 px-3.5 py-2.5 bg-[#F7FAF9] border border-[#E4EBE8] rounded-xl text-xs text-[#172E35] placeholder:text-[#718087] focus:outline-none focus:ring-2 focus:ring-[#164E56] focus:border-transparent disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || chatLoading}
                  className="p-2.5 rounded-xl bg-[#164E56] hover:bg-[#103B46] disabled:bg-[#E4EBE8] disabled:text-[#718087] text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#164E56]"
                  aria-label="Send message"
                >
                  <HiOutlinePaperAirplane className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </form>
          </section>

          {/* Weekly Leaderboard */}
          <section className="bg-white rounded-2xl border border-[#E4EBE8] shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HiOutlineTrophy className="w-5 h-5 text-[#E8B95D]" aria-hidden="true" />
                <h2 className="font-['Lora'] text-base font-bold text-[#172E35]">Top 5 Learners This Week</h2>
              </div>
              <button
                onClick={() => navigate('/dashboard/leaderboard')}
                className="text-[11px] font-semibold text-[#164E56] hover:text-[#103B46] flex items-center gap-1"
              >
                View Leaderboard <HiOutlineArrowRight className="w-3 h-3" aria-hidden="true" />
              </button>
            </div>

            {leaderboard.length === 0 ? (
              <p className="text-xs text-[#718087]">No learners on the leaderboard yet.</p>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry, idx) => (
                  <div key={entry.rank} className="flex items-center gap-3">
                    <span className={`w-5 text-center text-xs font-bold ${idx === 0 ? 'text-[#E8B95D]' : 'text-[#718087]'}`}>
                      {entry.rank}
                    </span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      idx === 0 ? 'bg-[#E8B95D] text-[#172E35]' :
                      idx === 1 ? 'bg-[#718087] text-white' :
                      idx === 2 ? 'bg-[#CD7F32] text-white' : 'bg-[#F7FAF9] text-[#172E35] border border-[#E4EBE8]'
                    }`}>
                      {entry.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#172E35] truncate">{entry.name}</p>
                    </div>
                    <span className="text-xs font-bold text-[#172E35]">{entry.points.toLocaleString()} pts</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default DashboardHome
