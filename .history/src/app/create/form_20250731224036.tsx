'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const schema = z.object({
    jobDesc: z.string().min(30, "Job Description Too Short"),
    skills: z.array(z.string().min(1, "Enter Valid Skill")).min(5, "Enter at least 5 Skills").max(10, "Enter at max 10 skills"),
    companyName: z.string().min(1, "Enter Valid Company Name"),
    resume: z.any().optional()
})


const Createform = () => {

    const router = useRouter()
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            jobDesc: '',
            skills: [],
            companyName: ''
        }
    })

    const onSubmit = async (data: z.infer<typeof schema>) => {
        console.log(data)
    }

    const [input, setInput] = useState('')

    const parseResume = async (file: File) => {
        toast.loading("Parsing You Resume")
        await new Promise((res) => setTimeout(res, 2500))
        //INSTEAD OF TIME OUT WRITE LLMS EXTRACTION LOGIC HERE

        const extractedSkills = ['React', 'NextJs', 'Prisma', 'Fast API']
        const projectContext = [
            "Developed a fullstack dashboard using React and Supabase",
            "Built RESTful APIs in Node.js with JWT auth",
        ];
        form.setValue("skills",extractedSkills)
        console.log("Project Context to feed LLM later:", projectContext);
        toast.success("Resume parsed and skills auto-filled!");
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
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
                                <div className="h-[10vh] bg-gray-200 flex justify-center items-center">
                                    <div>

                                    </div>
                                </div>
                                <Input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) {
                                            parseResume(file)
                                        }
                                    }}
                                />
                            </FormItem>
                        )
                    }}
                />


                <Button variant="default" type="submit">
                    Submit
                </Button>

            </form>
        </Form>
    )
}

export default Createform
