import { useParams } from 'next/navigation'
import React from 'react'
import { getInterviewDetails } from './actions'

import CameraFeed from '@/components/CameraFeed';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { questions } from '@/constants/constants';
import { Textarea } from "@/components/ui/textarea"
import { Button } from '@/components/ui/button';

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
          <div className='flex flex-row justify-center gap-2'>
            <span className='bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text font-extrabold text-4xl'>Mock Interview </span>
            <span className='mt-3 font-semibold'>(Position-{interview?.jobTitle}, Comapny - {interview?.companyName})</span>
          </div>
          {/* <div className='flex flex-col'>
            <span className='font-semibold'>Position : {interview?.jobTitle}</span>
            <span className='font-semibold'>Company : {interview?.companyName}</span>
          </div> */}

          <div className='flex flex-row justify-center'>
            <div className='border-2 bg-gray-50 rounded-lg w-[80%] flex flex-col items-center p-2' >
              <div className='flex w-full flex-col gap-6'>
                <Tabs defaultValue='0'>
                  <TabsList className='flex flex-row gap-3'>
                    {questions.map((ques, index) => <TabsTrigger value={index.toString()} key={index}>Question {index + 1}</TabsTrigger>)}
                  </TabsList>

                  <div className='border-2 border-black h-[15vh]'>
                     {questions.map((ques, index) => {
                    return (
                      <TabsContent value={index.toString()} className='flex flex-col gap-2' key={index}>
                        <span>
                          {ques.question}
                        </span>
                      </TabsContent>
                    )
                  })}
                  </div>

                 
                </Tabs>
              </div>
              <CameraFeed />
              <div className='w-full mt-2 flex flex-row justify-center items-center '>
                 <Textarea className='h-[12vh]' placeholder='Your answer here!'/>
              </div>
              <Button variant='default' className='mt-2'>Submit Answer</Button>
            </div>
           
          </div>


        </div>
      </div>
    </div>
  )
}

export default page
