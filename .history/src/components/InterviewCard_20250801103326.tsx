import React from 'react'
import { InterviewCardProps } from '@/types/interview'
import { getLogo } from '@/lib/utils'
import Image from 'next/image'
import { Badge } from "@/components/ui/badge"
import { Button } from './ui/button'
import { FileText } from 'lucide-react';
import { MessageCircleCode } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Link from 'next/link'

function capitalizeFirstWord(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const InterviewCard = async ({ interview }: InterviewCardProps) => {
  const res = await getLogo(interview.companyName)
  const image = res?.image || 'https://picsum.photos/200/300'
  return (
    <div className='border-2 border-black rounded-sm bg-gray-50 m-4 p-2 flex flex-row gap-4 w-[25vw] '>


      <div className='flex flex-col mt-2 ml-3 gap-3'>
        <div className='flex flex-col'>
          <span className='text-xl font-bold'> {capitalizeFirstWord(interview.companyName)}</span>
          <span className='text-md'>{interview.jobTitle}</span>
        </div>
        <div className='flex flex-wrap gap-2'>
          <span className='text-md font-semibold'>Skills :</span>
          <div className='flex flex-wrap gap-2'>{interview.skills.map((skill)=><Badge variant='outline' key={skill}>{skill}</Badge>)}</div>
        </div>
        <div className='flex flex-row-reverse gap-3 mr-2'>
          <Link href={`/interview/${interview._id}/feedback`}>
           <Tooltip>
            <TooltipTrigger><FileText className='cursor-pointer'/></TooltipTrigger>
            <TooltipContent>View Feedback</TooltipContent>
          </Tooltip>
          </Link>
         
         
          <Tooltip>
            <TooltipTrigger><MessageCircleCode className='cursor-pointer'/></TooltipTrigger>
            <TooltipContent>Give Interview</TooltipContent>
          </Tooltip>
            
            
          
        </div>

      </div>

    </div>
  )
}

export default InterviewCard
