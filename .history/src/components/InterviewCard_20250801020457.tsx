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
  return (
    <div>
      {/* this card will be designed to display the interview taken by the user individual. */}
      <span>{interview.projectContext[0]}</span>
    </div>
  )
}

export default InterviewCard
