"use client"

import SelectedCategory from '@/components/stepper/SelectedCategory'
import SelectOption from '@/components/stepper/SelectOption'
import TopicDescription from '@/components/stepper/TopicDescription'
import { Button } from '@/components/ui/button'
import React, { useState, useEffect } from 'react'
import { HiClipboardDocumentCheck, HiLightBulb, HiMiniSquares2X2 } from 'react-icons/hi2'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Header from '@/components/ui/Header'
import { useSelector } from 'react-redux'
import Loader from '@/components/Loader'

const CreateCourse = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [generatedCourse, setGeneratedCourse] = useState(null)
    const {currentUser} = useSelector(state => state.user)

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
        if (currentUser && currentUser._id) {
            // Set the userId in formData when user data is available
            setFormData(prev => ({ ...prev, userId: currentUser._id })) 
        }
    }, [currentUser])

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

    const handleSubmit = async () => {
        try {
            setLoading(true)
            setError('')
            
            // Validate all required fields are present
            const requiredFields = ['topic', 'level', 'learningGoal', 'estimatedDuration', 'category'];
            const missingFields = [];
            
            requiredFields.forEach(field => {
                if (!formData[field]) {
                    missingFields.push(field);
                }
            });
            
            // Check if userId is available
            if (!formData.userId) {
                missingFields.push('userId');
            }
            
            if (missingFields.length > 0) {
                setError(`Missing required fields: ${missingFields.join(', ')}`);
                setLoading(false);
                return;
            }
            
            const response = await axios.post('http://localhost:3000/api/content/generate-course', {
                topic: formData.topic,
                level: formData.level,
                learningGoal: formData.learningGoal,
                estimatedDuration: parseInt(formData.estimatedDuration),
                category: formData.category,
                userId: formData.userId, // Use the userId from formData instead of directly from user object
                description: formData.description || `A course about ${formData.topic}`,
                chapterCount: parseInt(formData.chapterCount || '5') // Default to 5 chapters if not specified
            })
            
            setGeneratedCourse(response.data.course)
            setSuccess(true)
            setTimeout(() => {
                navigate('/dashboard')
            }, 3000)
        } catch (err) {
            console.error('Error generating course:', err)
            // Check if the error response contains specific missing fields
            if (err.response && err.response.data && err.response.data.requiredFields) {
                 setError(`Missing required fields: ${err.response.data.requiredFields.join(', ')}`);
            } else if (err.response && err.response.data && err.response.data.message) {
                 setError(`Error: ${err.response.data.message}`); // Display general backend error message
            } else {
                 setError('Failed to generate course. Please check your connection and try again.');
            }
        } finally {
            setLoading(false)
        }
    }

  return (
    <div>
      <Header />
      {/* Stepper */}
      <div className='flex flex-col justify-center items-center mt-10'>
        <h2 className='text-4xl text-primary font-medium'>Create Course</h2>
        <div className='flex mt-10'>
            {
                StepperOptions.map((item, index)=>(
                    <div key={index} className='flex items-center'>
                        <div className='flex flex-col items-center w-[50px] md:w-[100px]'>
                        <div className={`p-3 rounded-full transition-all duration-300 ease-in-out transform ${activeIndex >= index ? 'bg-[#4338ca] text-white scale-110' : 'bg-gray-200 text-gray-500'}`}>{item.icon}</div>
                        <h2 className={`hidden md:block md:text-sm mt-2 transition-colors duration-300 ease-in-out ${activeIndex >= index ? 'text-black font-medium' : 'text-gray-500'}`}>{item.name}</h2>
                        </div>
                        {index != StepperOptions?.length - 1 &&<div className={`h-1 w-[50px] md:w-[100px] rounded-full lg:w-[170px] transition-all duration-500 ease-in-out ${activeIndex > index ? 'bg-[#4338ca]' : 'bg-gray-100'}`}></div>}
                    </div>
                ))
            }
        </div>
      </div>

      <div className='px-10 md:px-10 mt-10'>
        {/* Loading and Error States */}
        {loading && (
          <Loader />
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Success! </strong>
            <span className="block sm:inline">Your course has been generated. Redirecting to dashboard...</span>
          </div>
        )}
 
        {/* Components */}
        {!loading && !success && (
          <>
            {activeIndex === 0 && <SelectedCategory setActiveIndex={setActiveIndex} setFormData={setFormData} formData={formData} />}
            {activeIndex === 1 && <TopicDescription setActiveIndex={setActiveIndex} setFormData={setFormData} formData={formData} />}
            {activeIndex === 2 && <SelectOption setActiveIndex={setActiveIndex} setFormData={setFormData} formData={formData} handleSubmit={handleSubmit} />}
          </>
        )}
      </div>
    </div>
  )
}

export default CreateCourse