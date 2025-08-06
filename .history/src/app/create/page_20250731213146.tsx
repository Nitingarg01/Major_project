import form from "./form"

const page = () => {
  return (
    <div className='flex flex-col gap-5 mx-22 mt-4'>
      <div className=''>
        <span className='bg-gradient-to-r from-black to-blue-500 text-transparent bg-clip-text font-extrabold text-3xl'>Create a new interview</span>
      </div>
      <div className='border-2'>
       <form/>
      </div>
    </div>
  )
}

export default page
