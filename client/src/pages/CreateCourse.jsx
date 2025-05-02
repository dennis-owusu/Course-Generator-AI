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
  const { currentUser } = useSelector(state => state.user)

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
      setFormData(prev => ({ ...prev, userId: currentUser._id }))
    }
  }, [currentUser])

  const StepperOptions = [
    {
      id: 1,
      name: 'Category',
      icon: <HiMiniSquares2X2 />
    },
    {
      id: 2,
      name: 'Topic',
      icon: <HiLightBulb />
    },
    {
      id: 3,
      name: 'Options',
      icon: <HiClipboardDocumentCheck />
    },
  ]
  const [activeIndex, setActiveIndex] = useState(0)

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Validate all required fields are present
      const requiredFields = ['topic', 'level', 'learningGoal', 'estimatedDuration', 'category']
      const missingFields = []
      
      requiredFields.forEach(field => {
        if (!formData[field]) {
          missingFields.push(field)
        }
      })
      
      if (!formData.userId) {
        missingFields.push('userId')
      }
      
      if (missingFields.length > 0) {
        setError(`Missing required fields: ${missingFields.join(', ')}`)
        setLoading(false)
        return
      }
      
      const response = await axios.post('http://localhost:3000/api/content/generate-course', {
        topic: formData.topic,
        level: formData.level,
        learningGoal: formData.learningGoal,
        estimatedDuration: parseInt(formData.estimatedDuration),
        category: formData.category,
        userId: formData.userId,
        description: formData.description || `A course about ${formData.topic}`,
        chapterCount: parseInt(formData.chapterCount || '5')
      })
      
      setGeneratedCourse(response.data.course)
      setSuccess(true)
      setTimeout(() => {
        navigate('/dashboard')
      }, 3000)
    } catch (err) {
      console.error('Error generating course:', err)
      if (err.response && err.response.data && err.response.data.requiredFields) {
        setError(`Missing required fields: ${err.response.data.requiredFields.join(', ')}`)
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(`Error: ${err.response.data.message}`)
      } else {
        setError('Failed to generate course. Please check your connection and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {/* Stepper */}
      <div className="flex flex-col justify-center items-center mt-12">
        <h2 className="text-4xl font-bold text-indigo-900 mb-8">Create Your Course</h2>
        <div className="flex items-center space-x-2 sm:space-x-4">
          {StepperOptions.map((item, index) => (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center w-[60px] sm:w-[100px]">
                <div
                  className={`p-3 rounded-full transition-all duration-300 ease-in-out transform ${
                    activeIndex >= index
                      ? 'bg-indigo-600 text-white scale-110'
                      : 'bg-indigo-50 text-indigo-300'
                  }`}
                >
                  {item.icon}
                </div>
                <h2
                  className={`hidden sm:block text-sm mt-2 transition-colors duration-300 ease-in-out ${
                    activeIndex >= index ? 'text-indigo-900 font-semibold' : 'text-indigo-300'
                  }`}
                >
                  {item.name}
                </h2>
              </div>
              {index !== StepperOptions.length - 1 && (
                <div
                  className={`h-1 w-[50px] sm:w-[80px] lg:w-[120px] rounded-full transition-all duration-500 ease-in-out ${
                    activeIndex > index ? 'bg-indigo-600' : 'bg-indigo-100'
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-10 mt-12">
        {/* Loading and Error/Success States */}
        {loading && <Loader />}

        {error && (
          <div
            className="bg-indigo-50 border border-indigo-200 text-indigo-900 px-4 py-3 rounded-lg mb-6 animate-slide-in"
            role="alert"
          >
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {success && (
          <div
            className="bg-indigo-50 border border-indigo-200 text-indigo-900 px-4 py-3 rounded-lg mb-6 animate-slide-in"
            role="alert"
          >
            <strong className="font-bold">Success! </strong>
            <span className="block sm:inline">Your course has been generated. Redirecting to dashboard...</span>
          </div>
        )}

        {/* Components */}
        {!loading && !success && (
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 animate-fade-in">
            {activeIndex === 0 && (
              <SelectedCategory setActiveIndex={setActiveIndex} setFormData={setFormData} formData={formData} />
            )}
            {activeIndex === 1 && (
              <TopicDescription setActiveIndex={setActiveIndex} setFormData={setFormData} formData={formData} />
            )}
            {activeIndex === 2 && (
              <SelectOption
                setActiveIndex={setActiveIndex}
                setFormData={setFormData}
                formData={formData}
                handleSubmit={handleSubmit}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CreateCourse