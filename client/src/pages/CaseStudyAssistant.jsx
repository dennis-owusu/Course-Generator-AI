import React, { useState } from 'react'
import axios from 'axios'
import { getApiUrl } from '../lib/api-config'
import { HiOutlineDocumentText, HiOutlineCheckCircle, HiOutlineLightBulb, HiOutlineClock, HiOutlineExclamationCircle } from 'react-icons/hi2'

const CASE_STUDIES = [
  {
    id: 1,
    title: 'Post-Operative Recovery',
    patient: 'Mrs. Abena Mensah, 58 years old',
    scenario: 'Patient underwent abdominal hysterectomy 24 hours ago. Vital signs stable but reports pain 6/10 and refuses to ambulate.',
    difficulty: 'Intermediate',
    time: '25 min',
    questions: [
      'What are your priority nursing assessments?',
      'How would you manage post-operative pain while promoting mobility?',
      'What complications are you monitoring for?',
    ],
  },
  {
    id: 2,
    title: 'Pediatric Dehydration',
    patient: 'Master Kofi Owusu, 3 years old',
    scenario: 'Brought to clinic with diarrhea for 2 days, sunken eyes, dry mucous membranes, and decreased urine output.',
    difficulty: 'Beginner',
    time: '20 min',
    questions: [
      'Calculate and describe oral rehydration therapy.',
      'What clinical signs indicate severe dehydration?',
      'When would you escalate to intravenous fluids?',
    ],
  },
  {
    id: 3,
    title: 'Diabetic Ketoacidosis',
    patient: 'Mr. Yaw Asante, 24 years old',
    scenario: 'Type 1 diabetic presents with fruity breath, Kussmaul respirations, blood glucose 28 mmol/L, and pH 7.25.',
    difficulty: 'Advanced',
    time: '35 min',
    questions: [
      'Outline the immediate nursing interventions.',
      'What lab values would you monitor and why?',
      'How would you prevent cerebral edema during treatment?',
    ],
  },
]

const CaseStudyAssistant = () => {
  const [activeCase, setActiveCase] = useState(CASE_STUDIES[0])
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState({})
  const [hints, setHints] = useState({})
  const [loadingHint, setLoadingHint] = useState(false)
  const [error, setError] = useState('')

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers(prev => ({ ...prev, [`${activeCase.id}-${questionIndex}`]: value }))
  }

  const handleSubmit = () => {
    setSubmitted(prev => ({ ...prev, [activeCase.id]: true }))
  }

  const fetchHint = async () => {
    setLoadingHint(true)
    setError('')
    try {
      const res = await axios.post(getApiUrl('/api/ai-assistant/case-study-hint'), {
        scenario: activeCase.scenario,
        question: activeCase.questions[0],
      }, { withCredentials: true })
      setHints(prev => ({ ...prev, [activeCase.id]: res.data.hint }))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get hint.')
    } finally {
      setLoadingHint(false)
    }
  }

  const getDifficultyStyle = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-[#DDF3E8] text-[#103B46]'
      case 'Intermediate': return 'bg-[#FEF3C7] text-[#92400E]'
      case 'Advanced': return 'bg-[#FFE4E6] text-[#9F1239]'
      default: return 'bg-[#F7FAF9] text-[#172E35]'
    }
  }

  return (
    <div className="max-w-[1100px] mx-auto">
      <div className="mb-6">
        <h2 className="font-['Lora'] text-2xl font-bold text-[#172E35]">Case Study Assistant</h2>
        <p className="text-xs text-[#718087]">Practice clinical reasoning with realistic nursing scenarios.</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-800 text-sm" role="alert">
          <HiOutlineExclamationCircle className="w-5 h-5" aria-hidden="true" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          {CASE_STUDIES.map((study) => (
            <button
              key={study.id}
              onClick={() => setActiveCase(study)}
              className={`w-full text-left p-4 rounded-xl border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#164E56] ${
                activeCase.id === study.id
                  ? 'bg-white border-[#164E56] shadow-sm'
                  : 'bg-white border-[#E4EBE8] hover:border-[#164E56]/40'
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <h3 className="text-sm font-bold text-[#172E35]">{study.title}</h3>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getDifficultyStyle(study.difficulty)}`}>
                  {study.difficulty}
                </span>
              </div>
              <p className="text-xs text-[#718087] mt-1 truncate">{study.patient}</p>
              <div className="flex items-center gap-1 mt-2 text-[10px] text-[#718087]">
                <HiOutlineClock className="w-3 h-3" aria-hidden="true" />
                {study.time}
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E4EBE8] shadow-sm p-5 sm:p-6">
          <div className="mb-5 pb-4 border-b border-[#E4EBE8]">
            <div className="flex items-center gap-2 mb-1">
              <HiOutlineDocumentText className="w-5 h-5 text-[#164E56]" aria-hidden="true" />
              <h3 className="font-['Lora'] text-lg font-bold text-[#172E35]">{activeCase.title}</h3>
            </div>
            <p className="text-xs text-[#718087]">{activeCase.patient}</p>
          </div>

          <div className="mb-6 p-4 bg-[#F7FAF9] rounded-xl border border-[#E4EBE8]">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wide text-[#172E35]">Scenario</h4>
              <button
                onClick={fetchHint}
                disabled={loadingHint}
                className="flex items-center gap-1 text-[10px] font-bold text-[#164E56] hover:text-[#103B46] disabled:text-[#718087]"
              >
                <HiOutlineLightBulb className="w-3.5 h-3.5" aria-hidden="true" />
                {loadingHint ? 'Getting hint...' : 'Get AI hint'}
              </button>
            </div>
            <p className="text-sm text-[#172E35] leading-relaxed">{activeCase.scenario}</p>
            {hints[activeCase.id] && (
              <div className="mt-3 p-3 bg-[#DDF3E8] rounded-lg text-xs text-[#103B46] leading-relaxed">
                <strong>Hint:</strong> {hints[activeCase.id]}
              </div>
            )}
          </div>

          <div className="space-y-5">
            {activeCase.questions.map((question, idx) => (
              <div key={idx}>
                <label htmlFor={`q-${activeCase.id}-${idx}`} className="block text-sm font-semibold text-[#172E35] mb-1.5">
                  {idx + 1}. {question}
                </label>
                <textarea
                  id={`q-${activeCase.id}-${idx}`}
                  rows={4}
                  value={answers[`${activeCase.id}-${idx}`] || ''}
                  onChange={(e) => handleAnswerChange(idx, e.target.value)}
                  disabled={submitted[activeCase.id]}
                  placeholder="Type your clinical reasoning here..."
                  className="w-full px-4 py-3 bg-[#F7FAF9] border border-[#E4EBE8] rounded-xl text-sm text-[#172E35] placeholder:text-[#718087] focus:outline-none focus:ring-2 focus:ring-[#164E56] focus:border-transparent disabled:bg-[#F7FAF9]/70"
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSubmit}
              disabled={submitted[activeCase.id]}
              className="px-5 py-2.5 bg-[#164E56] hover:bg-[#103B46] disabled:bg-[#E4EBE8] text-white text-sm font-bold rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#164E56]"
            >
              <HiOutlineCheckCircle className="inline mr-1.5" aria-hidden="true" />
              {submitted[activeCase.id] ? 'Submitted' : 'Submit Answers'}
            </button>
            {submitted[activeCase.id] && (
              <div className="flex items-center gap-2 text-sm text-[#42A889] bg-[#DDF3E8] px-4 py-2 rounded-xl">
                <HiOutlineLightBulb aria-hidden="true" />
                <span>Instructor feedback will be provided shortly.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CaseStudyAssistant
