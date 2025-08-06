import React from 'react'
import { InterviewCardProps } from '@/types/interview'
import { getLogo } from '@/lib/utils'
import Image from 'next/image'

const InterviewCard = async ({interview}:InterviewCardProps) => {
  // const res = await getLogo(interview.companyName)
  return (
    <div className='border-2 border-black rounded-xl bg-gray-50 m-4 p-2 flex flex-row gap-4 w-[25vw] h-[200px]'>
      <div className='w-[65px] h-[65px] rounded-full overflow-hidden flex flex-col items-center justify-center'>
        <Image src='https://picsum.photos/200/300' alt='logo' width={100} height={100} className=''/>
      </div>
      <div className='flex flex-col'>
        <span className='text-xl font-semibold'> {interview.companyName}</span>

      </div>
      
    </div>
  )
}

export default InterviewCard
