import React from 'react'
import { InterviewCardProps } from '@/types/interview'
import { getLogo } from '@/lib/utils'

const InterviewCard = async ({interview}:InterviewCardProps) => {
  // const res = await getLogo(interview.companyName)
  return (
    <div className='border-2 border-black rounded-xl bg-gray-50 m-4 p-2'>
      <span>{interview.companyName}</span>
    </div>
  )
}

export default InterviewCard
