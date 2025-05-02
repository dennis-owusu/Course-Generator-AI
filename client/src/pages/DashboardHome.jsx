import { Button } from '../components/ui/button'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import CourseCard from '../components/CourseCard'
import { useSelector } from 'react-redux'

const DashboardHome = () => {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { currentUser } = useSelector(state => state.user)

  useEffect(() => {
    const fetchUserCourses = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`http://localhost:3000/api/content/user-courses/${currentUser._id}`)
        setCourses(response.data)
      } catch (err) {
        console.error('Error fetching courses:', err)
        setError('Failed to load your courses. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchUserCourses()
  }, [currentUser._id])

  return (
    <div className="mx-4 sm:mx-6 lg:mx-10 my-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 animate-fade-in">
        <h2 className="text-3xl font-bold text-indigo-900 mb-4 sm:mb-0">
          Hello, <span className="text-indigo-600">{currentUser?.name || 'there'}</span>
        </h2>
        <Button
          onClick={() => navigate('/create-course')}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-300"
        >
          Create New Course
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 px-4 py-3 rounded-lg mb-6 animate-slide-in" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : courses.length > 0 ? (
        <div>
          <h3 className="text-2xl font-semibold text-indigo-900 mb-6">Your Courses</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <div key={course._id} className="transform transition-all duration-300 hover:-translate-y-1 animate-fade-in">
                <CourseCard course={course} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-indigo-100 animate-slide-in">
          <h3 className="text-2xl font-semibold text-indigo-900 mb-3">No Courses Yet</h3>
          <p className="text-indigo-700 mb-6 max-w-md mx-auto">
            Create your first AI-generated course to get started with your learning journey.
          </p>
          <Button
            onClick={() => navigate('/create-course')}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-300"
          >
            Create Your First Course
          </Button>
        </div>
      )}
    </div>
  )
}

export default DashboardHome