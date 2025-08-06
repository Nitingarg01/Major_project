"use server"

export const handleLogin = async (formData:FormData)=>{
   const email = formData.get("email")?.toString(); // ← CALL .toString()
   const password = formData.get("password")?.toString();

   if(!email||!password){
    throw new Error("Please provide all the feilds!")
   }
}