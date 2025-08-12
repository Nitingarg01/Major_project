"use server"
import { signIn, signOut } from "@/app/auth";
import { CredentialsSignin } from "next-auth";
import { redirect } from "next/navigation";
import { toast } from "sonner"

export const handleLogin = async (formData:FormData)=>{
 
   const email = formData.get("email")?.toString(); // ← CALL .toString()
   const password = formData.get("password")?.toString();
   

   if(!email||!password){
    toast.message("Please provide all the feilds")
    // throw new Error("Please provide all the feilds!")
   }

   try {
    const result = await signIn("credentials",{
        email,
        password,
        redirectTo:'/',
    })

    console.log('login res',result);
    return result
   } catch (error) {
   console.log(error)
   }
}

export const handleLogout = async ()=>{
    await signOut();
}