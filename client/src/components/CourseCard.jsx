import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from './ui/button'

const CourseCard = ({ course }) => {
  const navigate = useNavigate()

  return (
    <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="bg-gray-100 h-40 flex items-center justify-center">
        {course.thumbnail ? (
          <img 
            src={course.thumbnail} 
            alt={course.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-4xl font-bold text-gray-300">{course.title.charAt(0)}</div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold truncate">{course.title}</h3>
          <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">{course.level}</span>
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{course.description}</p>
        
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{course.modules?.length || 0} chapters</span>
          <span>{course.estimatedDuration} hours</span>
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button 
            onClick={() => navigate(`/course/${course._id}`)}
            size="sm"
          >
            View Course
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CourseCard