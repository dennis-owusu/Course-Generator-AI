import React from 'react'
import { Button } from '@/components/ui/button'

const TopicDescription = ({ setActiveIndex, setFormData, formData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  return (
    <div className="mt-10 max-w-4xl mx-auto">
      <h3 className="text-2xl font-medium mb-6">Course Topic & Description</h3>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium mb-2">Course Topic</label>
          <input
            type="text"
            id="topic"
            name="topic"
            value={formData.topic || ''}
            onChange={handleChange}
            placeholder="e.g., JavaScript Fundamentals, Digital Marketing, Data Science"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">Brief Description (Optional)</label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            placeholder="Describe what you want to learn or teach in this course"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary h-32"
          />
        </div>

        <div>
          <label htmlFor="estimatedDuration" className="block text-sm font-medium mb-2">Estimated Duration (hours)</label>
          <input
            type="number"
            id="estimatedDuration"
            name="estimatedDuration"
            value={formData.estimatedDuration || ''}
            onChange={handleChange}
            min="1"
            max="100"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div>
          <label htmlFor="chapterCount" className="block text-sm font-medium mb-2">Number of Chapters</label>
          <input
            type="number"
            id="chapterCount"
            name="chapterCount"
            value={formData.chapterCount || ''}
            onChange={handleChange}
            min="1"
            max="20"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
            placeholder="How many chapters do you want in your course?"
          />
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <Button 
          onClick={() => setActiveIndex(0)}
          variant="outline"
          className="px-6"
        >
          Back
        </Button>
        <Button 
          onClick={() => setActiveIndex(2)} 
          disabled={!formData.topic || !formData.estimatedDuration || !formData.chapterCount}
          className="px-6"
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export default TopicDescription
