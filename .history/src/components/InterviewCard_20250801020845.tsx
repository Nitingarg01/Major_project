import React from 'react'

interface Interview  {
  _id: Object;
  userId: string;
  jobDesc: string;
  skills: string[];
  companyName: string;
  projectContext: string[];
  workExDetails: string[];
}
interface InterviewCardProps {
  interview: Interview;
}

const InterviewCard = (interview:InterviewCardProps) => {
  console.log(interview)
  return (
    <div>
      
      
    </div>
  )
}

export default InterviewCard
