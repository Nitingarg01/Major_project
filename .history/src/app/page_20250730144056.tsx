"use client"
import Image from "next/image";
import { signIn } from "next-auth/react";
import Navbar from "@/components/Navbar";


export default function Home() {
  return (
    <>
    <div className="w-full">
        <Navbar/>
    </div>
   <span className="text-blue-400">hi</span>
   <button onClick={() => signIn("google")}>Sign in with Google</button>
    </>
  );
}
