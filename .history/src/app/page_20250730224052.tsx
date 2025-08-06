
import Image from "next/image";

import Navbar from "@/components/Navbar";
import { auth } from "@/app/auth";


export default async function Home() {

  const session = await auth();
  console.log(session)

  return (
    <>
    <div className="w-full">
        <Navbar/>
    </div>
   <span className="text-blue-400">hi</span>
   
    </>
  );
}
