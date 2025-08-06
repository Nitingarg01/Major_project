import Image from "next/image";
// import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import { auth } from "@/app/auth";
import { redirect } from "next/navigation";


export default async function Home() {

  const session = await auth();
  // console.log(session)
  if(!session?.user){
    redirect('/login')
  }
  return (
    <>
    <div className="w-full">
        <Navbar/>
    </div>
   <span className="text-blue-400">hi</span>
   
    </>
  );
}
