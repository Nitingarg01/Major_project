import { auth } from "../auth"
import EnhancedInterviewCreationForm from "@/components/EnhancedInterviewCreationForm"

const page = async () => {
  const session = await auth()
  
  if (!session?.user) {
    return <div>Please login to create interviews</div>
  }

  return (
    <div className='flex flex-col gap-5 mx-4 mt-4 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50'>
      <div className=''>
        <span className='bg-gradient-to-r from-red-500 to-blue-500 text-transparent bg-clip-text font-extrabold text-3xl block text-center'>Create Enhanced AI Interview</span>
        <p className="text-center text-gray-600 mt-2">Powered by advanced AI with company research and dynamic difficulty</p>
      </div>
      <div className=''>
       <EnhancedInterviewCreationForm />
      </div>
    </div>
  )
}

export default page