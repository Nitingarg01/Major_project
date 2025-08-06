import { useParams } from 'next/navigation'
import React from 'react'

const page = () => {
  const params = useParams()
  const id = params.id as string
  console.log(id)
  return (
    <div className='flex flex-col'>
      <div className='border-2 border-black mx-22 mt-3'>

      </div>
    </div>
  )
}

export default page
