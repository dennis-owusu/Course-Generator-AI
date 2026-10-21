import React, { useState } from 'react'
import { HiOutlineUser, HiOutlineBell, HiOutlineLockClosed, HiOutlineGlobeAlt, HiOutlineCheckCircle } from 'react-icons/hi2'

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: HiOutlineUser },
    { id: 'notifications', label: 'Notifications', icon: HiOutlineBell },
    { id: 'security', label: 'Security', icon: HiOutlineLockClosed },
    { id: 'preferences', label: 'Preferences', icon: HiOutlineGlobeAlt },
  ]

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="mb-6">
        <h2 className="font-['Lora'] text-2xl font-bold text-[#172E35]">Settings</h2>
        <p className="text-xs text-[#718087]">Manage your account, notifications, and learning preferences.</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E4EBE8] shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row border-b border-[#E4EBE8]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center sm:justify-start gap-2 px-5 py-3.5 text-xs font-semibold transition-colors focus:outline-none ${
                activeTab === tab.id
                  ? 'text-[#164E56] border-b-2 border-[#164E56] bg-[#F7FAF9]'
                  : 'text-[#718087] hover:text-[#172E35] hover:bg-[#F7FAF9]'
              }`}
            >
              <tab.icon className="w-4 h-4" aria-hidden="true" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5 sm:p-6">
          {activeTab === 'profile' && (
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-semibold text-[#172E35] mb-1.5">Full Name</label>
                <input type="text" defaultValue="Ama Mensah" className="w-full px-3.5 py-2.5 bg-[#F7FAF9] border border-[#E4EBE8] rounded-xl text-sm text-[#172E35] focus:outline-none focus:ring-2 focus:ring-[#164E56]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#172E35] mb-1.5">Email</label>
                <input type="email" defaultValue="ama.mensah@nursehub.edu.gh" className="w-full px-3.5 py-2.5 bg-[#F7FAF9] border border-[#E4EBE8] rounded-xl text-sm text-[#172E35] focus:outline-none focus:ring-2 focus:ring-[#164E56]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#172E35] mb-1.5">Program</label>
                <select className="w-full px-3.5 py-2.5 bg-[#F7FAF9] border border-[#E4EBE8] rounded-xl text-sm text-[#172E35] focus:outline-none focus:ring-2 focus:ring-[#164E56]">
                  <option>Registered General Nursing (RGN)</option>
                  <option>Midwifery</option>
                  <option>Community Health Nursing</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-3 max-w-lg">
              {[
                'Email me about upcoming clinical sessions',
                'Notify me when assignments are graded',
                'Weekly study reminder notifications',
                'Leaderboard and achievement updates',
              ].map((label, i) => (
                <label key={i} className="flex items-center gap-3 p-3 rounded-xl border border-[#E4EBE8] cursor-pointer hover:bg-[#F7FAF9]">
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#164E56]" />
                  <span className="text-sm text-[#172E35]">{label}</span>
                </label>
              ))}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-semibold text-[#172E35] mb-1.5">Current Password</label>
                <input type="password" className="w-full px-3.5 py-2.5 bg-[#F7FAF9] border border-[#E4EBE8] rounded-xl text-sm text-[#172E35] focus:outline-none focus:ring-2 focus:ring-[#164E56]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#172E35] mb-1.5">New Password</label>
                <input type="password" className="w-full px-3.5 py-2.5 bg-[#F7FAF9] border border-[#E4EBE8] rounded-xl text-sm text-[#172E35] focus:outline-none focus:ring-2 focus:ring-[#164E56]" />
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-semibold text-[#172E35] mb-1.5">Language</label>
                <select className="w-full px-3.5 py-2.5 bg-[#F7FAF9] border border-[#E4EBE8] rounded-xl text-sm text-[#172E35] focus:outline-none focus:ring-2 focus:ring-[#164E56]">
                  <option>English</option>
                  <option>Twi</option>
                  <option>Ga</option>
                  <option>Ewe</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#172E35] mb-1.5">Study Goal (hours/week)</label>
                <input type="number" defaultValue={12} className="w-full px-3.5 py-2.5 bg-[#F7FAF9] border border-[#E4EBE8] rounded-xl text-sm text-[#172E35] focus:outline-none focus:ring-2 focus:ring-[#164E56]" />
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-[#164E56] hover:bg-[#103B46] text-white text-sm font-bold rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#164E56]"
            >
              {saved ? (
                <span className="flex items-center gap-1.5">
                  <HiOutlineCheckCircle className="w-4 h-4" aria-hidden="true" /> Saved
                </span>
              ) : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
