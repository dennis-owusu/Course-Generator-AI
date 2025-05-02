import React from 'react'
import { Button } from '@/components/ui/button'

const SelectOption = ({ setActiveIndex, setFormData, formData, handleSubmit }) => {
  const levels = ['Beginner', 'Intermediate', 'Advanced']
  const learningGoals = ['Career', 'Academic', 'Personal']

  const handleLevelSelect = (level) => {
    setFormData({ ...formData, level })
  }

  const handleGoalSelect = (learningGoal) => {
    setFormData({ ...formData, learningGoal })
  }

  return (
    <div className="mt-10 max-w-4xl mx-auto">
      <h3 className="text-2xl font-semibold text-indigo-900 mb-6">Course Options</h3>
      
      <div className="space-y-8">
        <div>
          <h4 className="text-lg font-medium text-indigo-900 mb-3">Difficulty Level</h4>
          <div className="flex flex-wrap gap-3">
            {levels.map((level) => (
              <div
                key={level}
                className={`border border-indigo-200 px-6 py-3 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-md ${
                  formData.level === level ? 'bg-indigo-50 border-indigo-600 text-indigo-900' : 'bg-white text-indigo-700'
                }`}
                onClick={() => handleLevelSelect(level)}
              >
                {level}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-medium text-indigo-900 mb-3">Learning Goal</h4>
          <div className="flex flex-wrap gap-3">
            {learningGoals.map((goal) => (
              <div
                key={goal}
                className={`border border-indigo-200 px-6 py-3 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-md ${
                  formData.learningGoal === goal ? 'bg-indigo-50 border-indigo-600 text-indigo-900' : 'bg-white text-indigo-700'
                }`}
                onClick={() => handleGoalSelect(goal)}
              >
                {goal}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <Button
          onClick={() => setActiveIndex(1)}
          className="px-6 py-2 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all duration-300"
        >
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!formData.level || !formData.learningGoal}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-300 disabled:bg-indigo-300 disabled:cursor-not-allowed"
        >
          Generate Course
        </Button>
      </div>
    </div>
  )
}

export default SelectOption