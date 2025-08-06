"use server"

export const handleSignUp = async(formData:FormData)=>{
    const email = formData.get("email")?.toString(); // ← CALL .toString()

//   console.log("Email:", email);
}