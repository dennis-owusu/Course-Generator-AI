import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { getApiUrl } from '../lib/api-config'
import {
  HiOutlineVideoCamera,
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlinePlus,
  HiOutlinePlay,
  HiOutlineCloudArrowUp,
  HiOutlineExclamationCircle,
  HiOutlineXMark,
} from 'react-icons/hi2'

const LiveClasses = () => {
  const { currentUser } = useSelector(state => state.user)
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [activeClass, setActiveClass] = useState(null)
  const [uploading, setUploading] = useState({})
  const fileInputRef = useRef(null)

  const isTeacher = currentUser?.role === 'teacher'
  const isVerifiedTeacher = isTeacher && currentUser?.teacherStatus === 'verified'
  const isAdmin = currentUser?.role === 'admin'
  const canCreate = isVerifiedTeacher || isAdmin

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true)
        const res = await axios.get(getApiUrl('/api/live-classes'), { withCredentials: true })
        setClasses(res.data.liveClasses || [])
      } catch (err) {
        console.error('Error fetching live classes:', err)
        setError(err.response?.data?.message || 'Failed to load live classes.')
      } finally {
        setLoading(false)
      }
    }
    fetchClasses()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    const form = e.target
    const payload = {
      title: form.title.value,
      description: form.description.value,
      course: form.course.value,
      startTime: new Date(form.startTime.value).toISOString(),
      endTime: new Date(form.endTime.value).toISOString(),
    }

    try {
      const res = await axios.post(getApiUrl('/api/live-classes'), payload, { withCredentials: true })
      setClasses(prev => [...prev, res.data.liveClass])
      setShowCreate(false)
      form.reset()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create live class.')
    }
  }

  const handleJoin = async (cls) => {
    try {
      const res = await axios.get(getApiUrl(`/api/live-classes/${cls._id}`), { withCredentials: true })
      setActiveClass(res.data.liveClass)
      await axios.post(getApiUrl(`/api/live-classes/${cls._id}/attendance`), {}, { withCredentials: true })
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join live class.')
    }
  }

  const handleUpload = async (clsId, file) => {
    if (!file) return
    const formData = new FormData()
    formData.append('recording', file)
    setUploading(prev => ({ ...prev, [clsId]: true }))
    try {
      const res = await axios.post(getApiUrl(`/api/live-classes/${clsId}/recording`), formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setClasses(prev => prev.map(c => c._id === clsId ? res.data.liveClass : c))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload recording.')
    } finally {
      setUploading(prev => ({ ...prev, [clsId]: false }))
    }
  }

  return (
    <div className="max-w-[1100px] mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-['Lora'] text-2xl font-bold text-[#172E35]">Live Classes</h2>
          <p className="text-xs text-[#718087]">Join live sessions or watch recorded classes.</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2 bg-[#164E56] hover:bg-[#103B46] text-white text-xs font-bold rounded-xl transition-colors"
          >
            <HiOutlinePlus className="w-4 h-4" aria-hidden="true" />
            {showCreate ? 'Cancel' : 'Schedule Class'}
          </button>
        )}
      </div>

      {isTeacher && !isVerifiedTeacher && (
        <div className="mb-4 p-4 bg-[#FEF3C7] border border-[#FDE68A] rounded-xl flex items-center gap-2 text-[#92400E] text-sm" role="alert">
          <HiOutlineExclamationCircle className="w-5 h-5" aria-hidden="true" />
          Your teacher account is pending verification. You can schedule classes once verified.
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-800 text-sm" role="alert">
          <HiOutlineExclamationCircle className="w-5 h-5" aria-hidden="true" />
          {error}
        </div>
      )}

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-[#E4EBE8] shadow-sm p-5 mb-6">
          <h3 className="text-sm font-bold text-[#172E35] mb-4">Schedule a Live Class</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-[#172E35] mb-1">Title</label>
              <input name="title" required className="w-full px-3 py-2 bg-[#F7FAF9] border border-[#E4EBE8] rounded-xl text-sm text-[#172E35] focus:outline-none focus:ring-2 focus:ring-[#164E56]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#172E35] mb-1">Course ID</label>
              <input name="course" required placeholder="Course MongoDB ID" className="w-full px-3 py-2 bg-[#F7FAF9] border border-[#E4EBE8] rounded-xl text-sm text-[#172E35] focus:outline-none focus:ring-2 focus:ring-[#164E56]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#172E35] mb-1">Start Time</label>
              <input name="startTime" type="datetime-local" required className="w-full px-3 py-2 bg-[#F7FAF9] border border-[#E4EBE8] rounded-xl text-sm text-[#172E35] focus:outline-none focus:ring-2 focus:ring-[#164E56]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#172E35] mb-1">End Time</label>
              <input name="endTime" type="datetime-local" required className="w-full px-3 py-2 bg-[#F7FAF9] border border-[#E4EBE8] rounded-xl text-sm text-[#172E35] focus:outline-none focus:ring-2 focus:ring-[#164E56]" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-[#172E35] mb-1">Description</label>
            <textarea name="description" rows={3} className="w-full px-3 py-2 bg-[#F7FAF9] border border-[#E4EBE8] rounded-xl text-sm text-[#172E35] focus:outline-none focus:ring-2 focus:ring-[#164E56]" />
          </div>
          <button type="submit" className="px-5 py-2.5 bg-[#164E56] hover:bg-[#103B46] text-white text-sm font-bold rounded-xl transition-colors">
            Create Live Class
          </button>
        </form>
      )}

      {activeClass && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#E4EBE8]">
              <div>
                <h3 className="text-sm font-bold text-[#172E35]">{activeClass.title}</h3>
                <p className="text-xs text-[#718087]">{activeClass.description}</p>
              </div>
              <button
                onClick={() => setActiveClass(null)}
                className="p-2 rounded-lg hover:bg-[#F7FAF9] text-[#718087]"
                aria-label="Close meeting"
              >
                <HiOutlineXMark className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 bg-black">
              <iframe
                src={activeClass.meetingUrl}
                allow="camera; microphone; fullscreen; display-capture"
                className="w-full h-full border-0"
                title={`Live class: ${activeClass.title}`}
              />
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#164E56]" role="status" aria-label="Loading live classes"></div>
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E4EBE8] p-8 text-center">
          <p className="text-sm text-[#718087]">No live classes scheduled yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {classes.map((cls) => (
            <div key={cls._id} className="bg-white rounded-2xl border border-[#E4EBE8] shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#DDF3E8] flex items-center justify-center">
                    <HiOutlineVideoCamera className="w-5 h-5 text-[#103B46]" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#172E35]">{cls.title}</h3>
                    <p className="text-[11px] text-[#718087]">{cls.course?.title}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#DDF3E8] text-[#103B46]">
                  {new Date(cls.startTime) > new Date() ? 'Upcoming' : 'Live / Past'}
                </span>
              </div>

              <p className="text-xs text-[#718087] mb-4">{cls.description}</p>

              <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-[#718087]">
                <div className="flex items-center gap-1.5">
                  <HiOutlineCalendarDays className="w-4 h-4 text-[#164E56]" aria-hidden="true" />
                  {new Date(cls.startTime).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1.5">
                  <HiOutlineClock className="w-4 h-4 text-[#164E56]" aria-hidden="true" />
                  {new Date(cls.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(cls.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex items-center gap-1.5">
                  <HiOutlineUser className="w-4 h-4 text-[#164E56]" aria-hidden="true" />
                  {cls.teacher?.name || cls.teacher?.username}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleJoin(cls)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#164E56] hover:bg-[#103B46] text-white text-xs font-bold rounded-xl transition-colors"
                >
                  <HiOutlinePlay className="w-4 h-4" aria-hidden="true" />
                  Join Class
                </button>

                {(isVerifiedTeacher || isAdmin) && (
                  <>
                    <input
                      type="file"
                      accept="video/*,audio/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={(e) => handleUpload(cls._id, e.target.files[0])}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading[cls._id]}
                      className="flex items-center gap-1.5 px-3 py-2 border border-[#E4EBE8] hover:bg-[#F7FAF9] text-[#172E35] text-xs font-bold rounded-xl transition-colors disabled:opacity-60"
                    >
                      <HiOutlineCloudArrowUp className="w-4 h-4" aria-hidden="true" />
                      {uploading[cls._id] ? 'Uploading...' : 'Upload Recording'}
                    </button>
                  </>
                )}
              </div>

              {cls.recordingStatus === 'available' && cls.recordingUrl && (
                <div className="mt-3 p-3 bg-[#F7FAF9] rounded-xl">
                  <p className="text-xs font-semibold text-[#172E35] mb-1">Recording available</p>
                  <a
                    href={getApiUrl(cls.recordingUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#164E56] hover:underline flex items-center gap-1"
                  >
                    <HiOutlinePlay className="w-3.5 h-3.5" aria-hidden="true" />
                    Watch recording
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LiveClasses
