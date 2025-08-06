import { useParams } from 'next/navigation'
import React from 'react'
import { getInterviewDetails } from './actions'
import { VideoOff } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>
}

const page = async ({ params }: PageProps) => {
  const id = (await params).id as string
  console.log(id)

  const interview = await getInterviewDetails(id)
  console.log(interview)
  return (
    <div className='flex flex-col'>
      <div className=' mx-22 mt-3 p-1 flex flex-col '>
        <div className='flex flex-col gap-1'>
          <div className='flex flex-row justify-center'>
            <span className='bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text font-extrabold text-4xl'>Mock Interview </span>
          </div>
          <div className='flex flex-col'>
            <span className='font-semibold'>Position : {interview?.jobTitle}</span>
            <span className='font-semibold'>Company : {interview?.companyName}</span>
          </div>
          <div className='flex flex-row justify-center'>
            <div className='border-2 bg-gray-50 rounded-lg w-[80%] flex flex-col items-center' >
              <div className='h-[5300px] w-[300px] border-2 border-black'>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default page
