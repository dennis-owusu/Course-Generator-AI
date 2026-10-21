import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaUser } from 'react-icons/fa'

const CourseCard = ({ course }) => {
  const navigate = useNavigate()

  return (
    <div className="bg-white border border-[#E4EBE8] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
      <div className="bg-[#F7FAF9] h-32 sm:h-40 flex items-center justify-center">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-3xl sm:text-4xl font-bold text-[#164E56]/20" aria-hidden="true">{course.title.charAt(0)}</div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-bold text-[#172E35] truncate">{course.title}</h3>
          <span className="bg-[#DDF3E8] text-[#103B46] text-[10px] font-bold px-2 py-0.5 rounded-full">{course.level}</span>
        </div>

        <p className="text-xs text-[#718087] line-clamp-2 mb-3">{course.description}</p>

        <div className="flex justify-between items-center text-[11px] text-[#718087]">
          <span>{course.modules?.length || 0} chapters</span>
          <span>{course.estimatedDuration} hours</span>
        </div>

        {course.createdBy && (
          <div className="mt-2 flex items-center text-[10px] text-[#718087]">
            <div className="bg-[#DDF3E8] p-1 rounded-full mr-2">
              {typeof course.createdBy === 'object' && course.createdBy.profilePicture ? (
                <img
                  src={course.createdBy.profilePicture}
                  alt="Creator"
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full"
                />
              ) : (
                <FaUser className="text-[#103B46] text-xs" aria-hidden="true" />
              )}
            </div>
            <span>
              Created by {typeof course.createdBy === 'object' ? (course.createdBy.username || 'Anonymous') : 'Anonymous'}
            </span>
          </div>
        )}

        <div className="mt-3 flex justify-end">
          <button
            onClick={() => navigate(`/course/${course._id}`)}
            className="px-3 py-1.5 text-[11px] font-bold bg-[#164E56] hover:bg-[#103B46] text-white rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#164E56]"
          >
            View Course
          </button>
        </div>
      </div>
    </div>
  )
}

export default CourseCard
