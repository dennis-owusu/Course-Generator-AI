import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from './ui/button'

const CourseCard = ({ course }) => {
  const navigate = useNavigate()

  return (
    <div className="bg-white border border-indigo-100 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in">
      <div className="bg-indigo-50 h-40 flex items-center justify-center">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-4xl font-bold text-indigo-300">{course.title.charAt(0)}</div>
        )}
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-indigo-900 truncate">{course.title}</h3>
          <span className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full">{course.level}</span>
        </div>
        
        <p className="text-sm text-gray-700 line-clamp-2 mb-4">{course.description}</p>
        
        <div className="flex justify-between items-center text-xs text-indigo-700">
          <span>{course.modules?.length || 0} chapters</span>
          <span>{course.estimatedDuration} hours</span>
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button
            onClick={() => navigate(`/course/${course._id}`)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-300"
          >
            View Course
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CourseCard