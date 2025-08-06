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

const InterviewCard = (interview) => {
  return (
    <div>
      this card will be designed to display the interview taken by the user individual.
    </div>
  )
}

export default InterviewCard
