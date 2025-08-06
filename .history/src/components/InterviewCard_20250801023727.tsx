import React from 'react'
import { InterviewCardProps } from '@/types/interview'
import { getLogo } from '@/lib/utils'
import Image from 'next/image'

const InterviewCard = async ({interview}:InterviewCardProps) => {
  // const res = await getLogo(interview.companyName)
  return (
    <div className='border-2 border-black rounded-xl bg-gray-50 m-4 p-2 flex flex-row'>
      <div className=''>
        <Image src='https://picsum.photos/200/300' alt='logo' width={100} height={100} className='roundec-full'/>
      </div>
      
    </div>
  )
}

export default InterviewCard
