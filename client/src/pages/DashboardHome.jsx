import { useUser } from '@clerk/clerk-react'
import { Button } from '../components/ui/button'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import CourseCard from '../components/CourseCard'

const DashboardHome = () => {
    const navigate = useNavigate()
    const { user } = useUser()
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchUserCourses = async () => {
            if (!user) return
            
            try {
                setLoading(true)
                const response = await axios.get(`http://localhost:3000/api/content/user-courses/${user.id}`)
                setCourses(response.data)
            } catch (err) {
                console.error('Error fetching courses:', err)
                setError('Failed to load your courses. Please try again later.')
            } finally {
                setLoading(false)
            }
        }

        fetchUserCourses()
    }, [user])

    return (
        <div className="mx-10 my-5">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-semibold">Hello, <span>{user?.fullName}</span></h2>
                <Button onClick={() => navigate('/create-course')} className="px-6">
                    Create New Course
                </Button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : courses.length > 0 ? (
                <div>
                    <h3 className="text-xl font-medium mb-4">Your Courses</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map(course => (
                            <CourseCard key={course._id} course={course} />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <h3 className="text-xl font-medium mb-2">You don't have any courses yet</h3>
                    <p className="text-gray-600 mb-6">Create your first AI-generated course to get started</p>
                    <Button onClick={() => navigate('/create-course')}>
                        Create Your First Course
                    </Button>
                </div>
            )}
        </div>
    )
}

export default DashboardHome
