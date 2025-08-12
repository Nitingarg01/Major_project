import Image from "next/image";
// import { useSession } from "next-auth/react";
import { auth } from "@/app/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IoMdAdd } from "react-icons/io";
import Link from "next/link";
import { getUserInterviews } from "./actions";
import InterviewCard from "@/components/InterviewCard";

export default async function Home() {

  const session = await auth();
  // console.log(session)
  if (!session?.user) {
    redirect('/login')
  }

  const interviews = await getUserInterviews()

  if(!interviews){
    return <>Loading...</>
  }

  return (
    <div className="flex flex-row gap-2 w-full">
      <div className="border-2 border-red-400">
        hi
      </div>

      <div className=" mx-22 flex flex-col gap-3 mt-4">
        <div>
          <span className="bg-gradient-to-r from-red-500 to-blue-500 text-transparent bg-clip-text font-extrabold text-3xl">Practice for Interviews and Ace the real ones.</span>
        </div>
        
    
        <div className="border-2 border-black">
           <div className="flex flex-row-reverse mr-10">
          <Button variant="default" className="px-4">
            <Link href='/create' className="flex flex-row gap-2">
              <IoMdAdd className="mt-[1.5px]" />Create New
            </Link>
          </Button>
        </div>
        <div className="flex flex-wrap">
          {interviews.map((interview,index)=><InterviewCard interview={interview} key={index}/>)}
        </div>
        </div>
       
      </div>
    </div>
  );
}
