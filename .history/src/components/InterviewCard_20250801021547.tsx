import React from 'react'
import { InterviewCardProps } from '@/types/interview'

const InterviewCard = ({interview}:InterviewCardProps) => {
  console.log(interview.companyName)
  return (
    <div>
      {interview.companyName}
      
    </div>
  )
}

export default InterviewCard
