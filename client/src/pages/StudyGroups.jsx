import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { getApiUrl } from '../lib/api-config'
import { HiOutlineUsers, HiOutlineChatBubbleLeftRight, HiOutlineCalendarDays, HiOutlinePlus, HiOutlineExclamationCircle } from 'react-icons/hi2'

const StudyGroups = () => {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [joining, setJoining] = useState({})

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true)
        const res = await axios.get(getApiUrl('/api/study-groups'), { withCredentials: true })
        setGroups(res.data.groups || [])
      } catch (err) {
        console.error('Error fetching study groups:', err)
        setError(err.response?.data?.message || 'Failed to load study groups.')
      } finally {
        setLoading(false)
      }
    }
    fetchGroups()
  }, [])

  const handleJoin = async (id) => {
    setJoining(prev => ({ ...prev, [id]: true }))
    try {
      const res = await axios.post(getApiUrl(`/api/study-groups/${id}/join`), {}, { withCredentials: true })
      setGroups(prev => prev.map(g => g._id === id ? res.data.group : g))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join group.')
    } finally {
      setJoining(prev => ({ ...prev, [id]: false }))
    }
  }

  return (
    <div className="max-w-[1100px] mx-auto">
      <div className="mb-6">
        <h2 className="font-['Lora'] text-2xl font-bold text-[#172E35]">Study Groups</h2>
        <p className="text-xs text-[#718087]">Collaborate with peers and prepare together.</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-800 text-sm" role="alert">
          <HiOutlineExclamationCircle className="w-5 h-5" aria-hidden="true" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#164E56]" role="status" aria-label="Loading study groups"></div>
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E4EBE8] p-8 text-center mb-6">
          <p className="text-sm text-[#718087]">No study groups yet. Create the first one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {groups.map((group) => (
            <div key={group._id} className="bg-white rounded-2xl border border-[#E4EBE8] shadow-sm p-5 transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-sm font-bold text-[#172E35]">{group.name}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F7FAF9] text-[#718087] border border-[#E4EBE8]">
                  {group.members?.length || 0} members
                </span>
              </div>

              <p className="text-xs text-[#718087] mb-4">{group.topic || group.description}</p>

              <div className="flex items-center gap-2 text-xs text-[#718087] mb-4">
                <HiOutlineCalendarDays aria-hidden="true" className="w-4 h-4 text-[#164E56]" />
                <span>Next session: {group.nextSession ? new Date(group.nextSession).toLocaleString() : 'TBD'}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleJoin(group._id)}
                  disabled={joining[group._id] || group.members?.includes(group.creator)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors focus:outline-none ${
                    group.isMember
                      ? 'bg-[#DDF3E8] text-[#103B46] cursor-default'
                      : 'bg-[#164E56] hover:bg-[#103B46] text-white'
                  }`}
                >
                  {group.isMember ? 'Joined' : joining[group._id] ? 'Joining...' : 'Join Group'}
                </button>
                <button
                  className="px-3 py-2 border border-[#E4EBE8] text-[#164E56] hover:bg-[#F7FAF9] rounded-xl transition-colors"
                  aria-label={`Open chat for ${group.name}`}
                >
                  <HiOutlineChatBubbleLeftRight aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 bg-[#103B46] rounded-2xl p-5 text-white">
        <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
          <HiOutlinePlus aria-hidden="true" /> Start a new group
        </h3>
        <p className="text-xs text-[#DDF3E8]/80 mb-4">
          Can't find a group for your topic? Create one and invite classmates.
        </p>
        <button className="px-4 py-2 bg-[#E8B95D] hover:bg-[#D4A84D] text-[#172E35] text-xs font-bold rounded-xl transition-colors">
          Create Study Group
        </button>
      </div>
    </div>
  )
}

export default StudyGroups
