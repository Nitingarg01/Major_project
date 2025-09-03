import React from 'react'
import { getInterviewDetails, getQuestions } from '../perform/actions'
import FeedbackAccordion from '@/components/FeedbackAccordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import EnhancedFeedback from '@/components/EnhancedFeedback'
import { auth } from '@/app/auth'
import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}


const page = async ({ params }: PageProps) => {

  
    const session = await auth()
    if(!session?.user){
      redirect('/login')
    }
  

  const id = (await params).id as string
  console.log("feedback", id)

  const interview = await getInterviewDetails(id)
  const det = await getQuestions(id)



  const arr = det?.extracted?.parameterScores || {}
  console.log(det)

  const labels = Object.keys(arr) as string[]
  const data = Object.values(arr) as number[]
  console.log(data,labels)

  if(!det || !det.extracted){
    return (
      <div className='flex flex-col gap-2 font-semibold text-2xl items-center justify-center min-h-[50vh]'>
        <div className='bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text'>
          <span>🔄 Generating Your Detailed Feedback...</span>
        </div>
        <span className='text-lg text-gray-600'>Please refresh the page in a few moments</span>
        <div className='mt-4 text-sm text-gray-500'>
          <p>Our AI is analyzing your interview performance</p>
          <p>This usually takes 30-60 seconds</p>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col'>
      <div className='flex flex-col mx-18 p-2 mt-3 gap-6'>
        <div className='flex flex-col'>
          <span className='bg-gradient-to-r from-orange-500 to-blue-500 text-transparent bg-clip-text font-extrabold text-4xl'>Your Feedback for </span>
          <span className='text-xl text-gray-500'>{interview?.jobTitle} Role at {interview?.companyName}</span>
        </div>
        <div className={`${det?.extracted?.overallScore < 3 ? 'bg-red-400' : det?.extracted?.overallScore < 7 ? 'bg-yellow-200' : 'bg-green-300'} w-[18vw] p-1 rounded-md`}>
          <span className='text-2xl font-semibold'>Overall Score: {det?.extracted?.overallScore} / 10</span>
        </div>

        <div className='flex flex-row w-full'>
          {/* <div className='w-[50%]'>
            <FeedbackAccordion advice={det?.extracted?.adviceForImprovement}/>
          </div>

           <div className='w-[50%]'>
second
          </div> */}
          <Tabs defaultValue='visual' className='w-full ' color='black' >
            <TabsList className='w-full flex flex-row gap-2'>
              <TabsTrigger value="visual">Visual Feedback</TabsTrigger>
              <TabsTrigger value="question">Question Wise Feedback</TabsTrigger>
            </TabsList>
            <TabsContent value="visual" className='flex flex-col gap-5'>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <span className="text-lg">
                  <span className='font-semibold text-blue-800'>Overall Verdict:</span> 
                  <span className="text-blue-700 ml-2">{det?.extracted?.overallVerdict}</span>
                </span>
              </div>
              <EnhancedFeedback 
                data={data} 
                labels={labels}
                overallScore={det?.extracted?.overallScore || 0}
              />
            </TabsContent>
            <TabsContent value="question"><FeedbackAccordion advice={det?.extracted?.adviceForImprovement}/></TabsContent>
          </Tabs>

        </div>
      </div>
    </div>
  )
}

export default page
