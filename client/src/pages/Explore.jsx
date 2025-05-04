import React, { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import CourseCard from '../components/CourseCard'
import axios from 'axios'
import { useSelector } from 'react-redux'

const Explore = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    level: '',
    learningGoal: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 12
  })
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0
  })
  const { currentUser } = useSelector(state => state.user)

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
        
        // Build query parameters
        const params = new URLSearchParams()
        
        // Add filters
        if (activeCategory !== 'all') params.append('category', activeCategory)
        if (filters.level) params.append('level', filters.level)
        if (filters.learningGoal) params.append('learningGoal', filters.learningGoal)
        if (searchTerm) params.append('search', searchTerm)
        
        // Add pagination and sorting
        params.append('page', filters.page)
        params.append('limit', filters.limit)
        params.append('sortBy', filters.sortBy)
        params.append('sortOrder', filters.sortOrder)
        
        // Exclude current user's courses if logged in
        if (currentUser?._id) params.append('excludeUserId', currentUser._id)
        
        const response = await axios.get(`http://localhost:3000/api/content/community-courses?${params}`)
        setCourses(response.data.courses)
        setPagination(response.data.pagination)
      } catch (err) {
        console.error('Error fetching courses:', err)
        setError('Failed to load courses. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [activeCategory, searchTerm, filters, currentUser])

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value,
      // Reset to page 1 when changing filters
      page: filterName !== 'page' ? 1 : value
    }))
  }
  
  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return
    handleFilterChange('page', newPage)
  }

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
      
      {/* Advanced Filters */}
      <div className="mb-8 bg-white p-4 rounded-xl shadow-sm border border-indigo-100">
        <div className="flex flex-wrap gap-4">
          {/* Level Filter */}
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-indigo-700 mb-1">Difficulty Level</label>
            <select
              value={filters.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
              className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          
          {/* Learning Goal Filter */}
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-indigo-700 mb-1">Learning Goal</label>
            <select
              value={filters.learningGoal}
              onChange={(e) => handleFilterChange('learningGoal', e.target.value)}
              className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Goals</option>
              <option value="Career">Career</option>
              <option value="Academic">Academic</option>
              <option value="Personal">Personal</option>
            </select>
          </div>
          
          {/* Sort By Filter */}
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-indigo-700 mb-1">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="createdAt">Date Created</option>
              <option value="title">Title</option>
              <option value="estimatedDuration">Duration</option>
            </select>
          </div>
          
          {/* Sort Order */}
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-indigo-700 mb-1">Order</label>
            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
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
      ) : courses.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <div key={course._id} className="transform transition-all duration-300 hover:-translate-y-1 animate-fade-in">
                <CourseCard course={course} />
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`px-4 py-2 rounded-lg ${pagination.page === 1 ? 'bg-indigo-100 text-indigo-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                >
                  Previous
                </button>
                
                <div className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className={`px-4 py-2 rounded-lg ${pagination.page === pagination.totalPages ? 'bg-indigo-100 text-indigo-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
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
