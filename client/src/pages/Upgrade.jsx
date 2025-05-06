import React from 'react'
import { Button } from '../components/ui/button'

const Upgrade = () => {
  const plans = [
    {
      name: 'Basic',
      price: 'Free',
      features: [
        'Create up to 3 courses',
        'Basic course templates',
        'Standard AI-generated content',
        'Email support',
      ],
      buttonText: 'Current Plan',
      highlighted: false,
      disabled: true
    },
    {
      name: 'Pro',
      price: '$9.99',
      period: 'per month',
      features: [
        'Create unlimited courses',
        'Advanced course templates',
        'Enhanced AI-generated content',
        'Custom quizzes and assessments',
        'Priority email support',
        'Download courses as PDF'
      ],
      buttonText: 'Upgrade Now',
      highlighted: true,
      disabled: false
    },
    {
      name: 'Enterprise',
      price: '$29.99',
      period: 'per month',
      features: [
        'Everything in Pro plan',
        'Team collaboration features',
        'Advanced analytics',
        'White-label options',
        'API access',
        'Dedicated support manager',
        'Custom integrations'
      ],
      buttonText: 'Contact Sales',
      highlighted: false,
      disabled: false
    }
  ]

  return (
    <div className="px-3 sm:mx-6 lg:mx-10 my-4 sm:my-8">
      {/* Header Section */}
      <div className="text-center mb-8 sm:mb-12 animate-fade-in">
        <h2 className="text-2xl sm:text-3xl font-bold text-indigo-900 mb-3 sm:mb-4">Upgrade Your Learning Experience</h2>
        <p className="text-sm sm:text-base text-indigo-700 max-w-2xl mx-auto px-2 sm:px-0">
          Unlock premium features to enhance your learning journey with advanced AI-generated courses, 
          custom assessments, and more.
        </p>
      </div>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-10 sm:mb-16">
        {plans.map((plan, index) => (
          <div 
            key={index} 
            className={`bg-white rounded-2xl overflow-hidden shadow-lg border transition-all ${plan.highlighted 
              ? 'border-indigo-500 transform scale-105 shadow-xl' 
              : 'border-indigo-100 hover:shadow-xl hover:-translate-y-1'}`}
          >
            <div className={`p-4 sm:p-6 ${plan.highlighted ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-900'}`}>
              <h3 className="text-lg sm:text-xl font-bold mb-1">{plan.name}</h3>
              <div className="flex items-end">
                <span className="text-2xl sm:text-3xl font-bold">{plan.price}</span>
                {plan.period && <span className="ml-1 text-xs sm:text-sm opacity-80">{plan.period}</span>}
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <svg 
                      className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500 mr-2 mt-0.5" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    <span className="text-xs sm:text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                disabled={plan.disabled}
                className={`w-full py-2 sm:py-3 text-xs sm:text-sm ${plan.highlighted 
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                  : plan.disabled 
                    ? 'bg-gray-100 text-gray-500' 
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
              >
                {plan.buttonText}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Features Showcase */}
      <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg border border-indigo-100 mb-8 sm:mb-12">
        <h3 className="text-xl sm:text-2xl font-bold text-indigo-900 mb-6 sm:mb-8 text-center">Premium Features</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[
            {
              title: 'Advanced AI Course Generation',
              description: 'Create more sophisticated and detailed courses with our enhanced AI algorithms.',
              icon: '🧠'
            },
            {
              title: 'Custom Assessments',
              description: 'Design personalized quizzes and tests to evaluate learning progress.',
              icon: '📝'
            },
            {
              title: 'Interactive Learning Materials',
              description: 'Access interactive exercises and materials to enhance engagement.',
              icon: '🔄'
            },
            {
              title: 'Progress Analytics',
              description: 'Track learning progress with detailed analytics and insights.',
              icon: '📊'
            },
            {
              title: 'Course Export Options',
              description: 'Export your courses in multiple formats including PDF and SCORM.',
              icon: '📤'
            },
            {
              title: 'Priority Support',
              description: 'Get faster responses and dedicated assistance from our support team.',
              icon: '🛎️'
            }
          ].map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl hover:bg-indigo-50 transition-all">
              <span className="text-3xl sm:text-4xl mb-3 sm:mb-4">{feature.icon}</span>
              <h4 className="text-base sm:text-lg font-semibold text-indigo-900 mb-1 sm:mb-2">{feature.title}</h4>
              <p className="text-xs sm:text-sm text-gray-700">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg border border-indigo-100">
        <h3 className="text-xl sm:text-2xl font-bold text-indigo-900 mb-6 sm:mb-8 text-center">Frequently Asked Questions</h3>
        
        <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto">
          {[
            {
              question: 'How do I upgrade my account?',
              answer: 'Simply select the plan that best fits your needs and click the upgrade button. You\'ll be guided through our secure payment process.'
            },
            {
              question: 'Can I cancel my subscription anytime?',
              answer: 'Yes, you can cancel your subscription at any time. Your premium features will remain active until the end of your billing period.'
            },
            {
              question: 'Is there a free trial for premium plans?',
              answer: 'We offer a 7-day free trial for our Pro plan so you can experience all the premium features before committing.'
            },
            {
              question: 'What payment methods do you accept?',
              answer: 'We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.'
            }
          ].map((faq, index) => (
            <div key={index} className="border-b border-indigo-100 pb-3 sm:pb-4">
              <h4 className="text-base sm:text-lg font-semibold text-indigo-900 mb-1 sm:mb-2">{faq.question}</h4>
              <p className="text-xs sm:text-sm text-gray-700">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Upgrade