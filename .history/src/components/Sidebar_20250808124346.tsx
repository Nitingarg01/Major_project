import React from 'react'
import { MessageCircleQuestion } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

const Sidebar = () => {
  return (
    <div className='w-full'>
      <div className='flex flex-col items-center'>
        
        <div className='flex flex-col items-center mt-10'>
            <span className='bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text font-extrabold text-4xl '>You have</span>
            <span className='text-7xl'>2</span>
            <span className='text-2xl flex flex-row gap-2'>Inteviews Left</span>
             <Tooltip>
            <TooltipTrigger> <span className='italic text-sm hover:text-blue-400'>more</span></TooltipTrigger>
            <TooltipContent>View Feedback</TooltipContent>
          </Tooltip>
           
        </div>

      </div>
    </div>
  )
}

export default Sidebar
