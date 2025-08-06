"use server"
import { signIn } from "@/app/auth";
import { CredentialsSignin } from "next-auth";

export const handleLogin = async (formData:FormData)=>{
 
   const email = formData.get("email")?.toString(); // ← CALL .toString()
   const password = formData.get("password")?.toString();


   if(!email||!password){
    throw new Error("Please provide all the feilds!")
   }
   console.log(email,password)

   try {
    await signIn("credentials",{
        email,
        password,
        redirect:false,
    })
    return
   } catch (error) {
    const err = error as CredentialsSignin
    console.log(err.message)
    return
   }
}