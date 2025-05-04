import React, { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import CourseCard from '../components/CourseCard'
import axios from 'axios'

const Explore = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const categories = [
    { id: 'all', name: 'All Courses' },
    { id: 'programming', name: 'Programming' },
    { id: 'design', name: 'Design' },
    { id: 'business', name: 'Business' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'science', name: 'Science & Tech' },
    { id: 'language', name: 'Languages' },
    { id: 'health', name: 'Health & Fitness' },
  ]

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        // In a real app, you would filter by category in the API call
        const response = await axios.get('http://localhost:3000/api/content/courses')
        setCourses(response.data)
      } catch (err) {
        console.error('Error fetching courses:', err)
        setError('Failed to load courses. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  // Filter courses based on active category and search term
  const filteredCourses = courses.filter(course => {
    const matchesCategory = activeCategory === 'all' || course.category === activeCategory
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="mx-4 sm:mx-6 lg:mx-10 my-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 animate-fade-in">
        <h2 className="text-3xl font-bold text-indigo-900 mb-4 sm:mb-0">Explore Courses</h2>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search courses..."
            className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="absolute right-3 top-2.5 h-5 w-5 text-indigo-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex space-x-2 pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${activeCategory === category.id
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
            >
              {category.name}
            </button>
          ))}
        </div>
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
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <div key={course._id} className="transform transition-all duration-300 hover:-translate-y-1 animate-fade-in">
              <CourseCard course={course} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-indigo-100 animate-slide-in">
          <h3 className="text-2xl font-semibold text-indigo-900 mb-3">No Courses Found</h3>
          <p className="text-indigo-700 mb-6 max-w-md mx-auto">
            We couldn't find any courses matching your criteria. Try adjusting your search or category filters.
          </p>
          <Button
            onClick={() => {
              setActiveCategory('all')
              setSearchTerm('')
            }}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-300"
          >
            Reset Filters
          </Button>
        </div>
      )}

      {/* Trending Topics Section */}
      <div className="mt-12">
        <h3 className="text-2xl font-semibold text-indigo-900 mb-6">Trending Topics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: 'AI & Machine Learning', icon: '🤖', color: 'bg-purple-100' },
            { name: 'Web Development', icon: '🌐', color: 'bg-blue-100' },
            { name: 'Data Science', icon: '📊', color: 'bg-green-100' },
            { name: 'UX/UI Design', icon: '🎨', color: 'bg-yellow-100' },
            { name: 'Digital Marketing', icon: '📱', color: 'bg-red-100' },
            { name: 'Blockchain', icon: '🔗', color: 'bg-indigo-100' },
          ].map((topic, index) => (
            <div 
              key={index} 
              className={`${topic.color} p-4 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition-all`}
            >
              <span className="text-3xl mb-2">{topic.icon}</span>
              <span className="text-sm font-medium">{topic.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Explore
