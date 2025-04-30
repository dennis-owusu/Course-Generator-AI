
import React from 'react'
import { UserButton } from '@clerk/clerk-react'

const Header = () => {
  return (
    <div>
        <header className="bg-white border-b-1 border-gray-100">
  <div className="mx-auto max-w-screen-xl sm:px-6 lg:px-8">
    <div className="flex gap-4 flex-row items-center justify-between">
      <div>
        <img className='w-16 h-16' src="/logo.png" alt="" />
      </div>

      <div className="flex items-center gap-4">
          <UserButton/>

      </div>
    </div>
  </div>
</header>
    </div>
  )
}

export default Header