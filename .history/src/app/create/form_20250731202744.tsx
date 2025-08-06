'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type FormData = {
    jobTitle:string,
    skills:string[],
    companyName:string
}

const form = () => {

    const router = useRouter()
    const form = useForm<FormData>({
        resolver:zodResolver(),
        defaultValues:{
            jobTitle:'',
            skills:[],
            companyName:''
        }
    })
    
  return (
    <div>
      
    </div>
  )
}

export default form
