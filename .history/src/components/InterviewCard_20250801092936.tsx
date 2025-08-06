import React from 'react'
import { InterviewCardProps } from '@/types/interview'
import { getLogo } from '@/lib/utils'
import Image from 'next/image'

function capitalizeFirstWord(str:string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const InterviewCard = async ({ interview }: InterviewCardProps) => {
  const res = await getLogo(interview.companyName)
  const image = res?.image || 'https://picsum.photos/200/300'
  return (
   
      <div className='flex flex-col mt-2 ml-3'>
        <span className='text-xl font-bold'> {capitalizeFirstWord(interview.companyName)}</span>
        <span className='text-md'>{interview.jobTitle}</span>
        <span className='text-md font-semibold'>Skills : </span>
      </div>
  )
}

export default InterviewCard
