'use client'
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createInterview, parsingResume } from "@/app/create/actions"
import { LoaderFive } from "@/components/ui/loader";
import { Badge } from "@/components/ui/badge";
import { Search, Building2, Users, Briefcase, Upload, FileText, Sparkles, Brain, Zap, Target, Award } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import EnhancedCompanySearchWithIntelligence from "./EnhancedCompanySearchWithIntelligence";

const schema = z.object({
    jobTitle: z.string().min(3, "Job Title Too Short"),
    jobDesc: z.string().min(30, "Job Description Too Short"),
    skills: z.array(z.string().min(1, "Enter Valid Skill")).min(3, "Enter at least 3 Skills"),
    companyName: z.string().min(1, "Enter Valid Company Name"),
    experienceLevel: z.enum(['entry', 'mid', 'senior']),
    interviewType: z.enum(['technical', 'behavioral', 'aptitude', 'dsa', 'mixed', 'system_design']),
    resume: z.any().optional()
})

// Enhanced skill categories with more comprehensive options
const skillCategories = {
    "Frontend": ["React", "Angular", "Vue.js", "JavaScript", "TypeScript", "HTML", "CSS", "Tailwind", "Next.js", "Svelte"],
    "Backend": ["Node.js", "Python", "Java", "C++", "Go", "Ruby", "PHP", "C#", "Rust", "Scala"],
    "Database": ["MySQL", "PostgreSQL", "MongoDB", "Redis", "Elasticsearch", "Cassandra", "DynamoDB"],
    "Cloud & DevOps": ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Jenkins", "Terraform", "Ansible"],
    "Mobile": ["React Native", "Flutter", "Swift", "Kotlin", "iOS", "Android", "Xamarin"],
    "Data & AI": ["Python", "R", "TensorFlow", "PyTorch", "Pandas", "NumPy", "Scikit-learn", "Apache Spark"],
    "Design": ["Figma", "Adobe XD", "Sketch", "Photoshop", "Illustrator", "UI/UX", "Prototyping"]
};

const EnhancedInterviewCreationForm = () => {
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
    const [selectedCompanyData, setSelectedCompanyData] = useState<any>(null)

    const onSubmit = async (data: z.infer<typeof schema>) => {
        // Enhanced validation with better error messages
        if (!data.jobTitle || data.jobTitle.length < 3) {
            toast.error("🎯 Job Title must be at least 3 characters long");
            return;
        }
        
        if (!data.jobDesc || data.jobDesc.length < 30) {
            toast.error("📝 Job Description needs more detail (minimum 30 characters)");
            return;
        }
        
        if (!data.skills || data.skills.length < 3) {
            toast.error("⚡ Please add at least 3 skills for better question generation");
            return;
        }
        
        if (!data.companyName || data.companyName.length < 1) {
            toast.error("🏢 Company name is required for personalized questions");
            return;
        }

        setLoading(true)
        try {
            console.log('🚀 Creating enhanced interview with AI intelligence...')
            const response = await createInterview(data, projectContext, workExDetails)
            
<<<<<<< HEAD
            // Check if there's a specific error response
            if (response && !response.success && response.error) {
                // Handle duplicate company error
                if (response.error.includes('already completed an interview')) {
                    toast.error("🏢 Duplicate Company Interview", {
                        description: response.error,
                        action: {
                            label: "View Performance Stats",
                            onClick: () => router.push('/performance')
                        }
                    })
                    return;
                }
                
                // Handle other errors
                toast.error("❌ Interview Creation Failed", {
                    description: response.error
                })
                return;
            }
            
=======
>>>>>>> e191508 (Initial commit)
            toast.success("🎉 Enhanced AI Interview Created Successfully!", {
                description: selectedCompanyData?.metadata?.hasSpecificQuestions 
                    ? "Company-specific questions generated with advanced AI"
                    : "Interview ready with intelligent question generation"
            })
            
            router.push('/dashboard')
        } catch (error) {
            console.error('Interview creation error:', error)
            toast.error("❌ Interview Creation Failed", {
                description: "Please check your inputs and try again"
            })
        } finally {
            setLoading(false)
        }
    }

    const parseResume = async (file: File) => {
        toast("📄 AI is analyzing your resume...", {
            description: "Extracting skills and experience for personalized questions"
        })
        setUploading(true)
        
        try {
            await new Promise((res) => setTimeout(res, 2500))
            const { data } = await parsingResume(file)
            const { skills, projects, workex } = data

            setProjectContext(prev => [...prev, projects]);
            setWorkExDetails(prev => [...prev, workex])
            form.setValue("skills", skills)
            
            toast.success("✅ Resume Analysis Complete!", {
                description: `Found ${skills.length} skills and enhanced context for AI questions`
            });
        } catch (error) {
            toast.error("❌ Resume parsing failed", {
                description: "Please try again or add skills manually"
            })
        } finally {
            setUploading(false)
        }
    }

    const addSkillFromCategory = (skill: string) => {
        const currentSkills = form.getValues("skills")
        if (!currentSkills.includes(skill) && currentSkills.length < 20) {
            form.setValue("skills", [...currentSkills, skill])
            toast.success(`➕ Added ${skill} to your skill set`)
        }
    }

    const handleCompanySelect = (company: string, jobTitle: string, companyData?: any) => {
        form.setValue("companyName", company)
        setSelectedCompanyData(companyData)
        
        if (companyData) {
            toast.success(`🎯 ${company} Selected!`, {
                description: companyData.metadata.hasSpecificQuestions 
                    ? "AI-enhanced questions will be tailored for this company"
                    : "Interview questions will be customized for this company"
            })
        }
    }

    const getInterviewTypeDescription = (type: string) => {
        const descriptions = {
            'mixed': '🎯 Comprehensive interview with technical, behavioral, and problem-solving questions',
            'technical': '💻 Deep technical assessment focusing on your programming and system design skills',
            'behavioral': '🤝 Evaluate your soft skills, leadership potential, and cultural fit',
            'aptitude': '🧠 Logic, reasoning, and analytical thinking challenges',
            'dsa': '⚡ Data structures, algorithms, and competitive programming problems',
            'system_design': '🏗️ Architecture and scalability design challenges for senior roles'
        }
        return descriptions[type as keyof typeof descriptions] || 'Standard interview format'
    }

    return (
        <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-lg">
            {/* Enhanced Header */}
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
                        AI-Enhanced Interview Creation
                    </h1>
                </div>
                <p className="text-lg text-gray-600 mb-4">Create personalized mock interviews with advanced AI intelligence</p>
                
                {/* AI Features Banner */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 p-4 rounded-lg">
                    <div className="flex items-center justify-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4 text-purple-600" />
                            <span className="text-purple-800 font-medium">AI Intelligence</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-blue-600" />
                            <span className="text-blue-800 font-medium">Company-Specific</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-green-600" />
                            <span className="text-green-800 font-medium">Performance Analytics</span>
                        </div>
                    </div>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Enhanced Company Selection */}
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-200">
                        <FormField
                            control={form.control}
                            name="companyName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2 text-lg font-semibold">
                                        <Building2 className="w-5 h-5 text-purple-600" />
                                        Company Name<span className="text-red-500">*</span>
                                        {selectedCompanyData?.metadata?.hasSpecificQuestions && (
                                            <Badge className="bg-green-100 text-green-700 border-green-200">
                                                <Zap className="w-3 h-3 mr-1" />
                                                AI Enhanced
                                            </Badge>
                                        )}
                                    </FormLabel>
                                    
                                    <div className="space-y-4">
                                        <EnhancedCompanySearchWithIntelligence
                                            onSelect={handleCompanySelect}
                                            placeholder="Search with AI intelligence (e.g., Google, OpenAI, Microsoft)"
                                        />
                                        
                                        {/* Manual Input Fallback */}
                                        <div className="relative">
                                            <FormControl>
                                                <Input 
                                                    placeholder="Or type company name manually" 
                                                    {...field} 
                                                    className="h-12 text-lg pl-4 pr-12"
                                                />
                                            </FormControl>
                                            {selectedCompanyData && (
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                    <Brain className="w-5 h-5 text-purple-500" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Company Intelligence Display */}
                                    {selectedCompanyData && (
                                        <div className="mt-4 p-4 bg-white border border-purple-200 rounded-lg">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                                    <Building2 className="w-4 h-4" />
                                                    {selectedCompanyData.name} Intelligence
                                                </h4>
                                                <Badge className={`text-xs ${
                                                    selectedCompanyData.metadata.difficultyLevel === 'High' 
                                                        ? 'bg-red-100 text-red-700' 
                                                        : selectedCompanyData.metadata.difficultyLevel === 'Medium'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-green-100 text-green-700'
                                                }`}>
                                                    {selectedCompanyData.metadata.difficultyLevel} Difficulty
                                                </Badge>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="font-medium text-gray-700 mb-1">Industry:</p>
                                                    <p className="text-gray-600">{selectedCompanyData.industry}</p>
                                                </div>
                                                
                                                <div>
                                                    <p className="font-medium text-gray-700 mb-1">Popular Roles:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {selectedCompanyData.metadata.popularRoles.slice(0, 3).map((role: string, index: number) => (
                                                            <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                                                                {role}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                
                                                <div className="md:col-span-2">
                                                    <p className="font-medium text-gray-700 mb-1">Tech Stack:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {selectedCompanyData.metadata.techStack.map((tech: string, index: number) => (
                                                            <span key={index} className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">
                                                                {tech}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
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
                                        <Input placeholder="e.g., Senior Software Engineer, Product Manager" {...field} className="h-12 text-lg" />
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
                                        <select {...field} className="w-full border border-gray-300 rounded-md px-3 py-3 bg-white h-12 text-lg">
                                            <option value="entry">Entry Level (0-2 years) - Foundational questions</option>
                                            <option value="mid">Mid Level (2-5 years) - Practical applications</option>
                                            <option value="senior">Senior Level (5+ years) - Leadership & architecture</option>
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
                                <FormLabel className="font-semibold">
                                    Job Description<span className="text-red-500">*</span>
                                    <span className="text-sm text-gray-500 ml-2">(More detail = Better AI questions)</span>
                                </FormLabel>
                                <FormControl>
                                    <Textarea 
                                        placeholder="Describe the role, responsibilities, requirements, and tech stack. Be detailed for more personalized questions..."
                                        {...field} 
                                        className="min-h-32 text-base"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Enhanced Skills Section */}
                    <FormField
                        control={form.control}
                        name="skills"
                        render={({ field }) => {
                            const addSkill = () => {
                                const trimmed = input.trim()
                                if (trimmed && !field.value.includes(trimmed) && field.value.length < 20) {
                                    form.setValue("skills", [...field.value, trimmed]);
                                    setInput("");
                                    toast.success(`➕ Added ${trimmed}`)
                                }
                            }

                            const removeSkill = (skill: string) => {
                                const newSkills = field.value.filter((s) => s !== skill)
                                form.setValue("skills", newSkills)
                                toast.info(`➖ Removed ${skill}`)
                            }

                            return (
                                <FormItem>
                                    <FormLabel className="font-semibold flex items-center justify-between">
                                        <span>
                                            Skills<span className="text-red-500">*</span>
                                            <span className="text-sm text-gray-500 ml-2">({field.value.length}/20) - More skills = Better questions</span>
                                        </span>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => setShowSkillSuggestions(!showSkillSuggestions)}
                                        >
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            {showSkillSuggestions ? 'Hide' : 'Show'} Suggestions
                                        </Button>
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
                                            placeholder="Add a skill (e.g., React, Python, Machine Learning)"
                                            className="h-12"
                                        />
                                        <Button type="button" onClick={addSkill} className="px-8 h-12">
                                            Add
                                        </Button>
                                    </div>

                                    {/* Enhanced Skill Suggestions */}
                                    {showSkillSuggestions && (
                                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-5 rounded-lg border border-gray-200">
                                            <p className="text-sm text-gray-700 mb-4 font-medium">💡 Popular skills by category (click to add):</p>
                                            <div className="space-y-4">
                                                {Object.entries(skillCategories).map(([category, skills]) => (
                                                    <div key={category}>
                                                        <p className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                                            {category === 'Frontend' && <span>🎨</span>}
                                                            {category === 'Backend' && <span>⚙️</span>}
                                                            {category === 'Database' && <span>🗄️</span>}
                                                            {category === 'Cloud & DevOps' && <span>☁️</span>}
                                                            {category === 'Mobile' && <span>📱</span>}
                                                            {category === 'Data & AI' && <span>🤖</span>}
                                                            {category === 'Design' && <span>🎭</span>}
                                                            {category}:
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {skills.map((skill) => (
                                                                <Badge 
                                                                    key={skill}
                                                                    variant="secondary" 
                                                                    className={`cursor-pointer transition-all text-xs hover:scale-105 ${
                                                                        field.value.includes(skill) 
                                                                            ? 'bg-green-100 text-green-700 border-green-300' 
                                                                            : 'hover:bg-blue-100 hover:text-blue-700'
                                                                    }`}
                                                                    onClick={() => addSkillFromCategory(skill)}
                                                                >
                                                                    {field.value.includes(skill) ? '✓ ' : '+ '}{skill}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Selected Skills Display */}
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {field.value.map((skill, index) => (
                                            <Badge key={index} variant="default" className="px-3 py-2 flex items-center gap-2 text-sm">
                                                {skill}
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeSkill(skill)}
                                                    className="hover:text-red-300 transition-colors text-lg leading-none"
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

                    {/* Enhanced Interview Type */}
                    <FormField
                        control={form.control}
                        name="interviewType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-semibold">Interview Type<span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <select {...field} className="w-full border border-gray-300 rounded-md px-3 py-4 bg-white text-base">
                                        <option value="mixed">🎯 Mixed Interview (Comprehensive - Recommended)</option>
                                        <option value="technical">💻 Technical Focus (Programming & Systems)</option>
                                        <option value="behavioral">🤝 Behavioral Focus (Leadership & Culture)</option>
                                        <option value="aptitude">🧠 Aptitude Focus (Logic & Problem Solving)</option>
                                        <option value="dsa">⚡ DSA Focus (Algorithms & Data Structures)</option>
                                        <option value="system_design">🏗️ System Design (Architecture & Scalability)</option>
                                    </select>
                                </FormControl>
                                <div className="text-sm text-gray-600 mt-2 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                                    {getInterviewTypeDescription(field.value)}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Enhanced Resume Upload */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
                        <div className="text-center mb-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-green-200">
                                <Sparkles className="w-4 h-4 text-green-600" />
                                <span className="text-lg font-semibold text-gray-700">Optional Enhancement</span>
                            </div>
                        </div>
                        
                        <FormField
                            name="resume"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2 font-semibold text-lg">
                                        <FileText className="w-5 h-5 text-green-600" />
                                        Upload Resume for AI Analysis
                                    </FormLabel>
                                    <div className="border-2 border-dashed border-green-300 rounded-xl p-8 text-center hover:border-green-400 transition-colors bg-white">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                                                <Upload className="w-8 h-8 text-white" />
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor="resume-upload"
                                                    className="cursor-pointer bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl px-8 py-4 hover:from-green-700 hover:to-blue-700 transition font-medium text-lg"
                                                >
                                                    {uploading ? "AI is Analyzing..." : "Choose Resume File"}
                                                </label>
                                                <div className="text-sm text-gray-600 mt-3">
                                                    {uploading ? (
                                                        <div className="flex items-center gap-3 justify-center">
                                                            <LoaderFive />
                                                            <div>
                                                                <p className="font-medium">Extracting skills and experience...</p>
                                                                <p className="text-xs">This will enhance question personalization</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p className="font-medium">Upload PDF, DOC, or DOCX • Max 5MB</p>
                                                            <p className="text-xs text-gray-500">AI will extract skills and experience for better questions</p>
                                                            {fileName && <p className="text-green-600 font-medium mt-2">📄 {fileName}</p>}
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Benefits List */}
                                                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <Brain className="w-3 h-3 text-purple-500" />
                                                        Auto-extract skills
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Target className="w-3 h-3 text-blue-500" />
                                                        Personalized questions
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Award className="w-3 h-3 text-green-500" />
                                                        Experience-based scenarios
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Zap className="w-3 h-3 text-yellow-500" />
                                                        Project-specific queries
                                                    </div>
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

                    {/* Enhanced Submit Button */}
                    <div className="flex justify-center pt-8">
                        <Button 
                            variant="default" 
                            type="submit" 
                            className="w-full md:w-auto px-16 py-6 text-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all shadow-lg" 
                            disabled={loading || uploading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-3">
                                    <LoaderFive />
                                    <div className="text-left">
                                        <p>Creating AI Interview...</p>
                                        <p className="text-sm opacity-90">Generating personalized questions</p>
                                    </div>
                                </span>
                            ) : (
                                <span className="flex items-center gap-3">
                                    <Brain className="w-6 h-6" />
                                    <div className="text-left">
                                        <p>Create AI-Enhanced Interview</p>
                                        <p className="text-sm opacity-90">
                                            {selectedCompanyData?.metadata?.hasSpecificQuestions 
                                                ? "With company-specific intelligence" 
                                                : "With advanced AI features"}
                                        </p>
                                    </div>
                                </span>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default EnhancedInterviewCreationForm