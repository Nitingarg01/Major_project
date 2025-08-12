import React from 'react'
import { CircleQuestion } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className='w-full'>
      <div className='flex flex-col items-center'>
        
        <div className='flex flex-col items-center mt-10'>
            <span className='font-mono font-bold text-4xl '>You have</span>
            <span className='text-7xl'>2</span>
            <span className='text-2xl'>Inteviews Left  <CircleQuestion/></span>
        </div>

      </div>
    </div>
  )
}

export default Sidebar
