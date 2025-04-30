import React from 'react'
import { Button } from '@/components/ui/button'

const SelectedCategory = ({ setActiveIndex, setFormData, formData }) => {
  const categories = [
    { id: 1, name: 'Programming & Development', image: '/coding.png' },
    { id: 2, name: 'Design & Creativity', image: '/creative.png' },
    { id: 3, name: 'Health & Wellness', image: '/health.png' },
    { id: 4, name: 'Business & Finance', image: '/creative.png' },
    { id: 5, name: 'Science & Technology', image: '/coding.png' },
    { id: 6, name: 'Languages & Communication', image: '/health.png' },
  ]

  const handleCategorySelect = (category) => {
    setFormData({ ...formData, category: category.name })
  }

  return (
    <div className="mt-10 max-w-4xl mx-auto">
      <h3 className="text-2xl font-medium mb-6">Select a Category</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div 
            key={category.id} 
            className={`border p-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${formData.category === category.name ? 'border-primary bg-primary/10' : 'border-gray-200'}`}
            onClick={() => handleCategorySelect(category)}
          >
            <div className="flex items-center space-x-3">
              <img src={category.image} alt={category.name} className="w-12 h-12 object-cover rounded" />
              <h4 className="font-medium">{category.name}</h4>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-end">
        <Button 
          onClick={() => setActiveIndex(1)} 
          disabled={!formData.category}
          className="px-6"
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export default SelectedCategory
