import { auth } from "../auth"
import Createform from "./form"

const page = async () => {


  return (
    <div className='flex flex-col gap-5 mx-22 mt-4'>
      <div className=''>
        <span className='bg-gradient-to-r from-red-500 to-blue-500 text-transparent bg-clip-text font-extrabold text-3xl'>Create a new interview</span>
      </div>
      <div className=''>
       <Createform />
      </div>
    </div>
  )
}

export default page
