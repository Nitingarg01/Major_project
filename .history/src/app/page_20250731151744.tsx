import Image from "next/image";
// import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import { auth } from "@/app/auth";
import { redirect } from "next/navigation";


export default async function Home() {

  const session = await auth();
  // console.log(session)
  if (!session?.user) {
    redirect('/login')
  }
  return (
    <div className="flex flex-col gap-5">
      <div className="w-full">
        <Navbar />
      </div>
      <div className="border-2 border-black mx-22">
        <div>
          <span>Practice for Interviews and Ace the real ones.</span>
        </div>
      </div>
    </div>
  );
}
