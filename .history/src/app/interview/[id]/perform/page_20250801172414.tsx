import { useParams } from 'next/navigation'
import React from 'react'
import { getInterviewDetails } from './actions'

interface PageProps {
  params: Promise<{ id: string }>
}

const page = async ({params}:PageProps) => {
  const id = (await params).id as string
  console.log(id)

  const interview = await getInterviewDetails(id)
  console.log(interview)
  return (
    <div className='flex flex-col'>
      <div className='border-2 border-black mx-22 mt-3'>

      </div>
    </div>
  )
}

export default page
