import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { getApiUrl } from '../lib/api-config'
import { marked } from 'marked'
import { jsPDF } from 'jspdf'
import Header from '@/components/ui/Header'
import { Button } from '@/components/ui/button'

import './CourseDetail.css'

const stripMarkdown = (text) => {
  if (!text) return ''
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*\*([^*]*)\*\*/g, '$1')
    .replace(/\*([^*]*)\*/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '- ')
    .replace(/^\s*>\s?/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const getBadgeName = (badge) => {
  if (typeof badge === 'string') return badge
  return badge?.name || badge?.title || 'New Badge'
}

const CourseDetail = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useSelector(state => state.user)
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeModule, setActiveModule] = useState(0)
  const [activeLesson, setActiveLesson] = useState(0)

  // Learn-at-Your-Level state
  const [selectedLevel, setSelectedLevel] = useState('standard')
  const [explanations, setExplanations] = useState({})
  const [explanationLoadingKey, setExplanationLoadingKey] = useState(null)
  const [explanationError, setExplanationError] = useState('')

  // WAEC practice state (keyed by lesson so it persists while navigating)
  const [waecByLesson, setWaecByLesson] = useState({})

  // Extra practice content state (keyed by lesson, then by content type)
  const [extraByLesson, setExtraByLesson] = useState({})

  // Lesson completion state
  const [completedLessons, setCompletedLessons] = useState(new Set())
  const [completeLoading, setCompleteLoading] = useState(false)
  const [completeResults, setCompleteResults] = useState({})

  const activeLessonData = course?.modules?.[activeModule]?.lessons?.[activeLesson]
  const lessonKey = activeLessonData?._id || `${activeModule}-${activeLesson}`

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true)
        if (!courseId) {
          throw new Error('Course ID is missing')
        }
        const response = await axios.get(getApiUrl(`/api/content/course/${courseId}`))
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

  // Reset the level toggle whenever a different lesson is opened
  useEffect(() => {
    setSelectedLevel('standard')
    setExplanationError('')
  }, [lessonKey])

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
    setActiveLesson(0)
  }

  const handleLessonClick = (index) => {
    setActiveLesson(index)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getYouTubeVideoId = (url) => {
    if (!url) return null
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  const handleLevelChange = async (level) => {
    setSelectedLevel(level)
    if (level === 'standard') return
    const key = `${lessonKey}-${level}`
    if (explanations[key]) return
    setExplanationError('')
    setExplanationLoadingKey(key)
    try {
      const response = await axios.post(getApiUrl('/api/study-tools/explain'), {
        courseId,
        lessonId: currentLesson._id,
        level
      })
      setExplanations((prev) => ({ ...prev, [key]: response.data.explanation }))
    } catch (err) {
      console.error('Error fetching explanation:', err)
      setExplanationError(`Could not generate the ${level} explanation. Please try again.`)
    } finally {
      setExplanationLoadingKey(null)
    }
  }

  const updateWaecState = (updates) => {
    setWaecByLesson((prev) => ({
      ...prev,
      [lessonKey]: { ...prev[lessonKey], ...updates }
    }))
  }

  const handleFetchWaecQuestions = async () => {
    updateWaecState({ loading: true, error: '' })
    try {
      const response = await axios.post(getApiUrl('/api/study-tools/waec-questions'), {
        courseId,
        lessonId: currentLesson._id
      })
      const questions = response.data.questions || []
      if (questions.length === 0) {
        updateWaecState({ loading: false, error: 'Could not generate questions, try again' })
        return
      }
      updateWaecState({
        loading: false,
        questions,
        answers: {},
        submitted: false,
        score: null,
        badges: []
      })
    } catch (err) {
      console.error('Error fetching WAEC questions:', err)
      updateWaecState({ loading: false, error: 'Could not generate questions, try again' })
    }
  }

  const handleSelectWaecOption = (questionIndex, optionIndex) => {
    const waecState = waecByLesson[lessonKey]
    if (waecState?.submitted) return
    updateWaecState({
      answers: { ...(waecState?.answers || {}), [questionIndex]: optionIndex }
    })
  }

  const handleSubmitWaec = async () => {
    const waecState = waecByLesson[lessonKey]
    if (!waecState?.questions) return
    const questions = waecState.questions
    const answers = waecState.answers || {}
    const correct = questions.reduce(
      (sum, q, i) => sum + (answers[i] === q.correctAnswer ? 1 : 0),
      0
    )
    updateWaecState({ submitted: true, score: correct })

    if (currentUser) {
      try {
        const response = await axios.post(getApiUrl('/api/gamification/waec-attempt'), {
          userId: currentUser._id,
          correct,
          total: questions.length
        })
        if (response.data?.newBadges?.length > 0) {
          updateWaecState({ badges: response.data.newBadges })
        }
      } catch (err) {
        console.error('Error recording WAEC attempt:', err)
      }
    }
  }

  const updateExtraState = (updates) => {
    setExtraByLesson((prev) => ({
      ...prev,
      [lessonKey]: { ...prev[lessonKey], ...updates }
    }))
  }

  const handleGenerateExtra = async (contentType) => {
    const extraState = extraByLesson[lessonKey] || {}
    updateExtraState({ loadingType: contentType, error: '', activeType: contentType })
    try {
      const response = await axios.post(getApiUrl('/api/ai-content/generate-additional-content'), {
        contentId: courseId,
        lessonId: currentLesson._id,
        contentType
      })
      updateExtraState({
        loadingType: null,
        results: { ...(extraState.results || {}), [contentType]: response.data }
      })
    } catch (err) {
      console.error('Error generating extra content:', err)
      updateExtraState({ loadingType: null, error: 'Could not generate content right now. Please try again.' })
    }
  }

  const handleMarkComplete = async () => {
    if (!currentUser || !currentLesson) return
    setCompleteLoading(true)
    try {
      const response = await axios.post(getApiUrl('/api/gamification/complete-lesson'), {
        userId: currentUser._id,
        courseId,
        lessonId: currentLesson._id
      })
      if (response.data?.success) {
        setCompletedLessons((prev) => new Set(prev).add(lessonKey))
        setCompleteResults((prev) => ({
          ...prev,
          [lessonKey]: {
            points: response.data.points,
            badges: response.data.newBadges || []
          }
        }))
      }
    } catch (err) {
      console.error('Error marking lesson complete:', err)
    } finally {
      setCompleteLoading(false)
    }
  }

  const handleDownloadPdf = () => {
    if (!course) return
    const doc = new jsPDF()
    const pageHeight = doc.internal.pageSize.getHeight()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 15
    const maxWidth = pageWidth - margin * 2
    let y = 20

    const addText = (text, fontSize, fontStyle = 'normal', gapAfter = 6) => {
      if (!text) return
      doc.setFontSize(fontSize)
      doc.setFont('helvetica', fontStyle)
      const lines = doc.splitTextToSize(text, maxWidth)
      lines.forEach((line) => {
        if (y > pageHeight - 20) {
          doc.addPage()
          y = 20
        }
        doc.text(line, margin, y)
        y += fontSize * 0.5
      })
      y += gapAfter
    }

    addText(course.title, 20, 'bold', 10)
    addText(course.description, 11, 'normal', 10)

    course.modules.forEach((module, moduleIndex) => {
      addText(`Module ${moduleIndex + 1}: ${module.title}`, 15, 'bold', 6)
      module.lessons.forEach((lesson, lessonIndex) => {
        addText(`${moduleIndex + 1}.${lessonIndex + 1} ${lesson.title}`, 13, 'bold', 4)
        addText(lesson.summary ? `Summary: ${stripMarkdown(lesson.summary)}` : '', 10, 'italic', 4)
        addText(stripMarkdown(lesson.aiNotes || lesson.content), 10, 'normal', 8)
      })
    })

    doc.save(`${course.title}.pdf`)
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
  const waecState = waecByLesson[lessonKey] || {}
  const extraState = extraByLesson[lessonKey] || {}
  const activeExtraResult = extraState.activeType ? extraState.results?.[extraState.activeType] : null
  const extraContent = activeExtraResult?.content || activeExtraResult?.aiNotes || activeExtraResult?.summary || ''
  const currentExplanationKey = `${lessonKey}-${selectedLevel}`
  const currentExplanation = selectedLevel !== 'standard' ? explanations[currentExplanationKey] : null
  const isExplanationLoading = explanationLoadingKey === currentExplanationKey

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="hover:bg-gray-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Button>
            <Button variant="outline" onClick={handleDownloadPdf} className="text-indigo-700 border-indigo-200 hover:bg-indigo-50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
              </svg>
              Download Study Pack (PDF)
            </Button>
          </div>

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

                  <div className="mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                      Learn at your level:
                    </span>
                    <div className="flex rounded-lg overflow-hidden border border-indigo-200">
                      {['standard', 'JHS', 'SHS'].map((level) => (
                        <button
                          key={level}
                          onClick={() => handleLevelChange(level)}
                          className={`px-4 py-1.5 text-sm font-medium transition-colors ${selectedLevel === level ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-700 hover:bg-indigo-50'}`}
                        >
                          {level === 'standard' ? 'Standard' : level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-8 study-notes-container">
                    <div className="study-notes-header">
                      <h3 className="text-xl font-bold flex items-center text-indigo-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Study Notes
                      </h3>
                      {selectedLevel !== 'standard' && (
                        <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">{selectedLevel} level</span>
                      )}
                    </div>

                    {selectedLevel !== 'standard' ? (
                      isExplanationLoading && !currentExplanation ? (
                        <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-lg">
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-600"></div>
                          <p className="text-indigo-700">AI is rewriting this lesson for {selectedLevel} level...</p>
                        </div>
                      ) : explanationError ? (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{explanationError}</div>
                      ) : currentExplanation ? (
                        <div className="study-notes-content">
                          <div
                            className="prose prose-indigo max-w-none grouped-content"
                            dangerouslySetInnerHTML={{ __html: marked.parse(currentExplanation) }}
                          ></div>
                        </div>
                      ) : null
                    ) : currentLesson.aiNotes ? (
                      <div className="study-notes-content">
                        <div
                          className="prose prose-indigo max-w-none grouped-content"
                          dangerouslySetInnerHTML={{ __html: marked.parse(currentLesson.aiNotes) }}
                        ></div>
                      </div>
                    ) : currentLesson.content ? (
                      <div className="study-notes-content">
                        <div
                          className="prose prose-indigo max-w-none grouped-content"
                          dangerouslySetInnerHTML={{ __html: marked.parse(currentLesson.content) }}
                        ></div>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-gray-500">No study notes available for this lesson.</p>
                      </div>
                    )}
                  </div>

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

                  <div className="mb-8 lesson-content-container">
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
                      <div className="mt-4 px-4 pb-4 lesson-content-inner">
                        <div className="prose prose-indigo max-w-none">
                          {currentLesson.aiNotes ? (
                            <div className='text-[1.1rem] text-[#1f2937]' dangerouslySetInnerHTML={{ __html: marked.parse(currentLesson.aiNotes) }}></div>
                          ) : currentLesson.content ? (
                            currentLesson.content.split('\n').map((paragraph, i) => (
                              <p key={i} className=" lesson-content-paragraph">{paragraph}</p>
                            ))
                          ) : (
                            <p className="text-gray-500">No detailed content available for this lesson.</p>
                          )}
                        </div>
                      </div>
                    </details>
                  </div>

                  <div className="mb-8 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold mb-3 text-gray-800 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      WAEC Practice
                    </h3>

                    {!waecState.questions ? (
                      <div>
                        <p className="text-gray-600 text-sm mb-4">Test yourself with WAEC-style questions generated from this lesson.</p>
                        <Button
                          onClick={handleFetchWaecQuestions}
                          disabled={waecState.loading}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          {waecState.loading ? 'Generating questions...' : 'Practice WAEC Questions'}
                        </Button>
                        {waecState.error && (
                          <p className="text-red-600 text-sm mt-3">{waecState.error}</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {waecState.questions.map((question, questionIndex) => {
                          const selectedOption = waecState.answers?.[questionIndex]
                          return (
                            <div key={questionIndex} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <p className="font-medium text-gray-800">{questionIndex + 1}. {question.question}</p>
                                {question.year && (
                                  <span className="flex-shrink-0 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full font-medium">
                                    WAEC {question.year} style
                                  </span>
                                )}
                              </div>
                              <div className="space-y-2">
                                {question.options.map((option, optionIndex) => {
                                  const isSelected = selectedOption === optionIndex
                                  const isCorrect = question.correctAnswer === optionIndex
                                  let optionClass = 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                                  if (waecState.submitted) {
                                    if (isCorrect) {
                                      optionClass = 'border-green-400 bg-green-50'
                                    } else if (isSelected) {
                                      optionClass = 'border-red-400 bg-red-50'
                                    } else {
                                      optionClass = 'border-gray-200 opacity-70'
                                    }
                                  } else if (isSelected) {
                                    optionClass = 'border-indigo-500 bg-indigo-50'
                                  }
                                  return (
                                    <button
                                      key={optionIndex}
                                      onClick={() => handleSelectWaecOption(questionIndex, optionIndex)}
                                      disabled={waecState.submitted}
                                      className={`w-full text-left px-3 py-2 rounded-lg border text-sm flex items-center gap-2 transition-colors ${optionClass}`}
                                    >
                                      <span className={`w-4 h-4 rounded-full border flex-shrink-0 ${isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-gray-400'}`}></span>
                                      <span>{option}</span>
                                      {waecState.submitted && isCorrect && (
                                        <span className="ml-auto text-green-600 font-bold">✓</span>
                                      )}
                                      {waecState.submitted && isSelected && !isCorrect && (
                                        <span className="ml-auto text-red-600 font-bold">✗</span>
                                      )}
                                    </button>
                                  )
                                })}
                              </div>
                              {waecState.submitted && question.explanation && (
                                <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded text-sm text-gray-700">
                                  <span className="font-medium text-blue-800">Explanation: </span>
                                  {question.explanation}
                                </div>
                              )}
                            </div>
                          )
                        })}

                        {!waecState.submitted ? (
                          <Button
                            onClick={handleSubmitWaec}
                            disabled={Object.keys(waecState.answers || {}).length !== waecState.questions.length}
                            className="bg-indigo-600 hover:bg-indigo-700"
                          >
                            Check Answers
                          </Button>
                        ) : (
                          <div className="p-4 bg-indigo-50 rounded-lg">
                            <p className="font-bold text-indigo-800">
                              Score: {waecState.score}/{waecState.questions.length} correct
                            </p>
                            {waecState.badges?.length > 0 && (
                              <p className="text-sm text-amber-700 font-medium mt-1">
                                Congratulations! You earned: {waecState.badges.map(getBadgeName).join(', ')}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mb-8 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold mb-1 text-gray-800 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Extra Practice
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">Need more help with this lesson? Let the AI generate extra material for you.</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {[
                        { type: 'examples', label: 'More Examples' },
                        { type: 'exercises', label: 'Practice Exercises' },
                        { type: 'summary', label: 'Quick Summary' },
                      ].map(({ type, label }) => {
                        const isLoading = extraState.loadingType === type
                        const isActive = extraState.activeType === type && extraState.results?.[type]
                        return (
                          <Button
                            key={type}
                            variant="outline"
                            onClick={() => {
                              if (extraState.results?.[type]) {
                                updateExtraState({ activeType: type, error: '' })
                              } else {
                                handleGenerateExtra(type)
                              }
                            }}
                            disabled={!!extraState.loadingType}
                            className={isActive ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : ''}
                          >
                            {isLoading ? (
                              <span className="flex items-center gap-2">
                                <span className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-indigo-600"></span>
                                Generating...
                              </span>
                            ) : label}
                          </Button>
                        )
                      })}
                    </div>

                    {extraState.error && (
                      <p className="text-red-600 text-sm mb-3">{extraState.error}</p>
                    )}

                    {extraContent ? (
                      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                        {activeExtraResult?.title && (
                          <h4 className="font-bold text-indigo-900 mb-3">{activeExtraResult.title}</h4>
                        )}
                        <div
                          className="prose prose-indigo max-w-none"
                          dangerouslySetInnerHTML={{ __html: marked.parse(extraContent) }}
                        ></div>
                      </div>
                    ) : extraState.loadingType ? (
                      <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-lg">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-600"></div>
                        <p className="text-indigo-700 text-sm">AI is preparing your {extraState.loadingType}...</p>
                      </div>
                    ) : null}
                  </div>

                  {currentUser && (
                    <div className="mt-8 flex flex-col items-center gap-2">
                      {completedLessons.has(lessonKey) ? (
                        <Button disabled className="bg-green-600 text-white cursor-default">
                          Completed ✓ (+{completeResults[lessonKey]?.points ?? 10} pts)
                        </Button>
                      ) : (
                        <Button
                          onClick={handleMarkComplete}
                          disabled={completeLoading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {completeLoading ? 'Saving...' : 'Mark as Complete'}
                        </Button>
                      )}
                      {completeResults[lessonKey]?.badges?.length > 0 && (
                        <p className="text-sm text-amber-700 font-medium">
                          Badge earned: {completeResults[lessonKey].badges.map(getBadgeName).join(', ')}
                        </p>
                      )}
                    </div>
                  )}

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
