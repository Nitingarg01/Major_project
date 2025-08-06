'use server'
import { toast } from "sonner"
import { auth } from "../auth"
import axios from 'axios'
import { ref } from "firebase/storage"
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
export const uploadToCloudinary = async (file: File): Promise<string | null> => {
  const data = new FormData();
  data.append("file", file);
  data.append("resource_type", "raw");
  if(process.env.CLOUDINARY_UPLOAD_PRESET_NAME){
    data.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET_NAME); 
  }
  if(process.env.CLOUDINARY_CLOUD_NAME){
    data.append("cloud_name",process.env.CLOUDINARY_CLOUD_NAME );
  }
  

  try {
    const res = await fetch("https://api.cloudinary.com/v1_1/dkbijzr1v/auto/upload", {
      method: "POST",
      body: data,
    });
    const json = await res.json();
    return json.secure_url; // The public URL of the uploaded resume
  } catch (err) {
    console.error("Upload failed", err);
    return null;
  }
};

export const resumeUploadToFirebase = async (file:File)=>{
    if(!file){
        return
    }
    const fileRef = ref(storage,`/resume/${file.name}`)
}

