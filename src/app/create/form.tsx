'use client'
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createInterview, parsingResume } from "./actions"
import { LoaderFive } from "@/components/ui/loader";
import { Badge } from "@/components/ui/badge";
import { Search, Building2, Users, Briefcase, Upload, FileText, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import SimpleCompanyAutofill from "@/components/SimpleCompanyAutofill";

const schema = z.object({
    jobTitle: z.string().min(3, "Job Title Too Short"),
    jobDesc: z.string().min(30, "Job Description Too Short"),
    skills: z.array(z.string().min(1, "Enter Valid Skill")).min(3, "Enter at least 3 Skills"),
    companyName: z.string().min(1, "Enter Valid Company Name"),
    experienceLevel: z.enum(['entry', 'mid', 'senior']),
    interviewType: z.enum(['technical', 'behavioral', 'aptitude', 'dsa', 'mixed']),
    resume: z.any().optional()
})

// Popular companies for quick selection
const popularCompanies = [
    "Google", "Microsoft", "Amazon", "Apple", "Meta", "Netflix", "Tesla", "Uber", 
    "Airbnb", "LinkedIn", "Spotify", "Dropbox", "Slack", "Adobe", "Salesforce"
];

// Popular skills by category
const skillCategories = {
    "Frontend": ["React", "Angular", "Vue.js", "JavaScript", "TypeScript", "HTML", "CSS", "Tailwind"],
    "Backend": ["Node.js", "Python", "Java", "C++", "Go", "Ruby", "PHP", "C#"],
    "Database": ["MySQL", "PostgreSQL", "MongoDB", "Redis", "Elasticsearch"],
    "Cloud": ["AWS", "Azure", "GCP", "Docker", "Kubernetes"],
    "Mobile": ["React Native", "Flutter", "Swift", "Kotlin", "iOS", "Android"]
};

const Createform = () => {
    const router = useRouter()
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            jobTitle: '',
            jobDesc: '',
            skills: [],
            companyName: '',
            experienceLevel: 'mid',
            interviewType: 'mixed'
        }
    })

    const [projectContext, setProjectContext] = useState<string[]>([])
    const [workExDetails, setWorkExDetails] = useState<string[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [input, setInput] = useState('')
    const [uploading, setUploading] = useState<boolean>(false)
    const [fileName, setFileName] = useState<string>('')
    const [showSkillSuggestions, setShowSkillSuggestions] = useState(false)

    const onSubmit = async (data: z.infer<typeof schema>) => {
        // Validate required fields before submitting
        if (!data.jobTitle || data.jobTitle.length < 3) {
            toast.error("Job Title is too short (minimum 3 characters)");
            return;
        }
        
        if (!data.jobDesc || data.jobDesc.length < 30) {
            toast.error("Job Description is too short (minimum 30 characters)");
            return;
        }
        
        if (!data.skills || data.skills.length < 3) {
            toast.error("Please add at least 3 skills");
            return;
        }
        
        if (!data.companyName || data.companyName.length < 1) {
            toast.error("Please enter a company name");
            return;
        }

        setLoading(true)
        try {
            const response = await createInterview(data, projectContext, workExDetails)
            toast.success("🎉 Interview Created Successfully with HARD Questions!")
            router.push('/dashboard')
        } catch (error) {
            console.error('Interview creation error:', error)
            toast.error("❌ Interview Creation Failed! Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const parseResume = async (file: File) => {
        toast("📄 Parsing Your Resume...")
        setUploading(true)
        
        try {
            await new Promise((res) => setTimeout(res, 2500))
            const { data } = await parsingResume(file)
            const { skills, projects, workex } = data

            setProjectContext(prev => [...prev, projects]);
            setWorkExDetails(prev => [...prev, workex])
            form.setValue("skills", skills)
            
            toast.success("✅ Resume parsed and skills auto-filled!");
        } catch (error) {
            toast.error("❌ Failed to parse resume")
        } finally {
            setUploading(false)
        }
    }

    const addSkillFromCategory = (skill: string) => {
        const currentSkills = form.getValues("skills")
        if (!currentSkills.includes(skill) && currentSkills.length < 15) {
            form.setValue("skills", [...currentSkills, skill])
        }
    }

    const selectCompany = (company: string) => {
        form.setValue("companyName", company)
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Sparkles className="w-8 h-8 text-purple-500" />
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                        Create Smart AI Interview
                    </h1>
                </div>
                <p className="text-gray-600">Configure your challenging mock interview session</p>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-400 p-4 mt-4 rounded">
                    <p className="text-blue-800 font-semibold">🧠 Smart AI: Powered by Emergent + Gemini for optimal performance</p>
                    <p className="text-blue-700 text-sm">Get ready for intelligent questions generated 10x faster than before!</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Company Selection with Simple Autofill */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                        <FormField
                            control={form.control}
                            name="companyName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2 text-lg font-semibold">
                                        <Building2 className="w-5 h-5 text-blue-600" />
                                        Company Name<span className="text-red-500">*</span>
                                    </FormLabel>
                                    <div className="space-y-4">
                                        <SimpleCompanyAutofill
                                            onSelect={(company, jobTitle, companyData) => {
                                                form.setValue("companyName", company)
                                            }}
                                            placeholder="Type company name (e.g., Google, Microsoft)"
                                        />
                                        <FormControl>
                                            <Input 
                                                placeholder="Or type company name manually" 
                                                {...field} 
                                                className="h-12 text-lg"
                                            />
                                        </FormControl>
                                    </div>
                                    <div className="mt-3">
                                        <p className="text-sm text-gray-600 mb-2">Popular companies:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {popularCompanies.map((company) => (
                                                <Badge 
                                                    key={company}
                                                    variant="outline" 
                                                    className="cursor-pointer hover:bg-blue-100 transition-colors"
                                                    onClick={() => selectCompany(company)}
                                                >
                                                    {company}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Job Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="jobTitle"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2 font-semibold">
                                        <Briefcase className="w-4 h-4 text-green-600" />
                                        Job Title<span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Senior Software Engineer" {...field} className="h-11" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="experienceLevel"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2 font-semibold">
                                        <Users className="w-4 h-4 text-purple-600" />
                                        Experience Level<span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <select {...field} className="w-full border border-gray-300 rounded-md px-3 py-3 bg-white">
                                            <option value="entry">Entry Level (0-2 years) - Smart AI optimized</option>
                                            <option value="mid">Mid Level (2-5 years) - Smart AI enhanced</option>
                                            <option value="senior">Senior Level (5+ years) - Advanced Smart AI</option>
                                        </select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Job Description */}
                    <FormField
                        control={form.control}
                        name="jobDesc"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-semibold">Job Description<span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Textarea 
                                        placeholder="Describe the job role, responsibilities, and requirements... (Be detailed for better HARD questions)"
                                        {...field} 
                                        className="min-h-24"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Skills Section */}
                    <FormField
                        control={form.control}
                        name="skills"
                        render={({ field }) => {
                            const addSkill = () => {
                                const trimmed = input.trim()
                                if (trimmed && !field.value.includes(trimmed) && field.value.length < 15) {
                                    form.setValue("skills", [...field.value, trimmed]);
                                    setInput("");
                                }
                            }

                            const removeSkill = (skill: string) => {
                                const newSkills = field.value.filter((s) => s !== skill)
                                form.setValue("skills", newSkills)
                            }

                            return (
                                <FormItem>
                                    <FormLabel className="font-semibold">
                                        Skills<span className="text-red-500">*</span>
                                        <span className="text-sm text-gray-500 ml-2">({field.value.length}/15) - More skills = Harder questions</span>
                                    </FormLabel>
                                    
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
                                            placeholder="Add a skill (e.g., React, Python)"
                                            onFocus={() => setShowSkillSuggestions(true)}
                                        />
                                        <Button type="button" onClick={addSkill} className="px-6">
                                            Add
                                        </Button>
                                    </div>

                                    {/* Skill Suggestions */}
                                    {showSkillSuggestions && (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600 mb-3">Popular skills by category (more skills = harder questions):</p>
                                            <div className="space-y-3">
                                                {Object.entries(skillCategories).map(([category, skills]) => (
                                                    <div key={category}>
                                                        <p className="text-sm font-medium text-gray-700 mb-1">{category}:</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {skills.map((skill) => (
                                                                <Badge 
                                                                    key={skill}
                                                                    variant="secondary" 
                                                                    className="cursor-pointer hover:bg-blue-100 text-xs"
                                                                    onClick={() => addSkillFromCategory(skill)}
                                                                >
                                                                    + {skill}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <Button 
                                                type="button" 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => setShowSkillSuggestions(false)}
                                                className="mt-2"
                                            >
                                                Hide suggestions
                                            </Button>
                                        </div>
                                    )}

                                    {/* Selected Skills */}
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {field.value.map((skill, index) => (
                                            <Badge key={index} variant="default" className="px-3 py-1 flex items-center gap-2">
                                                {skill}
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeSkill(skill)}
                                                    className="hover:text-red-300 transition-colors"
                                                >
                                                    ×
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )
                        }}
                    />

                    {/* Interview Type */}
                    <FormField
                        control={form.control}
                        name="interviewType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-semibold">Interview Type<span className="text-red-500">*</span> (All are HARD mode)</FormLabel>
                                <FormControl>
                                    <select {...field} className="w-full border border-gray-300 rounded-md px-3 py-3 bg-white">
                                        <option value="mixed">🎯 Mixed HARD (Technical + Behavioral + Aptitude + DSA)</option>
                                        <option value="technical">💻 Technical HARD Only</option>
                                        <option value="behavioral">🤝 Behavioral HARD Only</option>
                                        <option value="aptitude">🧠 Aptitude HARD Only</option>
                                        <option value="dsa">⚡ DSA HARD (Data Structures & Algorithms)</option>
                                    </select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Resume Upload */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
                        <div className="text-center mb-4">
                            <span className="text-lg font-semibold">OR</span>
                        </div>
                        
                        <FormField
                            name="resume"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2 font-semibold">
                                        <FileText className="w-5 h-5 text-green-600" />
                                        Upload Resume (Auto-fill skills & details for HARD questions)
                                    </FormLabel>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                                        <div className="flex flex-col items-center gap-4">
                                            <Upload className="w-12 h-12 text-gray-400" />
                                            <div>
                                                <label
                                                    htmlFor="resume-upload"
                                                    className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full px-6 py-3 hover:from-blue-700 hover:to-purple-700 transition font-medium"
                                                >
                                                    {uploading ? "Processing..." : "Choose Resume File"}
                                                </label>
                                                <div className="text-sm text-gray-500 mt-2">
                                                    {uploading ? (
                                                        <div className="flex items-center gap-2 justify-center">
                                                            <LoaderFive />
                                                            Extracting skills for HARD questions...
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            Upload PDF, DOC, or DOCX • Max 5MB
                                                            {fileName && <><br /><span className="text-green-600 font-medium">📄 {fileName}</span></>}
                                                        </div>
                                                    )}
                                                </div>
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
                                        disabled={uploading}
                                    />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center pt-6">
                        <Button 
                            variant="default" 
                            type="submit" 
                            className="w-full md:w-auto px-12 py-4 text-lg bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700" 
                            disabled={loading || uploading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <LoaderFive />
                                    Creating HARD Interview...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    Create HARD AI Interview
                                </span>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default Createform