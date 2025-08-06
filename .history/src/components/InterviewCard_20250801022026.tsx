import React from 'react'
import { InterviewCardProps } from '@/types/interview'

const InterviewCard = async ({interview}:InterviewCardProps) => {
  
  return (
    <div>
      {interview.companyName}
      
    </div>
  )
}

export default InterviewCard
