'use client'
import React, { useEffect, useState } from 'react'
import { MessageCircleQuestion } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Button } from './ui/button';
import Marquee from "react-fast-marquee";
import { inngest } from '@/inngest/client';
import { updateCreds } from '@/app/actions';

const Sidebar = ({credits,id}:{credits:number,id:string}) => {

  const [count,setCount] = useState<number>(credits)

  useEffect(()=>{
    const f = async ()=>{
      const res = await updateCreds(id)
      setCount(res?.newCredits)
    } 
  },[])

  return (
    <div className='w-full'>
      <div className='flex flex-col items-center gap-8'>
        
        <div className='flex flex-col items-center mt-10 gap-3'>
            <span className='bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text font-extrabold text-4xl '>You have</span>
            <span className='text-7xl'>{count}</span>
            <span className='text-2xl flex flex-row gap-2'>Inteviews Left</span>
             <Tooltip>
            <TooltipTrigger> <span className='italic text-sm hover:text-blue-400'>more</span></TooltipTrigger>
            <TooltipContent>Your Free Credits to Practice</TooltipContent>
          </Tooltip>
        </div>

        <Button variant='default'>Buy More Credits</Button>
        <div className='w-[80%]'>
            <Marquee>
                This feature will be available soon.
            </Marquee>
        </div>

      </div>
    </div>
  )
}

export default Sidebar
