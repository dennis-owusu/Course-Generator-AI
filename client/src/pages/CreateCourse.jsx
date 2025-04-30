"use client"

import SelectedCategory from '@/components/stepper/SelectedCategory'
import SelectOption from '@/components/stepper/SelectOption'
import TopicDescription from '@/components/stepper/TopicDescription'
import { Button } from '@/components/ui/button'
import React, { useState, useEffect } from 'react'
import { HiClipboardDocumentCheck, HiLightBulb, HiMiniSquares2X2 } from 'react-icons/hi2'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import axios from 'axios'
import Header from '@/components/ui/Header'

const CreateCourse = () => {
    const navigate = useNavigate()
    const { user } = useUser()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [generatedCourse, setGeneratedCourse] = useState(null)

    const [formData, setFormData] = useState({
        category: '',
        topic: '',
        description: '',
        estimatedDuration: '',
        level: '',
        learningGoal: '',
        userId: ''
    })

    useEffect(() => {
        if (user) {
            setFormData(prev => ({ ...prev, userId: user.id }))
        }
    }, [user])

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
            
            const response = await axios.post('http://localhost:3000/api/content/generate-course', {
                topic: formData.topic,
                level: formData.level,
                learningGoal: formData.learningGoal,
                estimatedDuration: parseInt(formData.estimatedDuration),
                category: formData.category,
                userId: formData.userId,
                description: formData.description || `A course about ${formData.topic}`
            })
            
            setGeneratedCourse(response.data.course)
            setSuccess(true)
            setTimeout(() => {
                navigate('/dashboard')
            }, 3000)
        } catch (err) {
            console.error('Error generating course:', err)
            setError('Failed to generate course. Please try again.')
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
                        <div className={`bg-gray-200 p-3 rounded-full text-white ${activeIndex >= index && 'bg-black'}`}>{item.icon}</div>
                        <h2 className='hidden md:block md:text-sm'>{item.name}</h2>
                        </div>
                        {index != StepperOptions?.length - 1 &&<div className={`h-1 w-[50px] md:w-[100px] rounded-full lg:w-[170px] bg-gray-100 ${activeIndex - 1 >= index && 'bg-black'}`}></div>}
                    </div>
                ))
            }
        </div>
      </div>

      <div className='px-10 md:px-10 mt-10'>
        {/* Loading and Error States */}
        {loading && (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg">Generating your course with AI...</p>
          </div>
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