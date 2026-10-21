import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { getApiUrl } from '../../lib/api-config'
import {
  HiOutlineMagnifyingGlass,
  HiOutlineBell,
  HiOutlineChevronDown,
  HiOutlineUser,
  HiOutlineCog6Tooth,
  HiOutlineArrowLeftOnRectangle,
} from 'react-icons/hi2'

const Header = () => {
  const navigate = useNavigate()
  const { currentUser } = useSelector(state => state.user)
  const [profile, setProfile] = useState(null)
  const [search, setSearch] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const profileRef = useRef(null)

  useEffect(() => {
    if (currentUser?._id) {
      axios.get(getApiUrl(`/api/gamification/profile/${currentUser._id}`), { withCredentials: true })
        .then(res => {
          if (res.data?.success) setProfile(res.data)
        })
        .catch(err => console.error('Failed to fetch gamification profile:', err))
    }
  }, [currentUser?._id])

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(getApiUrl('/api/notifications'), { withCredentials: true })
        if (res.data?.success) {
          setNotifications(res.data.notifications || [])
          setUnreadCount(res.data.unreadCount || 0)
        }
      } catch (err) {
        console.error('Failed to fetch notifications:', err)
      }
    }
    fetchNotifications()
  }, [notifOpen])

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const initials = (currentUser?.name || currentUser?.username || 'S')
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/dashboard/my-courses?search=${encodeURIComponent(search.trim())}`)
      setSearch('')
    }
  }

  const markAllRead = async () => {
    try {
      await axios.patch(getApiUrl('/api/notifications/read-all'), {}, { withCredentials: true })
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark notifications read:', err)
    }
  }

  return (
    <header className="sticky top-0 z-20 h-[72px] bg-[#F7FAF9] border-b border-[#E4EBE8]">
      <div className="h-full flex items-center justify-between px-6 lg:px-8 gap-4">
        <form onSubmit={handleSearch} className="hidden sm:flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#718087]" aria-hidden="true" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses, topics, or assignments..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E4EBE8] rounded-xl text-sm text-[#172E35] placeholder:text-[#718087] focus:outline-none focus:ring-2 focus:ring-[#164E56] focus:border-transparent"
            />
          </div>
        </form>

        <div className="flex items-center gap-3 sm:gap-5 ml-auto">
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-full bg-white border border-[#E4EBE8] text-[#718087] hover:text-[#172E35] hover:border-[#164E56] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#164E56]"
              aria-label="Notifications"
              aria-expanded={notifOpen}
            >
              <HiOutlineBell className="w-5 h-5" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E8B95D] rounded-full border border-white"></span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-[#E4EBE8] p-3 z-50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-[#172E35]">Notifications</p>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-[10px] text-[#164E56] hover:underline">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-[#718087] py-2">No notifications yet.</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        className={`p-2 rounded-lg cursor-pointer ${n.isRead ? 'bg-white' : 'bg-[#F7FAF9]'}`}
                        onClick={() => n.link && navigate(n.link)}
                      >
                        <p className="text-xs font-medium text-[#172E35]">{n.title}</p>
                        <p className="text-[10px] text-[#718087] line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full bg-white border border-[#E4EBE8] hover:border-[#164E56] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#164E56]"
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
            >
              <div className="w-8 h-8 rounded-full bg-[#164E56] text-white flex items-center justify-center text-xs font-bold">
                {initials}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-[#172E35] leading-tight">{currentUser?.name || currentUser?.username || 'Student'}</p>
                <p className="text-[10px] text-[#718087] leading-tight">{profile?.plan === 'pro' ? 'PRO Student' : 'Basic Student'}</p>
              </div>
              <HiOutlineChevronDown className="w-4 h-4 text-[#718087]" aria-hidden="true" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#E4EBE8] py-2 z-50">
                <div className="px-4 py-2 border-b border-[#E4EBE8]">
                  <p className="text-sm font-semibold text-[#172E35]">{currentUser?.name || currentUser?.username}</p>
                  <p className="text-xs text-[#718087]">{currentUser?.email}</p>
                </div>
                <button
                  onClick={() => { setProfileOpen(false); navigate('/dashboard/settings') }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#172E35] hover:bg-[#F7FAF9] text-left"
                >
                  <HiOutlineUser className="w-4 h-4" aria-hidden="true" /> Profile
                </button>
                <button
                  onClick={() => { setProfileOpen(false); navigate('/dashboard/settings') }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#172E35] hover:bg-[#F7FAF9] text-left"
                >
                  <HiOutlineCog6Tooth className="w-4 h-4" aria-hidden="true" /> Settings
                </button>
                <button
                  onClick={() => { setProfileOpen(false); navigate('/') }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                >
                  <HiOutlineArrowLeftOnRectangle className="w-4 h-4" aria-hidden="true" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
