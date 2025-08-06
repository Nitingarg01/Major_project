'use server'
import { toast } from "sonner"
import { auth } from "../auth"
import axios from 'axios'
import { ref, uploadBytesResumable } from "firebase/storage"
import { storage } from "@/lib/firebase"


type formD = {
    jobDesc:string,
    skills:string[],
    companyName:string,
    jobTitle:string
}

const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const createInterview = async (data: formD,projectContext:string[],workExDetails:string[]) => {
    const session = await auth()
    console.log(session?.user)
    console.log(data,projectContext,workExDetails)
    try {
        const res = await axios.post(`${baseURL}/api/create-interview`,{
           id:session?.user?.id,
           jobDesc:data.jobDesc,
           skills:data.skills, 
           companyName:data.companyName, 
           projectContext:projectContext, 
           workExDetails:workExDetails,
           jobTitle:data.jobTitle
        })
        // toast("Interview Created Successfully")
        console.log(res.data.id)
    } catch (error) {
        console.log(error)
        // toast("Interview Not Created")
    }
}

export const parsingResume = async (data:FormData){
  
}


