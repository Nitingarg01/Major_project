'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const schema = z.object({
    jobDesc:z.string().min(30,"Job Description Too Short"),
    skills:z.array(z.string().min(1,"Enter Valid Skill")).min(5,"Enter at least 5 Skills").max(10,"Enter at max 10 skills"),
    companyName:z.string().min(1,"Enter Valid Company Name")
})

type FormData = {
    jobDesc:string,
    skills:string[],
    companyName:string
}

const form = () => {

    const router = useRouter()
    const form = useForm<z.infer<typeof schema>>({
        resolver:zodResolver(schema),
        defaultValues:{
            jobDesc:'',
            skills:[],
            companyName:''
        }
    })

    const onSubmit = async (data:z.infer<typeof schema>)=>{
        console.log(data)
    }
    
  return (
    <div>
      
    </div>
  )
}

export default form
