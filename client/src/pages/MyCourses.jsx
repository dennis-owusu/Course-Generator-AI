import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { getApiUrl } from '../lib/api-config'
import CourseCard from '../components/CourseCard'
import { HiOutlineBookOpen, HiOutlineArrowRight } from 'react-icons/hi2'

const MyCourses = () => {
  const navigate = useNavigate()
  const { currentUser } = useSelector(state => state.user)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        const response = await axios.get(getApiUrl(`/api/dashboard/my-courses/${currentUser._id}`), { withCredentials: true })
        setCourses(response.data.courses || [])
      } catch (err) {
        console.error('Error fetching courses:', err)
        setError('Failed to load your courses. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    if (currentUser?._id) fetchCourses()
  }, [currentUser?._id])

  return (
    <div className="max-w-[1100px] mx-auto">
      <div className="mb-6">
        <h2 className="font-['Lora'] text-2xl font-bold text-[#172E35]">My Courses</h2>
        <p className="text-xs text-[#718087]">Continue your nursing education journey</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl mb-4" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-40 sm:h-64">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-[#164E56]" role="status" aria-label="Loading courses"></div>
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map(course => (
            <div key={course._id} className="transform transition-all duration-300 hover:-translate-y-1">
              <CourseCard course={course} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-4 bg-white rounded-2xl border border-[#E4EBE8] shadow-sm">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#DDF3E8] flex items-center justify-center">
            <HiOutlineBookOpen className="w-7 h-7 text-[#103B46]" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-bold text-[#172E35] mb-2">No Courses Yet</h3>
          <p className="text-xs text-[#718087] mb-5 max-w-md mx-auto">
            Generate your first AI-powered nursing course to get started.
          </p>
          <button
            onClick={() => navigate('/dashboard/ai-study-assistant')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#164E56] hover:bg-[#103B46] text-white text-sm font-bold rounded-xl transition-colors"
          >
            Create Your First Course
            <HiOutlineArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}

export default MyCourses
