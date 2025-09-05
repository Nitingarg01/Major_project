'use client'

import React, { useState, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from 'framer-motion'

// UI Components
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"

// Icons
import { 
  Building2, Briefcase, Users, Code, Brain, Calculator, 
  Target, Upload, FileText, Sparkles, Settings, Clock,
  CheckCircle, AlertCircle, Zap, TrendingUp
} from "lucide-react";

// Services
import { createInterview, parsingResume } from "@/app/create/actions"
import EnhancedInterviewAI from '@/lib/enhancedInterviewAI'

const schema = z.object({
  jobTitle: z.string().min(2, "Job Title Too Short"),
  jobDesc: z.string().min(20, "Job Description Too Short"),
  skills: z.array(z.string().min(1, "Enter Valid Skill")).min(2, "Enter at least 2 Skills"),
  companyName: z.string().min(1, "Enter Valid Company Name"),
  experienceLevel: z.enum(['entry', 'mid', 'senior']),
  interviewType: z.enum(['technical', 'behavioral', 'aptitude', 'dsa', 'mixed']),
  selectedRounds: z.array(z.string()).min(1, "Select at least one round"),
  estimatedDuration: z.number().min(15).max(180),
  difficultyPreference: z.enum(['adaptive', 'fixed']),
  resume: z.any().optional()
})

interface RoundConfig {
  id: string;
  name: string;
  type: 'technical' | 'behavioral' | 'dsa' | 'aptitude';
  description: string;
  icon: React.ComponentType<any>;
  duration: number;
  questionCount: number;
  color: string;
  difficulty: string;
  skills: string[];
}

const AVAILABLE_ROUNDS: RoundConfig[] = [
  {
    id: 'technical',
    name: 'Technical Interview',
    type: 'technical',
    description: 'Programming concepts, system design, and technical problem-solving',
    icon: Code,
    duration: 45,
    questionCount: 6,
    color: 'from-blue-500 to-blue-600',
    difficulty: 'Medium to Hard',
    skills: ['Programming', 'System Design', 'Architecture']
  },
  {
    id: 'dsa',
    name: 'DSA & Coding',
    type: 'dsa',
    description: 'Data structures, algorithms, and live coding challenges',
    icon: Calculator,
    duration: 60,
    questionCount: 2,
    color: 'from-green-500 to-green-600',
    difficulty: 'Hard',
    skills: ['Algorithms', 'Data Structures', 'Problem Solving']
  },
  {
    id: 'behavioral',
    name: 'Behavioral Interview',
    type: 'behavioral',
    description: 'Communication, teamwork, leadership, and cultural fit',
    icon: Users,
    duration: 30,
    questionCount: 5,
    color: 'from-purple-500 to-purple-600',
    difficulty: 'Easy to Medium',
    skills: ['Communication', 'Leadership', 'Teamwork']
  },
  {
    id: 'aptitude',
    name: 'Aptitude Test',
    type: 'aptitude',
    description: 'Logical reasoning, numerical, verbal, and spatial aptitude',
    icon: Brain,
    duration: 25,
    questionCount: 10,
    color: 'from-orange-500 to-orange-600',
    difficulty: 'Medium',
    skills: ['Logical Reasoning', 'Numerical Skills', 'Verbal Skills']
  }
];

const SKILL_CATEGORIES = {
  "Frontend": ["React", "Vue.js", "Angular", "JavaScript", "TypeScript", "HTML", "CSS", "Tailwind"],
  "Backend": ["Node.js", "Python", "Java", "C++", "Go", "Ruby", "PHP", "C#"],
  "Database": ["MySQL", "PostgreSQL", "MongoDB", "Redis", "Elasticsearch", "DynamoDB"],
  "Cloud": ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform"],
  "Mobile": ["React Native", "Flutter", "Swift", "Kotlin", "iOS", "Android"],
  "Data Science": ["Python", "R", "SQL", "Machine Learning", "TensorFlow", "PyTorch"],
  "DevOps": ["Docker", "Kubernetes", "Jenkins", "GitLab CI", "AWS", "Terraform"]
};

const EnhancedInterviewCreationForm = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState('')
  const [skillInput, setSkillInput] = useState('')
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false)
  const [companyResearching, setCompanyResearching] = useState(false)
  const [companyData, setCompanyData] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState(0)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      jobTitle: '',
      jobDesc: '',
      skills: [],
      companyName: '',
      experienceLevel: 'mid',
      interviewType: 'mixed',
      selectedRounds: ['technical', 'behavioral'],
      estimatedDuration: 75,
      difficultyPreference: 'adaptive'
    }
  })

  const aiService = React.useMemo(() => EnhancedInterviewAI.getInstance(), [])

  // Watch form values for dynamic updates
  const selectedRounds = form.watch("selectedRounds")
  const companyName = form.watch("companyName")
  const experienceLevel = form.watch("experienceLevel")

  // Calculate estimated duration based on selected rounds
  React.useEffect(() => {
    const totalDuration = selectedRounds.reduce((sum, roundId) => {
      const round = AVAILABLE_ROUNDS.find(r => r.id === roundId)
      return sum + (round?.duration || 0)
    }, 0)
    
    form.setValue("estimatedDuration", totalDuration)
  }, [selectedRounds, form])

  // Research company when name changes
  const researchCompany = useCallback(async (name: string) => {
    if (name.length < 3) return

    setCompanyResearching(true)
    try {
      const data = await aiService.researchCompany(name)
      setCompanyData(data)
      
      // Auto-suggest skills based on company tech stack
      const currentSkills = form.getValues("skills")
      const suggestedSkills = data.techStack
        .slice(0, 3)
        .filter((skill: string) => !currentSkills.includes(skill))
      
      if (suggestedSkills.length > 0) {
        toast.success(`Found ${data.name}! Added ${suggestedSkills.length} relevant skills.`)
        form.setValue("skills", [...currentSkills, ...suggestedSkills])
      }
    } catch (error) {
      console.error('Company research failed:', error)
    } finally {
      setCompanyResearching(false)
    }
  }, [aiService, form])

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (companyName && companyName.length >= 3) {
        researchCompany(companyName)
      }
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [companyName, researchCompany])

  const onSubmit = async (data: z.infer<typeof schema>) => {
    if (!data.jobTitle || data.jobTitle.length < 2) {
      toast.error("Job Title is too short");
      return;
    }
    
    if (!data.jobDesc || data.jobDesc.length < 20) {
      toast.error("Job Description is too short");
      return;
    }
    
    if (!data.skills || data.skills.length < 2) {
      toast.error("Please add at least 2 skills");
      return;
    }

    setLoading(true)
    try {
      // Add the enhanced data to the interview creation
      const enhancedData = {
        ...data,
        companyIntelligence: companyData,
        roundConfigs: AVAILABLE_ROUNDS.filter(round => data.selectedRounds.includes(round.id))
      }

      const response = await createInterview(enhancedData, [], [])
      toast.success("🎉 Enhanced Interview Created Successfully!")
      router.push('/')
    } catch (error) {
      console.error('Interview creation error:', error)
      toast.error("❌ Interview Creation Failed!")
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

      form.setValue("skills", [...form.getValues("skills"), ...skills])
      
      toast.success("✅ Resume parsed and skills auto-filled!");
    } catch (error) {
      toast.error("❌ Failed to parse resume")
    } finally {
      setUploading(false)
    }
  }

  const addSkill = useCallback(() => {
    const trimmed = skillInput.trim()
    const currentSkills = form.getValues("skills")
    
    if (trimmed && !currentSkills.includes(trimmed) && currentSkills.length < 15) {
      form.setValue("skills", [...currentSkills, trimmed])
      setSkillInput("")
    }
  }, [skillInput, form])

  const removeSkill = useCallback((skill: string) => {
    const currentSkills = form.getValues("skills")
    form.setValue("skills", currentSkills.filter(s => s !== skill))
  }, [form])

  const addSkillFromCategory = useCallback((skill: string) => {
    const currentSkills = form.getValues("skills")
    if (!currentSkills.includes(skill) && currentSkills.length < 15) {
      form.setValue("skills", [...currentSkills, skill])
    }
  }, [form])

  const toggleRound = useCallback((roundId: string) => {
    const currentRounds = form.getValues("selectedRounds")
    if (currentRounds.includes(roundId)) {
      if (currentRounds.length > 1) {
        form.setValue("selectedRounds", currentRounds.filter(id => id !== roundId))
      } else {
        toast.warning("At least one round must be selected")
      }
    } else {
      form.setValue("selectedRounds", [...currentRounds, roundId])
    }
  }, [form])

  const steps = [
    { id: 'company', title: 'Company & Role', icon: Building2 },
    { id: 'rounds', title: 'Interview Rounds', icon: Target },
    { id: 'skills', title: 'Skills & Experience', icon: Zap },
    { id: 'final', title: 'Final Settings', icon: Settings }
  ]

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-4"
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Create Enhanced AI Interview
          </h1>
        </motion.div>
        <p className="text-gray-600 text-lg">
          Design your personalized interview experience with AI-powered questions and company research
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = index === currentStep
            const isCompleted = index < currentStep

            return (
              <div key={step.id} className="flex items-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : isCompleted 
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-500'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{step.title}</span>
                  {isCompleted && <CheckCircle className="w-4 h-4" />}
                </motion.div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-1 mx-2 rounded ${
                    isCompleted ? 'bg-green-300' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs value={steps[currentStep].id} className="space-y-6">
            {/* Step 1: Company & Role */}
            <TabsContent value="company" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Company & Position Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Company Name */}
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          Company Name<span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="e.g., Google, Microsoft, Tesla" 
                              {...field}
                              className="pr-12"
                            />
                            {companyResearching && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"
                                />
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Company Intelligence Card */}
                  {companyData && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="font-semibold text-green-800">Company Research Complete!</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Industry:</span>
                              <div className="text-gray-600">{companyData.industry}</div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Size:</span>
                              <div className="text-gray-600 capitalize">{companyData.size}</div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Difficulty:</span>
                              <div className="text-gray-600 capitalize">{companyData.difficulty}</div>
                            </div>
                          </div>
                          <div className="mt-3">
                            <span className="font-medium text-gray-700">Key Technologies:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {companyData.techStack.slice(0, 6).map((tech: string, i: number) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* Job Title and Experience Level */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="jobTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            Job Title<span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Senior Software Engineer" {...field} />
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
                          <FormLabel className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Experience Level<span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <select {...field} className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white">
                              <option value="entry">Entry Level (0-2 years)</option>
                              <option value="mid">Mid Level (2-5 years)</option>
                              <option value="senior">Senior Level (5+ years)</option>
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
                        <FormLabel>Job Description<span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the role, responsibilities, and requirements..."
                            {...field} 
                            className="min-h-24"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button 
                  type="button" 
                  onClick={() => setCurrentStep(1)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Next: Select Rounds
                </Button>
              </div>
            </TabsContent>

            {/* Step 2: Interview Rounds */}
            <TabsContent value="rounds" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Choose Interview Rounds
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Select the rounds you want in your interview. You can customize the order during the interview.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {AVAILABLE_ROUNDS.map((round) => {
                      const Icon = round.icon
                      const isSelected = selectedRounds.includes(round.id)

                      return (
                        <motion.div
                          key={round.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card 
                            className={`cursor-pointer transition-all ${
                              isSelected 
                                ? `bg-gradient-to-r ${round.color} text-white shadow-lg`
                                : 'hover:shadow-md border-2 border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => toggleRound(round.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${
                                  isSelected ? 'bg-white/20' : 'bg-gray-100'
                                }`}>
                                  <Icon className={`w-5 h-5 ${
                                    isSelected ? 'text-white' : 'text-gray-600'
                                  }`} />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className={`font-semibold ${
                                      isSelected ? 'text-white' : 'text-gray-900'
                                    }`}>
                                      {round.name}
                                    </h3>
                                    {isSelected && <CheckCircle className="w-4 h-4" />}
                                  </div>
                                  <p className={`text-sm mb-2 ${
                                    isSelected ? 'text-white/90' : 'text-gray-600'
                                  }`}>
                                    {round.description}
                                  </p>
                                  <div className={`flex items-center gap-4 text-xs ${
                                    isSelected ? 'text-white/80' : 'text-gray-500'
                                  }`}>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {round.duration} min
                                    </div>
                                    <div>
                                      {round.questionCount} questions
                                    </div>
                                    <div>
                                      {round.difficulty}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Selected rounds summary */}
                  {selectedRounds.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-blue-50 p-4 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-blue-800">Interview Summary</span>
                        <Badge className="bg-blue-100 text-blue-800">
                          {selectedRounds.length} rounds selected
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
                        <div>
                          <span className="font-medium">Total Duration:</span>
                          <span className="ml-2">{form.watch("estimatedDuration")} minutes</span>
                        </div>
                        <div>
                          <span className="font-medium">Total Questions:</span>
                          <span className="ml-2">
                            {selectedRounds.reduce((sum, roundId) => {
                              const round = AVAILABLE_ROUNDS.find(r => r.id === roundId)
                              return sum + (round?.questionCount || 0)
                            }, 0)} questions
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setCurrentStep(0)}
                >
                  Previous
                </Button>
                <Button 
                  type="button" 
                  onClick={() => setCurrentStep(2)}
                  disabled={selectedRounds.length === 0}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Next: Add Skills
                </Button>
              </div>
            </TabsContent>

            {/* Step 3: Skills */}
            <TabsContent value="skills" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Skills & Technologies
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Skills<span className="text-red-500">*</span>
                          <span className="text-sm text-gray-500 ml-2">({field.value.length}/15)</span>
                        </FormLabel>
                        
                        <div className="flex gap-2">
                          <Input
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
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
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-50 p-4 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-sm text-gray-600">Popular skills by category:</p>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setShowSkillSuggestions(false)}
                              >
                                Hide
                              </Button>
                            </div>
                            <div className="space-y-3">
                              {Object.entries(SKILL_CATEGORIES).map(([category, skills]) => (
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
                          </motion.div>
                        )}

                        {/* Selected Skills */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          <AnimatePresence>
                            {field.value.map((skill, index) => (
                              <motion.div
                                key={skill}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                              >
                                <Badge className="px-3 py-1 flex items-center gap-2 bg-blue-100 text-blue-800">
                                  {skill}
                                  <button 
                                    type="button" 
                                    onClick={() => removeSkill(skill)}
                                    className="hover:text-red-500 transition-colors"
                                  >
                                    ×
                                  </button>
                                </Badge>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Resume Upload */}
                  <Card className="bg-gradient-to-r from-green-50 to-blue-50">
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <span className="text-lg font-semibold">OR</span>
                      </div>
                      
                      <div className="text-center">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <div>
                          <label
                            htmlFor="resume-upload"
                            className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full px-6 py-3 hover:from-blue-700 hover:to-purple-700 transition font-medium inline-block"
                          >
                            {uploading ? "Processing..." : "Upload Resume to Auto-Fill Skills"}
                          </label>
                          <div className="text-sm text-gray-500 mt-2">
                            {uploading ? (
                              "Extracting skills and experience..."
                            ) : (
                              <>
                                Upload PDF, DOC, or DOCX • Max 5MB
                                {fileName && <><br /><span className="text-green-600 font-medium">📄 {fileName}</span></>}
                              </>
                            )}
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
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                >
                  Previous
                </Button>
                <Button 
                  type="button" 
                  onClick={() => setCurrentStep(3)}
                  disabled={form.getValues("skills").length < 2}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Next: Final Settings
                </Button>
              </div>
            </TabsContent>

            {/* Step 4: Final Settings */}
            <TabsContent value="final" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Final Interview Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="difficultyPreference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty Adjustment</FormLabel>
                        <FormControl>
                          <div className="space-y-3">
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="radio"
                                {...field}
                                value="adaptive"
                                checked={field.value === 'adaptive'}
                                className="text-blue-600"
                              />
                              <div>
                                <div className="font-medium">Adaptive Difficulty (Recommended)</div>
                                <div className="text-sm text-gray-600">
                                  Questions adapt based on your performance and company difficulty
                                </div>
                              </div>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="radio"
                                {...field}
                                value="fixed"
                                checked={field.value === 'fixed'}
                                className="text-blue-600"
                              />
                              <div>
                                <div className="font-medium">Fixed Difficulty</div>
                                <div className="text-sm text-gray-600">
                                  Consistent difficulty based on your experience level only
                                </div>
                              </div>
                            </label>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Interview Summary */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-4">Interview Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Company</div>
                        <div className="font-medium">{form.watch("companyName") || "Not specified"}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Position</div>
                        <div className="font-medium">{form.watch("jobTitle") || "Not specified"}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Experience Level</div>
                        <div className="font-medium capitalize">{form.watch("experienceLevel")}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Duration</div>
                        <div className="font-medium">{form.watch("estimatedDuration")} minutes</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Rounds</div>
                        <div className="font-medium">{selectedRounds.length} selected</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Skills</div>
                        <div className="font-medium">{form.watch("skills").length} added</div>
                      </div>
                    </div>

                    {companyData && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600 mb-2">Company Intelligence Active</div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">Industry: {companyData.industry}</Badge>
                          <Badge variant="secondary">Size: {companyData.size}</Badge>
                          <Badge variant="secondary">Difficulty: {companyData.difficulty}</Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                >
                  Previous
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 px-8"
                  disabled={loading || uploading}
                >
                  {loading ? (
                    <motion.div className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      Creating Enhanced Interview...
                    </motion.div>
                  ) : (
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center gap-2"
                    >
                      <Sparkles className="w-5 h-5" />
                      Create AI Interview
                    </motion.div>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  )
}

export default EnhancedInterviewCreationForm