import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { marked } from 'marked'
import Header from '@/components/ui/Header'
import { Button } from '@/components/ui/button'

const CourseDetail = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeModule, setActiveModule] = useState(0)
  const [activeLesson, setActiveLesson] = useState(0)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`http://localhost:3000/api/content/course/${courseId}`)
        setCourse(response.data)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching course:', err)
        setError('Failed to load course. Please try again later.')
        setLoading(false)
      }
    }

    fetchCourse()
  }, [courseId])

  const handleModuleClick = (index) => {
    setActiveModule(index)
    setActiveLesson(0) // Reset to first lesson when changing modules
  }

  const handleLessonClick = (index) => {
    setActiveLesson(index)
  }

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex justify-center items-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  if (!course) return null

  const currentModule = course.modules[activeModule]
  const currentLesson = currentModule?.lessons[activeLesson]
  const videoId = currentLesson?.youtubeVideoUrl ? getYouTubeVideoId(currentLesson.youtubeVideoUrl) : null

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate('/dashboard')} className="mb-4">
            ← Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <div className="flex items-center mt-2 text-sm text-gray-600">
            <span className="bg-primary/10 text-primary px-2 py-1 rounded mr-3">{course.level}</span>
            <span className="mr-3">{course.estimatedDuration} hours</span>
            <span>{course.category}</span>
          </div>
          <p className="mt-4 text-gray-700">{course.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with modules and lessons */}
          <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Course Content</h2>
            <div className="space-y-4">
              {course.modules.map((module, moduleIndex) => (
                <div key={moduleIndex} className="border rounded-md overflow-hidden">
                  <button
                    className={`w-full text-left p-3 font-medium flex justify-between items-center ${activeModule === moduleIndex ? 'bg-primary text-white' : 'bg-gray-100'}`}
                    onClick={() => handleModuleClick(moduleIndex)}
                  >
                    <span>{module.title}</span>
                    <span className="text-xs">{module.lessons.length} lessons</span>
                  </button>
                  
                  {activeModule === moduleIndex && (
                    <div className="bg-white">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <button
                          key={lessonIndex}
                          className={`w-full text-left p-3 text-sm border-t ${activeLesson === lessonIndex ? 'bg-gray-100 font-medium' : ''}`}
                          onClick={() => handleLessonClick(lessonIndex)}
                        >
                          {lesson.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main content area */}
          <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow">
            {currentLesson ? (
              <div>
                <h2 className="text-2xl font-bold mb-4">{currentLesson.title}</h2>
                
                {videoId && (
                  <div className="aspect-w-16 aspect-h-9 mb-6">
                    <iframe
                      className="w-full h-[400px] rounded-lg"
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title={currentLesson.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
                
                {/* AI-generated notes section */}
                {currentLesson.aiNotes && (
                  <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      AI-Generated Study Notes
                    </h3>
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: marked.parse(currentLesson.aiNotes) }}></div>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Summary</h3>
                  <p className="text-gray-700">{currentLesson.summary}</p>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Lesson Content</h3>
                  <div className="prose max-w-none">
                    {currentLesson.content.split('\n').map((paragraph, i) => (
                      <p key={i} className="mb-4">{paragraph}</p>
                    ))}
                  </div>
                </div>
                
                {currentLesson.quizQuestions && currentLesson.quizQuestions.length > 0 && (
                  <div className="mt-8 border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Knowledge Check</h3>
                    <div className="space-y-6">
                      {currentLesson.quizQuestions.map((quiz, quizIndex) => (
                        <div key={quizIndex} className="bg-gray-50 p-4 rounded-lg">
                          <p className="font-medium mb-3">{quiz.question}</p>
                          <div className="space-y-2">
                            {quiz.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center">
                                <input
                                  type="radio"
                                  id={`quiz-${quizIndex}-option-${optionIndex}`}
                                  name={`quiz-${quizIndex}`}
                                  className="mr-2"
                                />
                                <label htmlFor={`quiz-${quizIndex}-option-${optionIndex}`}>{option}</label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-8 flex justify-between">
                  <Button
                    variant="outline"
                    disabled={activeLesson === 0}
                    onClick={() => setActiveLesson(activeLesson - 1)}
                  >
                    Previous Lesson
                  </Button>
                  <Button
                    disabled={activeLesson === currentModule.lessons.length - 1 && activeModule === course.modules.length - 1}
                    onClick={() => {
                      if (activeLesson < currentModule.lessons.length - 1) {
                        setActiveLesson(activeLesson + 1)
                      } else if (activeModule < course.modules.length - 1) {
                        setActiveModule(activeModule + 1)
                        setActiveLesson(0)
                      }
                    }}
                  >
                    Next Lesson
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">Select a lesson to start learning</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseDetail