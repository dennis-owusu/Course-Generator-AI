"use client"

import SelectedCategory from '@/components/stepper/SelectedCategory'
import SelectOption from '@/components/stepper/SelectOption'
import TopicDescription from '@/components/stepper/TopicDescription'
import { Button } from '@/components/ui/button'
import React, { useState, useEffect } from 'react'
import { HiClipboardDocumentCheck, HiLightBulb, HiMiniSquares2X2 } from 'react-icons/hi2'
import { useNavigate, useParams } from 'react-router-dom'
// import { useUser } from '@clerk/clerk-react' // Removed Clerk user hook
import axios from 'axios'
import { getApiUrl } from '../lib/api-config'
import Header from '@/components/ui/Header'
import Loader from '@/components/Loader'

// TODO: Rename component and update logic for editing
const EditCourse = () => { // Renamed component
    const navigate = useNavigate()
    const { courseId } = useParams() // Get courseId for editing
    // const { user } = useUser() // Removed Clerk user hook
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [formData, setFormData] = useState({
        category: '',
        topic: '',
        description: '',
        estimatedDuration: '',
        level: '',
        learningGoal: '',
        userId: '',
        chapterCount: '5' // Default to 5 chapters
    })

    useEffect(() => {
        // Fetch existing course data when editing
        const fetchCourseData = async () => {
            if (!courseId) return;
            setLoading(true);
            try {
                const response = await axios.get(getApiUrl(`/api/content/course/${courseId}`));
                const courseData = response.data;
                setFormData({
                    category: courseData.category || '',
                    topic: courseData.title || '', // Assuming title maps to topic
                    description: courseData.description || '',
                    estimatedDuration: courseData.estimatedDuration?.toString() || '',
                    level: courseData.level || '',
                    learningGoal: courseData.learningGoal || '',
                    userId: courseData.createdBy || '',
                    chapterCount: courseData.modules?.length.toString() || '5' // Use actual module count
                });
            } catch (err) {
                console.error('Error fetching course data:', err);
                setError('Failed to load course data for editing.');
            } finally {
                setLoading(false);
            }
        };

        // Removed Clerk user dependency for setting userId
        // if (user) {
        //     // Ensure userId is set, potentially override if needed based on auth
        //     setFormData(prev => ({ ...prev, userId: user.id }))
        // }
        fetchCourseData();
    }, [courseId]) // Removed user dependency

    const StepperOptions = [
        {
            id: 1,
            name: 'Category',
            icon: <HiMiniSquares2X2/>
        },
        {
            id: 2,
            name: 'Topic',
            icon: <HiLightBulb/>
        },
        {
            id: 3,
            name: 'Options',
            icon: <HiClipboardDocumentCheck/>
        },
    ]
    const [activeIndex, setActiveIndex] = useState(0)

    // TODO: Update handleSubmit to call the update endpoint
    const handleSubmit = async () => {
        try {
            setLoading(true)
            setError('')
            
            // Call the update endpoint instead of create
            const response = await axios.put(getApiUrl(`/api/content/course/${courseId}`), {
                title: formData.topic, // Map topic back to title
                level: formData.level,
                learningGoal: formData.learningGoal,
                estimatedDuration: parseInt(formData.estimatedDuration),
                category: formData.category,
                // userId: formData.userId, // Removed Clerk user ID dependency, add your own auth logic if needed
                description: formData.description || `A course about ${formData.topic}`,
                // Note: Updating modules/lessons might require a different approach/endpoint
            })
            
            setSuccess(true)
            setTimeout(() => {
                navigate(`/course/${courseId}`) // Navigate back to the course detail page
            }, 3000)
        } catch (err) {
            console.error('Error updating course:', err)
            setError('Failed to update course. Please try again.')
        } finally {
            setLoading(false)
        }
    }

  return (
    <div>
      <Header />
      {/* Stepper */}
      <div className='flex flex-col justify-center items-center mt-10'>
        <h2 className='text-4xl text-[#4338ca] font-medium'>Edit Course</h2> {/* Update Title */}
        <div className='flex mt-10'>
            {
                StepperOptions.map((item, index)=>(
                    <div key={index} className='flex items-center'>
                        <div className='flex flex-col items-center w-[50px] md:w-[100px]'>
                        <div className={`p-3 rounded-full transition-all duration-300 ease-in-out transform ${activeIndex >= index ? 'bg-[#4338ca] text-white scale-110' : 'bg-gray-200 text-gray-500'}`}>{item.icon}</div>
                        <h2 className='hidden md:block md:text-sm mt-2 transition-colors duration-300 ease-in-out ${activeIndex >= index ? "text-black font-medium" : "text-gray-500"}'>{item.name}</h2>
                        </div>
                        {index !== StepperOptions.length - 1 && <div className={`h-1 w-[50px] md:w-[100px] rounded-full lg:w-[170px] transition-all duration-500 ease-in-out ${activeIndex > index ? 'bg-[#4338ca]' : 'bg-gray-100'}`}></div>}
                    </div>
                ))
            }
        </div>
      </div>

      <div className='px-10 md:px-10 mt-10'>
        {/* Loading and Error States */}
        {loading && <Loader message="Loading course data..." />} {/* Update Loader message */}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Success! </strong>
            <span className="block sm:inline">Your course has been updated. Redirecting...</span> {/* Update Success message */}
          </div>
        )}
 
        {/* Components - Pass formData and setFormData to children */}
        {!loading && !success && (
          <>
            {/* Pass existing data to stepper components */}
            {activeIndex === 0 && <SelectedCategory setActiveIndex={setActiveIndex} setFormData={setFormData} formData={formData} />}
            {activeIndex === 1 && <TopicDescription setActiveIndex={setActiveIndex} setFormData={setFormData} formData={formData} />}
            {activeIndex === 2 && <SelectOption setActiveIndex={setActiveIndex} setFormData={setFormData} formData={formData} handleSubmit={handleSubmit} isEditing={true} />} {/* Pass isEditing flag */}
          </>
        )}
      </div>
    </div>
  )
}

// TODO: Rename export
export default EditCourse // Renamed export