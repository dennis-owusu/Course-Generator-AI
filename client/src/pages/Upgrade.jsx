import React, { useState } from 'react'
import { Button } from '../components/ui/button'

const FREE_FEATURES = [
  '2 AI courses per month',
  '1 free live class per week',
  'Last 7 days of class recordings',
  'Basic quizzes & simple progress tracking',
  'Community study groups',
]

const PRO_FEATURES = [
  'Unlimited AI courses + unlimited homework help',
  'File uploads — assignment instructions, notes, or a photo of a question',
  'Photo-to-Answer — snap any question or past paper, AI solves it step by step',
  'Exam Countdown Mode — daily AI study plan before your exam, WhatsApp reminders',
  'Full recording library, forever',
  'Mock Exam Simulator — timed tests, grading, weak-topic report',
  'AI builds a course for your weak areas after each mock exam',
  'Voice-note questions — record your question, AI answers',
  'Priority help from the human tutor',
  'Weekly Quiz Competition — top 10 win free PRO',
  'Points, badges & leaderboard',
  'Learn-at-Your-Level — JHS or SHS explanations, instantly',
  'Offline Study Packs — download any course as PDF',
]

const CheckIcon = () => (
  <svg className="h-4 w-4 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
)

const XIcon = () => (
  <svg className="h-4 w-4 text-gray-300 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const FeatureRow = ({ label, included }) => (
  <li className={`flex items-start text-sm ${included ? 'text-gray-700' : 'text-gray-400'}`}>
    {included ? <CheckIcon /> : <XIcon />}
    <span>{label}</span>
  </li>
)

const Upgrade = () => {
  const [paymentMethod, setPaymentMethod] = useState('momo')
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    // Payment integration point — connect to MoMo / Paystack checkout here
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-indigo-900 mb-3">Learn Without Limits</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Free forever for the basics. Go PRO for unlimited AI help, mock exams,
            and exam-day confidence — pay easily with Mobile Money.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

          {/* Free */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-indigo-900 mb-1">Free</h2>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-bold text-gray-800">GHS 0</span>
                <span className="text-sm text-gray-500 mb-1">/ month</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Everything you need to start learning</p>
            </div>
            <ul className="space-y-2.5 mb-6 flex-1">
              {FREE_FEATURES.map(f => <FeatureRow key={f} label={f} included={true} />)}
              {PRO_FEATURES.slice(0, 5).map(f => <FeatureRow key={f} label={f} included={false} />)}
              <li className="text-xs text-gray-400 pl-6">+ more with PRO</li>
            </ul>
            <Button disabled className="w-full bg-gray-100 text-gray-400 cursor-default">
              Current Plan
            </Button>
          </div>

          {/* PRO */}
          <div className="bg-white rounded-2xl border-2 border-indigo-600 shadow-lg p-6 flex flex-col relative">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              RECOMMENDED
            </span>
            <div className="mb-5">
              <h2 className="text-xl font-bold text-indigo-900 mb-1">PRO</h2>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-bold text-gray-800">GHS 75</span>
                <span className="text-sm text-gray-500 mb-1">/ month</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Everything in Free, plus:</p>
            </div>
            <ul className="space-y-2.5 mb-6 flex-1">
              {PRO_FEATURES.map(f => <FeatureRow key={f} label={f} included={true} />)}
            </ul>

            {/* Payment method selector */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Pay with</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentMethod('momo')}
                  className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                    paymentMethod === 'momo'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                  }`}
                >
                  Mobile Money
                </button>
                <button
                  onClick={() => setPaymentMethod('paystack')}
                  className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                    paymentMethod === 'paystack'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                  }`}
                >
                  Card (Paystack)
                </button>
              </div>
            </div>

            <Button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3"
            >
              {loading
                ? 'Processing...'
                : `Continue with ${paymentMethod === 'momo' ? 'Mobile Money' : 'Paystack'} — GHS 75/mo`}
            </Button>
            <p className="text-xs text-gray-400 text-center mt-2">Cancel anytime. Secure payment.</p>
          </div>
        </div>

        {/* Note */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 text-center">
          <p className="text-sm text-indigo-800">
            Free includes <strong>2 AI courses per month</strong> and <strong>1 live class per week</strong>.
            PRO removes all limits and unlocks the full exam-prep toolkit for <strong>GHS 75/month</strong>.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Upgrade
