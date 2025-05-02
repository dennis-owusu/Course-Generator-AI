import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { marked } from 'marked'
import Header from '@/components/ui/Header'
import { Button } from '@/components/ui/button'

// Import custom styles for enhanced course content presentation
import './CourseDetail.css'

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

  const handleNextLesson = () => {
    if (activeLesson < currentModule.lessons.length - 1) {
      setActiveLesson(activeLesson + 1)
    } else if (activeModule < course.modules.length - 1) {
      setActiveModule(activeModule + 1)
      setActiveLesson(0)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePreviousLesson = () => {
    if (activeLesson > 0) {
      setActiveLesson(activeLesson - 1)
    } else if (activeModule > 0) {
      setActiveModule(activeModule - 1)
      setActiveLesson(course.modules[activeModule - 1].lessons.length - 1)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }


  const handleModuleClick = (index) => {
    setActiveModule(index)
    setActiveLesson(0) // Reset to first lesson when changing modules
  }

  const handleLessonClick = (index) => {
    setActiveLesson(index)
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
        <div className="mb-8">
          <Button variant="outline" onClick={() => navigate('/dashboard')} className="mb-4 hover:bg-gray-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Button>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div className="mb-4 md:mb-0 md:pr-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
                <p className="text-gray-700 leading-relaxed mb-4">{course.description}</p>
                
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full font-medium text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {course.level}
                  </div>
                  
                  <div className="flex items-center bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full font-medium text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {course.estimatedDuration} hours
                  </div>
                  
                  <div className="flex items-center bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full font-medium text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {course.category}
                  </div>
                </div>
              </div>
              
              <div className="flex-shrink-0 flex flex-col items-center justify-center bg-indigo-50 p-4 rounded-lg">
                <div className="text-4xl font-bold text-indigo-600 mb-1">{course.modules.length}</div>
                <div className="text-sm text-indigo-700">Modules</div>
                <div className="w-full h-px bg-indigo-200 my-2"></div>
                <div className="text-4xl font-bold text-indigo-600 mb-1">{course.modules.reduce((sum, module) => sum + module.lessons.length, 0)}</div>
                <div className="text-sm text-indigo-700">Lessons</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with modules and lessons */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Course Content
              </h2>
              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                {course.modules.map((module, moduleIndex) => (
                  <div key={moduleIndex} className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:border-indigo-300">
                    <button
                      className={`w-full text-left p-3.5 font-medium flex justify-between items-center transition-colors ${activeModule === moduleIndex ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-800 hover:bg-indigo-50'}`}
                      onClick={() => handleModuleClick(moduleIndex)}
                    >
                      <div className="flex items-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full bg-opacity-20 mr-2 text-sm font-bold ${activeModule === moduleIndex ? 'bg-white text-indigo-700' : 'bg-indigo-100 text-indigo-700'}`}>{moduleIndex + 1}</span>
                        <span className="line-clamp-1">{module.title}</span>
                      </div>
                      <div className="flex items-center">
                        <span className={`text-xs px-2 py-1 rounded-full ${activeModule === moduleIndex ? 'bg-white bg-opacity-20' : 'bg-indigo-100'} mr-2`}>{module.lessons.length}</span>
                        <svg className={`h-4 w-4 transition-transform duration-200 ${activeModule === moduleIndex ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </button>
                    
                    <div className={`bg-white transition-all duration-300 ${activeModule === moduleIndex ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                      {module.lessons.map((lesson, lessonIndex) => (
                        <button
                          key={lessonIndex}
                          className={`w-full text-left p-3 text-sm border-t border-gray-100 flex items-center transition-colors ${activeLesson === lessonIndex && activeModule === moduleIndex ? 'bg-indigo-50 font-medium text-indigo-700' : 'hover:bg-gray-50'}`}
                          onClick={() => handleLessonClick(lessonIndex)}
                        >
                          <span className={`w-5 h-5 flex-shrink-0 inline-flex items-center justify-center rounded-full mr-2 ${activeLesson === lessonIndex && activeModule === moduleIndex ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>{lessonIndex + 1}</span>
                          <span className="line-clamp-1">{lesson.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="lg:col-span-3">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
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
                  
                  {/* Enhanced AI-generated study notes section */}
                  <div className="mb-8 study-notes-container">
                    <div className="study-notes-header">
                      <h3 className="text-xl font-bold flex items-center text-indigo-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Study Notes
                      </h3>
                    </div>
                    
                    {currentLesson.aiNotes ? (
                      <div className="study-notes-content">
                        <div 
                          className="prose prose-indigo max-w-none grouped-content"
                          dangerouslySetInnerHTML={{ __html: marked.parse(currentLesson.aiNotes) }}
                        ></div>
                      </div>
                    ) : (
                      <div className="study-notes-fallback">
                        <div className="notes-section">
                          <h4 className="section-title">Lesson Overview</h4>
                          <p className="section-content">This chapter covers key concepts related to <span className="highlight">{currentLesson.title}</span>.</p>
                        </div>
                        <div className="notes-section">
                          <h4 className="section-title">Key Points</h4>
                          <ul className="key-points-list">
                            <li className="key-point">
                              <span className="point-icon"></span>
                              <span className="point-text">Understanding the fundamentals of {currentLesson.title}</span>
                            </li>
                            <li className="key-point">
                              <span className="point-icon"></span>
                              <span className="point-text">Practical applications and examples</span>
                            </li>
                            <li className="key-point">
                              <span className="point-icon"></span>
                              <span className="point-text">Best practices and implementation strategies</span>
                            </li>
                          </ul>
                        </div>
                        <div className="notes-section">
                          <h4 className="section-title">Next Steps</h4>
                          <p className="section-content italic">Review the lesson content for detailed information on these topics.</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Summary Section */}
                  <div className="mb-8 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold mb-3 text-gray-800 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Key Takeaways
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-indigo-400">
                      <p className="text-gray-700 leading-relaxed">{currentLesson.summary}</p>
                    </div>
                  </div>
                  
                  {/* Lesson Content Section */}
                  <div className="mb-8">
                    <details open className="group">
                      <summary className="flex cursor-pointer items-center justify-between rounded-lg bg-indigo-50 px-4 py-3 text-lg font-medium text-indigo-900 hover:bg-indigo-100">
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <span>Detailed Lesson Content</span>
                        </div>
                        <svg className="h-5 w-5 shrink-0 transition duration-300 group-open:-rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="mt-4 px-4 pb-4">
                        <div className="prose prose-slate max-w-none">
                          {currentLesson.content.split('\n').map((paragraph, i) => (
                            <p key={i} className="mb-4 text-gray-700 leading-relaxed">{paragraph}</p>
                          ))}
                        </div>
                      </div>
                    </details>
                  </div>
                  
                  <div className="mt-8 flex justify-between">
                    <Button
                      variant="outline"
                      disabled={activeLesson === 0}
                      onClick={() => {
                        setActiveLesson(activeLesson - 1)
                        handlePreviousLesson()
                      }}
                    >
                      Previous Lesson
                    </Button>
                    <Button className='bg-indigo-600 hover:bg-indigo-700'
                      disabled={activeLesson === currentModule.lessons.length - 1 && activeModule === course.modules.length - 1}
                      onClick={() => {
                        if (activeLesson < currentModule.lessons.length - 1) {
                          setActiveLesson(activeLesson + 1)
                        } else if (activeModule < course.modules.length - 1) {
                          setActiveModule(activeModule + 1)
                          setActiveLesson(0)
                        }
                        handleNextLesson()
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
    </div>
  )
}

export default CourseDetail