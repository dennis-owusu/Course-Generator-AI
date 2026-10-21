import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { getApiUrl } from '../lib/api-config'
import { HiOutlineTrophy, HiOutlineStar } from 'react-icons/hi2'

const getBadgeName = (badge) => {
  if (typeof badge === 'string') return badge
  return badge?.name || badge?.title || 'Badge'
}

const rankStyle = (rank) => {
  if (rank === 1) return 'bg-[#E8B95D] text-[#172E35]'
  if (rank === 2) return 'bg-[#718087] text-white'
  if (rank === 3) return 'bg-[#CD7F32] text-white'
  return 'bg-[#F7FAF9] text-[#172E35] border border-[#E4EBE8]'
}

const Leaderboard = () => {
  const { currentUser } = useSelector(state => state.user)
  const [leaderboard, setLeaderboard] = useState([])
  const [myProfile, setMyProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [lbRes, profileRes] = await Promise.all([
          axios.get(getApiUrl('/api/gamification/leaderboard')),
          currentUser?._id
            ? axios.get(getApiUrl(`/api/gamification/profile/${currentUser._id}`))
            : Promise.resolve(null)
        ])
        if (lbRes.data?.success) setLeaderboard(lbRes.data.leaderboard)
        if (profileRes?.data?.success) setMyProfile(profileRes.data)
      } catch (err) {
        console.error('Error loading leaderboard:', err)
        setError('Failed to load leaderboard. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [currentUser?._id])

  return (
    <div className="max-w-[1100px] mx-auto">
      <div className="mb-6">
        <h2 className="font-['Lora'] text-2xl font-bold text-[#172E35]">Leaderboard</h2>
        <p className="text-xs text-[#718087]">Top learners ranked by points earned</p>
      </div>

      {myProfile && (
        <div className="bg-[#103B46] text-white rounded-2xl p-5 mb-6 flex flex-wrap items-center justify-between gap-4 shadow-md">
          <div>
            <p className="text-[#DDF3E8]/80 text-xs font-medium">Your rank</p>
            <p className="text-3xl font-bold">#{myProfile.rank}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <HiOutlineStar className="text-[#E8B95D] text-xl" aria-hidden="true" />
            <span className="text-2xl font-bold">{myProfile.points.toLocaleString()}</span>
            <span className="text-[#DDF3E8]/80 text-xs ml-1">pts</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(myProfile.badges || []).slice(0, 4).map((badge, i) => (
              <span key={i} className="bg-[#164E56] text-[#DDF3E8] text-[10px] font-medium px-2.5 py-1 rounded-full border border-white/10">
                {getBadgeName(badge)}
              </span>
            ))}
            {(myProfile.badges || []).length > 4 && (
              <span className="text-[#DDF3E8]/70 text-[10px]">+{myProfile.badges.length - 4} more</span>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#164E56]" role="status" aria-label="Loading leaderboard"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl">{error}</div>
      ) : leaderboard.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E4EBE8] p-10 text-center text-[#718087]">
          No learners on the leaderboard yet. Start completing lessons to earn points!
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E4EBE8] shadow-sm overflow-hidden">
          {leaderboard.map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center gap-4 px-5 py-4 border-b border-[#E4EBE8] last:border-0 transition-colors ${
                currentUser && entry.name === (myProfile?.name || currentUser?.username)
                  ? 'bg-[#DDF3E8]/50'
                  : 'hover:bg-[#F7FAF9]'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${rankStyle(entry.rank)}`}>
                {entry.rank}
              </div>

              {entry.profilePicture ? (
                <img src={entry.profilePicture} alt={entry.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#DDF3E8] flex items-center justify-center text-[#103B46] font-bold text-xs flex-shrink-0">
                  {entry.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#172E35] truncate">{entry.name}</p>
                <p className="text-[10px] text-[#718087]">{entry.badgeCount} badge{entry.badgeCount !== 1 ? 's' : ''}</p>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <HiOutlineStar className="text-[#E8B95D]" aria-hidden="true" />
                <span className="font-bold text-[#172E35]">{entry.points.toLocaleString()}</span>
                <span className="text-[10px] text-[#718087]">pts</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Leaderboard
