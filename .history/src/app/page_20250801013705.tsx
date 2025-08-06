import Image from "next/image";
// import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import { auth } from "@/app/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IoMdAdd } from "react-icons/io";
import Link from "next/link";
import { useEffect } from "react";
import { getUserInterviews } from "./create/actions";

export default async function Home() {

  const session = await auth();
  // console.log(session)
  if (!session?.user) {
    redirect('/login')
  }

  useEffect(()=>{
    const getAll = async ()=>{
      const res = await getUserInterviews();
      console.log(res)
    }
    getAll()
  },[])

  return (
    <div className="flex flex-col gap-5">

      <div className=" mx-22 flex flex-col gap-3 mt-4">
        <div>
          <span className="bg-gradient-to-r from-red-500 to-blue-500 text-transparent bg-clip-text font-extrabold text-3xl">Practice for Interviews and Ace the real ones.</span>
        </div>
        <div className="flex flex-row-reverse mr-10">
          <Button variant="default" className="px-4">
            <Link href='/create' className="flex flex-row gap-2">
              <IoMdAdd className="mt-[1.5px]" />Create New
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
