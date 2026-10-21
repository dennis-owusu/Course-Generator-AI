import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { getApiUrl } from '../lib/api-config'
import { HiOutlinePaperAirplane, HiOutlineSparkles, HiOutlineLightBulb, HiOutlineClipboardDocument, HiOutlineExclamationCircle } from 'react-icons/hi2'

const SUGGESTIONS = [
  'Explain the nursing process',
  'Common side effects of metformin',
  'Difference between CPR and BLS',
  'Signs of diabetic ketoacidosis',
]

const AIStudyAssistant = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: 'Hello! I am your AI Nursing Study Assistant. Ask me anything about nursing concepts, clinical skills, pharmacology, or exam preparation.' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (text) => {
    const messageText = text || input
    if (!messageText.trim()) return

    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: messageText.trim() }])
    setInput('')
    setLoading(true)
    setError('')

    try {
      const res = await axios.post(getApiUrl('/api/ai-assistant/ask'), { message: messageText.trim() }, { withCredentials: true })
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: res.data.reply }])
    } catch (err) {
      console.error('AI assistant error:', err)
      setError(err.response?.data?.message || 'Failed to get a response.')
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: 'Sorry, I could not reach the AI service. Please try again later.',
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleSend()
  }

  return (
    <div className="max-w-[1100px] mx-auto h-[calc(100vh-140px)] flex flex-col">
      <div className="mb-5">
        <h2 className="font-['Lora'] text-2xl font-bold text-[#172E35]">AI Study Assistant</h2>
        <p className="text-xs text-[#718087]">Ask nursing questions, get explanations, mnemonics, and quiz practice.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-800 text-sm" role="alert">
          <HiOutlineExclamationCircle className="w-5 h-5" aria-hidden="true" />
          {error}
        </div>
      )}

      <div className="flex-1 bg-white rounded-2xl border border-[#E4EBE8] shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#E4EBE8] flex items-center gap-3 bg-[#F7FAF9]">
          <div className="w-10 h-10 rounded-full bg-[#103B46] flex items-center justify-center">
            <HiOutlineSparkles className="w-5 h-5 text-[#E8B95D]" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#172E35]">NurseHub AI Tutor</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#42A889] animate-pulse" aria-hidden="true" />
              <span className="text-[11px] text-[#718087]">Online</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-white">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#164E56] text-white rounded-br-md'
                  : 'bg-[#F7FAF9] text-[#172E35] border border-[#E4EBE8] rounded-bl-md'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-[#F7FAF9] border border-[#E4EBE8]">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#718087] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#718087] animate-bounce [animation-delay:0.1s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#718087] animate-bounce [animation-delay:0.2s]" />
                </span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t border-[#E4EBE8] bg-white">
          <div className="flex flex-wrap gap-2 mb-3">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F7FAF9] hover:bg-[#DDF3E8] border border-[#E4EBE8] rounded-lg text-[11px] text-[#172E35] transition-colors"
              >
                <HiOutlineLightBulb className="w-3.5 h-3.5 text-[#42A889]" aria-hidden="true" />
                {s}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your nursing question..."
              disabled={loading}
              className="flex-1 px-4 py-3 bg-[#F7FAF9] border border-[#E4EBE8] rounded-xl text-sm text-[#172E35] placeholder:text-[#718087] focus:outline-none focus:ring-2 focus:ring-[#164E56] focus:border-transparent disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-3 rounded-xl bg-[#164E56] hover:bg-[#103B46] disabled:bg-[#E4EBE8] disabled:text-[#718087] text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#164E56]"
              aria-label="Send message"
            >
              <HiOutlinePaperAirplane className="w-5 h-5" aria-hidden="true" />
            </button>
          </form>
          <p className="text-[10px] text-[#718087] mt-2 flex items-center gap-1">
            <HiOutlineClipboardDocument className="w-3 h-3" aria-hidden="true" />
            AI responses are for study support. Always verify clinical decisions with instructors and protocols.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AIStudyAssistant
