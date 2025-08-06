import { useParams } from 'next/navigation'
import React from 'react'

interface PageProps {
  params: { id: string }
}

const page = ({params}:PageProps) => {
  const id = params.id

  return (
    <div className='flex flex-col'>
      <div className='border-2 border-black mx-22 mt-3'>

      </div>
    </div>
  )
}

export default page
