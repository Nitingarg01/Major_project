import React from 'react';
import { getInterviewDetails, getQuestions } from './actions';
import NewInterviewWrapper from '@/components/NewInterviewWrapper';
import { auth } from '@/app/auth';
import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>
}

function capitalizeFirstWord(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const page = async ({ params }: PageProps) => {
  const session = await auth();
  if(!session?.user){
    redirect('/login');
  }

  const id = (await params).id as string;
  console.log('Interview ID:', id)

  const interview = await getInterviewDetails(id);
  const det = await getQuestions(id);

  if (!interview) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Interview Not Found</h1>
          <p className="text-gray-600">The requested interview could not be found.</p>
        </div>
      </div>
    )
  }

  if (!det?.questions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-yellow-600 mb-4">Preparing Interview</h1>
          <p className="text-gray-600">Questions are being generated. Please wait...</p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50'>
      <div className=' mx-4 mt-3 p-1 flex flex-col '>
        <div className='flex flex-col gap-1'>
          <div className='flex flex-row justify-center gap-2 mb-4'>
            <span className='bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text font-extrabold text-4xl'>Enhanced AI Interview</span>
            <span className='mt-3 font-semibold text-gray-700'>({interview?.jobTitle} at {capitalizeFirstWord(interview?.companyName)})</span>
          </div>

          <div className='flex flex-row justify-center'>
            <div className='w-full max-w-7xl'>
              <NewInterviewWrapper 
                questions={det.questions} 
                id={id}
                interviewType={interview?.interviewType}
                companyName={interview?.companyName}
                jobTitle={interview?.jobTitle}
                experienceLevel={interview?.experienceLevel || 'mid'}
                skills={interview?.skills || []}
                userSelectedRounds={interview?.selectedRounds || ['technical', 'behavioral', 'dsa', 'aptitude']}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page;