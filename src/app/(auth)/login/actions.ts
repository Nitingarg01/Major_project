"use server"
import { signIn, signOut } from "@/app/auth";
import { redirect } from "next/navigation";

export const handleLogin = async (formData: FormData) => {
   const email = formData.get("email")?.toString();
   const password = formData.get("password")?.toString();
   
   if (!email || !password) {
     throw new Error("Please provide all the fields!")
   }

   try {
     const result = await signIn("credentials", {
       email,
       password,
       redirect: false,
     })

     if (result?.error) {
       throw new Error(result.error)
     }

     // If login is successful, redirect to home page
     redirect('/')
   } catch (error) {
     console.error('Login error:', error)
     // Re-throw the error so it can be handled by the client
     throw error
   }
}

export const handleLogout = async () => {
    await signOut();
}
