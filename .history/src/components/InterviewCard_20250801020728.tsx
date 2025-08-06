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

const InterviewCard = (interview:any) => {
  console.log(interview?.userId)
  return (
    <div>
      
      
    </div>
  )
}

export default InterviewCard
