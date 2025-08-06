import React from 'react'
import { InterviewCardProps } from '@/types/interview'
import { getLogo } from '@/lib/utils'
import Image from 'next/image'

const InterviewCard = async ({ interview }: InterviewCardProps) => {
  const res = await getLogo(interview.companyName)
  const image = res?.image || 'https://picsum.photos/200/300'
  return (
    <div className='border-2 border-black rounded-sm bg-gray-50 m-4 p-2 flex flex-row gap-4 w-[25vw] h-[200px]'>
      <div className='h-full flex flex-col mt-3'>
        <div className='w-[65px] h-[65px] rounded-full overflow-hidden '>
          <Image src={image} alt='logo' width={100} height={100} className='' />
        </div>
      </div>

      <div className='flex flex-col mt-2'>
        <span className='text-xl font-bold'> {interview.companyName}</span>

      </div>

    </div>
  )
}

export default InterviewCard
