"use server"

export const handleSignUp = async(formData:FormData)=>{
    console.log(formData.get("name")?.toString())
}