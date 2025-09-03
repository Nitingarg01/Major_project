'use client'
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import {  useRouter } from "next/navigation"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createInterview, parsingResume } from "./actions"
import { LoaderOne } from "@/components/ui/loader";

const schema = z.object({
    jobTitle:z.string().min(3,"Job Title Too Short"),
    jobDesc: z.string().min(30, "Job Description Too Short"),
    skills: z.array(z.string().min(1, "Enter Valid Skill")).min(5, "Enter at least 5 Skills"),
    companyName: z.string().min(1, "Enter Valid Company Name"),
    experienceLevel: z.enum(['entry', 'mid', 'senior']),
    interviewType: z.enum(['technical', 'behavioral', 'aptitude', 'dsa', 'mixed']),
    resume: z.any().optional()
})


const Createform = () => {

    // const session = await auth()
    // console.log(session?.user)

    const router = useRouter()
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            jobTitle:'',
            jobDesc: '',
            skills: [],
            companyName: '',
            experienceLevel: 'mid',
            interviewType: 'mixed'
        }
    })

    const [projectContext,setProjectContext] = useState<string[]>([])
    const [workExDetails,setWorkExDetails] = useState<string[]>([])

    const [loading,setLoading] = useState<boolean>(false)

    const onSubmit = async (data: z.infer<typeof schema>) => {

        try {
            const response = await createInterview(data,projectContext,workExDetails)
            toast.success("Interview Created Succesfully!")
            router.push('/')
        } catch (error) {
            toast.error("Interview Not Created!")
        }
    }

    const [input, setInput] = useState('')

    
    const [uploading,setUploading] = useState<boolean>(false)
    const [fileName,setFileName] = useState<string>('')   

    const parseResume = async (file: File) => {
        toast("Parsing You Resume")
        setLoading(true)
        await new Promise((res) => setTimeout(res, 2500))
      

        const {data} = await parsingResume(file)
        const {skills,projects,workex} = data

        setProjectContext(prev => [...prev, projects]);
        setWorkExDetails(prev=>[...prev,workex])
        
        form.setValue("skills",skills)
        setLoading(false)
        toast.success("Resume parsed and skills auto-filled!");
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 mb-3">
                 <FormField
                    control={form.control}
                    name="jobTitle"
                    render={({ field }) => {
                        return (
                            <FormItem>
                                <FormLabel>Job Title<span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter Job Title" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )
                    }}
                />

                <FormField
                    control={form.control}
                    name="jobDesc"
                    render={({ field }) => {
                        return (
                            <FormItem>
                                <FormLabel>Job Description<span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter Job Description" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )
                    }}
                />

                <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => {
                        return (
                            <FormItem>
                                <FormLabel>Company Name<span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter the Company name here" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )
                    }}
                />

                <FormField
                    control={form.control}
                    name="skills"
                    render={({ field }) => {
                        const addSkill = () => {
                            const trimmed = input.trim()
                            if (
                                trimmed &&
                                !field.value.includes(trimmed) &&
                                field.value.length < 10
                            ) {
                                form.setValue("skills", [...field.value, trimmed]);
                                setInput("");
                            }

                        }

                        const removeSkill = (skill: string) => {
                            const newSkills = field.value.filter((s) => s != skill)
                            form.setValue("skills", newSkills)
                        }
                        return (
                            <FormItem>
                                <FormLabel>Skills<span className="text-red-500">*</span></FormLabel>
                                <div className="flex gap-2">
                                    <Input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault()
                                                addSkill()
                                            }
                                        }}
                                        placeholder="Add a skill (e.g. React)"
                                    />
                                    <Button type="button" onClick={addSkill}>
                                        Add
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {field.value.map((skill, index) => <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2">
                                        {skill}
                                        <button type="button" className="" onClick={() => removeSkill(skill)}>x</button>
                                    </span>)}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )
                    }}
                />

                <div className="flex flex-row justify-center">
                    <span className="font-bold">OR</span>
                </div>

                <FormField
                    name="resume"
                    control={form.control}
                    render={({ field }) => {
                        return (
                            <FormItem>
                                <FormLabel>Upload Resume</FormLabel>
                                <div className="h-[10vh] bg-gray-100 flex justify-center items-center">
                                    <div className="flex flex-col items-center gap-1">
                                         <label
      htmlFor="resume-upload"
      className="cursor-pointer bg-blue-600 text-white rounded-full px-5 py-2 hover:bg-blue-700 transition"
    >
      Upload File
    </label>
    <div className="text-xs flex flex-row gap-3">
        {loading ? <LoaderOne/> : <> <span>Upload only .pdf</span>
        <span>{fileName ? fileName : 'No File Uploaded!'}</span></>}
       
        </div>
                                    </div>
                                </div>
                                <Input
                                    id="resume-upload"
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) {
                                            setFileName(file.name)
                                            parseResume(file)
                                        }
                                    }}
                                />
                                
                            </FormItem>
                        )
                    }}
                />
                <div className="flex justify-center">
                     <Button variant="default" type="submit" className="w-[30%]" disabled={!form.formState.isValid || loading}>
                    Create New Interview
                </Button>
                </div>
               

            </form>
        </Form>
    )
}

export default Createform
