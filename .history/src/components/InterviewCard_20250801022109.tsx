import React from 'react'
import { InterviewCardProps } from '@/types/interview'
import { getLogo } from '@/lib/utils'

const InterviewCard = async ({interview}:InterviewCardProps) => {
  const res = await getLogo(interview.companyName)
  return (
    <div>
      {interview.companyName}
      
    </div>
  )
}

export default InterviewCard
