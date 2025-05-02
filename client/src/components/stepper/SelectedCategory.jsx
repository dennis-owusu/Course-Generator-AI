import React from 'react'
import { Button } from '@/components/ui/button'

const SelectedCategory = ({ setActiveIndex, setFormData, formData }) => {
  const categories = [
    { id: 1, name: 'Programming & Development', icon: '💻' },
    { id: 2, name: 'Design & Creativity', icon: '🎨' },
    { id: 3, name: 'Health & Wellness', icon: '🧘' },
    { id: 4, name: 'Business & Finance', icon: '💼' },
    { id: 5, name: 'Science & Technology', icon: '🔬' },
    { id: 6, name: 'Languages & Communication', icon: '🌐' },
    { id: 7, name: 'Data Science & Analytics', icon: '📊' },
    { id: 8, name: 'Marketing & Advertising', icon: '📣' },
    { id: 9, name: 'Photography & Videography', icon: '📸' },
    { id: 10, name: 'Music & Audio Production', icon: '🎵' },
    { id: 11, name: 'Writing & Literature', icon: '✍️' },
    { id: 12, name: 'Engineering & Architecture', icon: '🏗️' },
    { id: 13, name: 'Education & Teaching', icon: '📚' },
    { id: 14, name: 'Artificial Intelligence & Machine Learning', icon: '🤖' },
    { id: 15, name: 'Cybersecurity & Networking', icon: '🔒' },
    { id: 16, name: 'Culinary Arts & Cooking', icon: '🍳' },
    { id: 17, name: 'Environmental Science & Sustainability', icon: '🌍' },
    { id: 18, name: 'Psychology & Counseling', icon: '🧠' },
    { id: 19, name: 'Fitness & Sports', icon: '🏋️' },
    { id: 20, name: 'Fashion & Beauty', icon: '👗' },
    { id: 21, name: 'History & Humanities', icon: '🏛️' },
    { id: 22, name: 'Gaming & Esports', icon: '🎮' },
    { id: 23, name: 'Travel & Tourism', icon: '✈️' },
    { id: 24, name: 'Mathematics & Statistics', icon: '📐' },
  ]

  const handleCategorySelect = (category) => {
    setFormData({ ...formData, category: category.name })
  }

  return (
    <div className="mt-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
      <h3 className="text-2xl font-semibold text-indigo-900 mb-6">Select a Category</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`relative bg-white border p-4 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
              formData.category === category.name
                ? 'border-indigo-600 shadow-md'
                : 'border-indigo-200 hover:border-indigo-300'
            }`}
            onClick={() => handleCategorySelect(category)}
          >
            <div
              className={`absolute inset-0 rounded-xl ${
                formData.category === category.name
                  ? 'bg-gradient-to-br from-indigo-50 to-indigo-100 opacity-80'
                  : 'bg-transparent'
              }`}
            ></div>
            <div className="relative flex items-center space-x-3">
              <span
                className={`text-3xl p-2 rounded-full ${
                  formData.category === category.name ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-50 text-indigo-600'
                }`}
              >
                {category.icon}
              </span>
              <h4
                className={`text-base font-semibold ${
                  formData.category === category.name ? 'text-indigo-900' : 'text-indigo-700'
                }`}
              >
                {category.name}
              </h4>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-end">
        <Button
          onClick={() => setActiveIndex(1)}
          disabled={!formData.category}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-300 disabled:bg-indigo-300 disabled:cursor-not-allowed"
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export default SelectedCategory