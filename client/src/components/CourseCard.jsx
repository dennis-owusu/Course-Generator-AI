import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { FaUser } from 'react-icons/fa'

const CourseCard = ({ course }) => {
  const navigate = useNavigate()

  return (
    <div className="bg-white border border-indigo-100 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in">
      <div className="bg-indigo-50 h-32 sm:h-40 flex items-center justify-center">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-3xl sm:text-4xl font-bold text-indigo-300">{course.title.charAt(0)}</div>
        )}
      </div>
      
      <div className="p-3 sm:p-5">
        <div className="flex justify-between items-start mb-2 sm:mb-3">
          <h3 className="text-base sm:text-lg font-semibold text-indigo-900 truncate">{course.title}</h3>
          <span className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">{course.level}</span>
        </div>
        
        <p className="text-xs sm:text-sm text-gray-700 line-clamp-2 mb-3 sm:mb-4">{course.description}</p>
        
        <div className="flex justify-between items-center text-xs text-indigo-700">
          <span>{course.modules?.length || 0} chapters</span>
          <span>{course.estimatedDuration} hours</span>
        </div>
        
        {/* Creator information - shown for community courses */}
        {course.createdBy && (
          <div className="mt-2 sm:mt-3 flex items-center text-xs text-gray-600">
            <div className="bg-indigo-100 p-1 rounded-full mr-2">
              {typeof course.createdBy === 'object' && course.createdBy.profilePicture ? (
                <img 
                  src={course.createdBy.profilePicture} 
                  alt="Creator" 
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full"
                />
              ) : (
                <FaUser className="text-indigo-600 text-xs sm:text-sm" />
              )}
            </div>
            <span className="text-xs">
              Created by {typeof course.createdBy === 'object' ? 
                (course.createdBy.username || 'Anonymous') : 
                'Anonymous'}
            </span>
          </div>
        )}
        
        <div className="mt-3 sm:mt-4 flex justify-end">
          <Button
            onClick={() => navigate(`/course/${course._id}`)}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-300"
          >
            View Course
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CourseCard