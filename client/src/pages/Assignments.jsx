import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { getApiUrl } from '../lib/api-config'
import { HiOutlineClipboardDocumentList, HiOutlineClock, HiOutlineCheckCircle, HiOutlineExclamationCircle } from 'react-icons/hi2'

const Assignments = () => {
  const { currentUser } = useSelector(state => state.user)
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('All')
  const [submitting, setSubmitting] = useState({})

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true)
        const res = await axios.get(getApiUrl('/api/assignments'), {
          params: { studentId: currentUser._id },
          withCredentials: true,
        })
        setAssignments(res.data.assignments || [])
      } catch (err) {
        console.error('Error fetching assignments:', err)
        setError(err.response?.data?.message || 'Failed to load assignments.')
      } finally {
        setLoading(false)
      }
    }
    if (currentUser?._id) fetchAssignments()
  }, [currentUser?._id])

  const handleSubmit = async (id) => {
    setSubmitting(prev => ({ ...prev, [id]: true }))
    try {
      await axios.post(getApiUrl(`/api/assignments/${id}/submit`), { content: 'Submitted by student' }, { withCredentials: true })
      setAssignments(prev => prev.map(a => a._id === id || a.id === id ? { ...a, status: 'Submitted' } : a))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit assignment.')
    } finally {
      setSubmitting(prev => ({ ...prev, [id]: false }))
    }
  }

  const filtered = filter === 'All' ? assignments : assignments.filter(a => a.status === filter)

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending': return 'bg-[#FEF3C7] text-[#92400E]'
      case 'Submitted': return 'bg-[#DDF3E8] text-[#103B46]'
      case 'Graded': return 'bg-[#E0F2FE] text-[#075985]'
      default: return 'bg-[#F7FAF9] text-[#172E35]'
    }
  }

  return (
    <div className="max-w-[1100px] mx-auto">
      <div className="mb-6">
        <h2 className="font-['Lora'] text-2xl font-bold text-[#172E35]">Assignments</h2>
        <p className="text-xs text-[#718087]">Track, submit, and review your nursing coursework.</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-800 text-sm" role="alert">
          <HiOutlineExclamationCircle className="w-5 h-5" aria-hidden="true" />
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-5">
        {['All', 'Pending', 'Submitted', 'Graded'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors focus:outline-none ${
              filter === f
                ? 'bg-[#164E56] text-white'
                : 'bg-white border border-[#E4EBE8] text-[#718087] hover:text-[#172E35]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#164E56]" role="status" aria-label="Loading assignments"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E4EBE8] p-8 text-center">
          <p className="text-sm text-[#718087]">No assignments found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E4EBE8] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-[#F7FAF9] border-b border-[#E4EBE8]">
                <tr>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-[#718087]">Assignment</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-[#718087]">Course</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-[#718087]">Due</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-[#718087]">Status</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-[#718087]">Points</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-[#718087]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4EBE8]">
                {filtered.map((a) => (
                  <tr key={a._id || a.id} className="hover:bg-[#F7FAF9] transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-[#172E35]">{a.title}</p>
                      <p className="text-[10px] text-[#718087]">{a.type}</p>
                    </td>
                    <td className="px-5 py-4 text-xs text-[#718087]">{a.course?.title || a.course}</td>
                    <td className="px-5 py-4 text-xs text-[#718087] flex items-center gap-1">
                      <HiOutlineClock className="w-3.5 h-3.5 text-[#164E56]" aria-hidden="true" />
                      {new Date(a.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${getStatusStyle(a.status)}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-bold text-[#172E35]">{a.totalPoints}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleSubmit(a._id || a.id)}
                        disabled={a.status !== 'Pending' || submitting[a._id || a.id]}
                        className={`text-[11px] px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                          a.status === 'Pending'
                            ? 'bg-[#164E56] hover:bg-[#103B46] text-white'
                            : 'bg-[#F7FAF9] text-[#718087] cursor-default'
                        }`}
                      >
                        {a.status === 'Pending' ? (submitting[a._id || a.id] ? 'Submitting...' : 'Submit') : <span className="flex items-center gap-1"><HiOutlineCheckCircle className="w-3.5 h-3.5" aria-hidden="true" /> View</span>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Assignments
