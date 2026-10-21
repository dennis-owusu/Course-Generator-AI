import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { getApiUrl } from '../lib/api-config'
import { HiOutlineBeaker, HiOutlineCalendarDays, HiOutlineClock, HiOutlineUser, HiOutlineCheckCircle, HiOutlineExclamationCircle } from 'react-icons/hi2'

const SKILLS_CHECKLIST = [
  { id: 1, name: 'Hand hygiene and aseptic technique', completed: true },
  { id: 2, name: 'Vital signs measurement', completed: true },
  { id: 3, name: 'IM and SC injection administration', completed: false },
  { id: 4, name: 'IV cannulation and fluid monitoring', completed: false },
  { id: 5, name: 'Bed bath and patient positioning', completed: true },
  { id: 6, name: 'Catheterization (male and female)', completed: false },
]

const ClinicalPractice = () => {
  const [rotations, setRotations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [skills, setSkills] = useState(SKILLS_CHECKLIST)

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true)
        const from = new Date().toISOString()
        const to = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        const res = await axios.get(getApiUrl('/api/schedules'), {
          params: { type: 'clinical', from, to },
          withCredentials: true,
        })
        setRotations(res.data.schedules || [])
      } catch (err) {
        console.error('Error fetching schedules:', err)
        setError(err.response?.data?.message || 'Failed to load clinical schedules.')
      } finally {
        setLoading(false)
      }
    }
    fetchSchedules()
  }, [])

  const toggleSkill = (id) => {
    setSkills(prev => prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s))
  }

  const completedCount = skills.filter(s => s.completed).length

  return (
    <div className="max-w-[1100px] mx-auto">
      <div className="mb-6">
        <h2 className="font-['Lora'] text-2xl font-bold text-[#172E35]">Clinical Practice</h2>
        <p className="text-xs text-[#718087]">Track your rotations, supervisors, and practical skills checklist.</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-800 text-sm" role="alert">
          <HiOutlineExclamationCircle className="w-5 h-5" aria-hidden="true" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-[#172E35] flex items-center gap-2">
            <HiOutlineCalendarDays className="w-4 h-4 text-[#164E56]" aria-hidden="true" />
            Upcoming Rotations
          </h3>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#164E56]" role="status" aria-label="Loading rotations"></div>
            </div>
          ) : rotations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E4EBE8] p-8 text-center">
              <p className="text-sm text-[#718087]">No upcoming clinical rotations scheduled.</p>
            </div>
          ) : (
            rotations.map((rotation) => (
              <div key={rotation._id} className="bg-white rounded-2xl border border-[#E4EBE8] shadow-sm p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-[#DDF3E8] flex items-center justify-center">
                      <HiOutlineBeaker className="w-5 h-5 text-[#103B46]" aria-hidden="true" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#172E35]">{rotation.title}</h4>
                      <p className="text-[11px] text-[#718087]">{rotation.location}</p>
                    </div>
                  </div>
                  <span className="self-start px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#DDF3E8] text-[#103B46]">
                    {rotation.type}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-xs text-[#718087]">
                  <div className="flex items-center gap-1.5">
                    <HiOutlineCalendarDays className="w-4 h-4 text-[#164E56]" aria-hidden="true" />
                    {new Date(rotation.startTime).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HiOutlineClock className="w-4 h-4 text-[#164E56]" aria-hidden="true" />
                    {new Date(rotation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(rotation.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HiOutlineUser className="w-4 h-4 text-[#164E56]" aria-hidden="true" />
                    {rotation.supervisor?.name || 'TBD'}
                  </div>
                </div>

                <p className="text-xs text-[#718087]">{rotation.description}</p>
              </div>
            ))
          )}
        </div>

        <div className="bg-white rounded-2xl border border-[#E4EBE8] shadow-sm p-5 h-fit">
          <h3 className="text-sm font-bold text-[#172E35] mb-1">Practical Skills Checklist</h3>
          <p className="text-[11px] text-[#718087] mb-4">{completedCount} of {skills.length} skills signed off</p>

          <div className="w-full h-2 bg-[#F7FAF9] rounded-full overflow-hidden mb-5">
            <div
              className="h-full bg-[#42A889] rounded-full transition-all"
              style={{ width: `${(completedCount / skills.length) * 100}%` }}
            />
          </div>

          <div className="space-y-2.5">
            {skills.map((skill) => (
              <button
                key={skill.id}
                onClick={() => toggleSkill(skill.id)}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#F7FAF9] transition-colors text-left"
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${skill.completed ? 'bg-[#42A889] border-[#42A889]' : 'border-[#E4EBE8]'}`}>
                  {skill.completed && <HiOutlineCheckCircle className="w-3.5 h-3.5 text-white" aria-hidden="true" />}
                </div>
                <span className={`text-xs ${skill.completed ? 'text-[#718087] line-through' : 'text-[#172E35]'}`}>
                  {skill.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClinicalPractice
