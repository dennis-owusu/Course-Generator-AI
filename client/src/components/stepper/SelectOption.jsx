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
      <h3 className="text-2xl font-medium mb-6">Course Options</h3>
      
      <div className="space-y-8">
        <div>
          <h4 className="text-lg font-medium mb-3">Difficulty Level</h4>
          <div className="flex flex-wrap gap-3">
            {levels.map((level) => (
              <div 
                key={level} 
                className={`border px-6 py-3 rounded-lg cursor-pointer transition-all hover:shadow-md ${formData.level === level ? 'border-primary bg-primary/10' : 'border-gray-200'}`}
                onClick={() => handleLevelSelect(level)}
              >
                {level}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-medium mb-3">Learning Goal</h4>
          <div className="flex flex-wrap gap-3">
            {learningGoals.map((goal) => (
              <div 
                key={goal} 
                className={`border px-6 py-3 rounded-lg cursor-pointer transition-all hover:shadow-md ${formData.learningGoal === goal ? 'border-primary bg-primary/10' : 'border-gray-200'}`}
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
          variant="outline"
          className="px-6"
        >
          Back
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={!formData.level || !formData.learningGoal}
          className="px-6"
        >
          Generate Course
        </Button>
      </div>
    </div>
  )
}

export default SelectOption
