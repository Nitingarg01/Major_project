import { useParams } from 'next/navigation'
import React from 'react'
import { getInterviewDetails } from './actions'

import CameraFeed from '@/components/CameraFeed';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { questions } from '@/constants/constants';
import { Textarea } from "@/components/ui/textarea"
import { Button } from '@/components/ui/button';
import QuestionAns from '@/components/QuestionAns';

interface PageProps {
  params: Promise<{ id: string }>
}

function capitalizeFirstWord(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
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
          <div className='flex flex-row justify-center gap-2'>
            <span className='bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text font-extrabold text-4xl'>Mock Interview </span>
            <span className='mt-3 font-semibold'>(Position- {interview?.jobTitle}, Company- {capitalizeFirstWord(interview?.companyName)})</span>
          </div>
          {/* <div className='flex flex-col'>
            <span className='font-semibold'>Position : {interview?.jobTitle}</span>
            <span className='font-semibold'>Company : {interview?.companyName}</span>
          </div> */}

          <div className='flex flex-row justify-center'>
            <div className='border-2 bg-gray-50 rounded-lg w-[80%] flex flex-col items-center p-2' >
               <CameraFeed />
               <QuestionAns questions={questions}/>
            
              <Button variant='default' className='mt-2'>Submit Answer</Button>
            </div>
           
          </div>


        </div>
      </div>
    </div>
  )
}

export default page
