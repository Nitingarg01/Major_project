'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Building2, Users, Code, Brain, Calculator, Target, Save, Play, CheckCircle, AlertTriangle, Zap, Trophy, Settings } from 'lucide-react'
import { toast } from 'sonner'

// Components
import IntroModal from './IntroModal'
import InterviewClientForm from './InterviewClientForm'
import DSACompiler from './DSACompiler'
import AptitudeQuiz from './AptitudeQuiz'
import AdvancedCameraMonitoring from './AdvancedCameraMonitoring'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'

// Services
import EnhancedInterviewAI from '@/lib/enhancedInterviewAI'
import SmartAIService from '@/lib/smartAIService'
import { Question, InterviewRound } from '@/types/interview'

interface ActivityAlert {
  type: 'multiple_faces' | 'no_face' | 'looking_away' | 'tab_switch' | 'window_focus_lost' | 'camera_blocked' | 'suspicious_movement';
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
}

interface InterviewRoundConfig {
  id: string;
  type: 'technical' | 'behavioral' | 'dsa' | 'aptitude';
  name: string;
  duration: number;
  questionCount: number;
  enabled: boolean;
  order: number;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
}

interface NewInterviewWrapperProps {
  questions: Question[];
  id: string;
  interviewType?: 'technical' | 'behavioral' | 'aptitude' | 'dsa' | 'mixed';
  companyName?: string;
  jobTitle?: string;
  experienceLevel?: 'entry' | 'mid' | 'senior';
  skills?: string[];
  userSelectedRounds?: string[]; // Array of round types user selected during creation
}

// Enhanced fallback DSA problems generator
const generateEnhancedFallbackDSA = (companyName: string, experienceLevel: string, count: number) => {
  const difficultyLevel = experienceLevel === 'entry' ? 'easy' : experienceLevel === 'senior' ? 'hard' : 'medium';
  
  const dsaTemplates = [
    {
      title: "Two Sum",
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      examples: [
        { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9" }
      ],
      testCases: [
        { id: "test1", input: "[2,7,11,15]\n9", expectedOutput: "[0,1]" },
        { id: "test2", input: "[3,2,4]\n6", expectedOutput: "[1,2]" },
        { id: "test3", input: "[3,3]\n6", expectedOutput: "[0,1]" }
      ],
      constraints: ["2 ≤ nums.length ≤ 10⁴", "-10⁹ ≤ nums[i] ≤ 10⁹", "Only one valid answer exists"],
      topics: ["Array", "Hash Table", "Two Pointers"]
    },
    {
      title: "Valid Parentheses",
      description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
      examples: [
        { input: 's = "()"', output: "true", explanation: "Valid parentheses structure" }
      ],
      testCases: [
        { id: "test1", input: "()", expectedOutput: "true" },
        { id: "test2", input: "()[]{}", expectedOutput: "true" },
        { id: "test3", input: "(]", expectedOutput: "false" }
      ],
      constraints: ["1 ≤ s.length ≤ 10⁴", "s consists of parentheses only"],
      topics: ["String", "Stack"]
    },
    {
      title: "Merge Two Sorted Lists",
      description: "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list.",
      examples: [
        { input: "list1 = [1,2,4], list2 = [1,3,4]", output: "[1,1,2,3,4,4]", explanation: "Merged sorted lists" }
      ],
      testCases: [
        { id: "test1", input: "[1,2,4]\n[1,3,4]", expectedOutput: "[1,1,2,3,4,4]" },
        { id: "test2", input: "[]\n[]", expectedOutput: "[]" },
        { id: "test3", input: "[]\n[0]", expectedOutput: "[0]" }
      ],
      constraints: ["0 ≤ list length ≤ 50", "-100 ≤ Node.val ≤ 100"],
      topics: ["Linked List", "Recursion"]
    },
    {
      title: "Maximum Subarray",
      description: "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
      examples: [
        { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "Subarray [4,-1,2,1] has sum 6" }
      ],
      testCases: [
        { id: "test1", input: "[-2,1,-3,4,-1,2,1,-5,4]", expectedOutput: "6" },
        { id: "test2", input: "[1]", expectedOutput: "1" },
        { id: "test3", input: "[5,4,-1,7,8]", expectedOutput: "23" }
      ],
      constraints: ["1 ≤ nums.length ≤ 10⁵", "-10⁴ ≤ nums[i] ≤ 10⁴"],
      topics: ["Array", "Dynamic Programming", "Kadane's Algorithm"]
    },
    {
      title: "Binary Tree Inorder Traversal",
      description: "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
      examples: [
        { input: "root = [1,null,2,3]", output: "[1,3,2]", explanation: "Inorder traversal: left, root, right" }
      ],
      testCases: [
        { id: "test1", input: "[1,null,2,3]", expectedOutput: "[1,3,2]" },
        { id: "test2", input: "[]", expectedOutput: "[]" },
        { id: "test3", input: "[1]", expectedOutput: "[1]" }
      ],
      constraints: ["0 ≤ number of nodes ≤ 100", "-100 ≤ Node.val ≤ 100"],
      topics: ["Tree", "Stack", "Binary Tree", "DFS"]
    }
  ];

  return dsaTemplates.slice(0, count).map((template, index) => ({
    id: `enhanced-dsa-${companyName.toLowerCase().replace(/\s+/g, '-')}-${index}-${Date.now()}`,
    title: `${template.title} - ${companyName} Challenge`,
    difficulty: difficultyLevel,
    description: `${template.description}\n\n💡 This problem is commonly asked at ${companyName} for ${experienceLevel} level positions.`,
    examples: template.examples,
    testCases: template.testCases,
    constraints: template.constraints,
    topics: template.topics,
    hints: [
      `Think about the optimal approach for this ${template.topics[0].toLowerCase()} problem`,
      `Consider time and space complexity requirements at ${companyName}`,
      "Write clean, readable code that follows best practices"
    ],
    timeComplexity: template.topics.includes('Array') ? 'O(n)' : 'O(n log n)',
    spaceComplexity: 'O(1) to O(n)',
    companyContext: `Popular problem type at ${companyName}`,
    provider: 'enhanced-fallback',
    generated: new Date().toISOString()
  }));
};

const DEFAULT_ROUND_CONFIGS: InterviewRoundConfig[] = [
  {
    id: 'technical',
    type: 'technical',
    name: 'Technical Interview',
    duration: 45,
    questionCount: 6,
    enabled: true,
    order: 1,
    icon: Code,
    description: 'Technical questions about programming, systems, and problem-solving',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'dsa',
    type: 'dsa',
    name: 'DSA & Coding',
    duration: 60,
    questionCount: 2,
    enabled: true,
    order: 2,
    icon: Calculator,
    description: 'Data structures, algorithms, and live coding challenges',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'behavioral',
    type: 'behavioral',
    name: 'Behavioral',
    duration: 30,
    questionCount: 5,
    enabled: true,
    order: 3,
    icon: Users,
    description: 'Communication, teamwork, and cultural fit questions',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'aptitude',
    type: 'aptitude',
    name: 'Aptitude Test',
    duration: 25,
    questionCount: 10,
    enabled: true,
    order: 4,
    icon: Brain,
    description: 'Logical reasoning, verbal, and numerical aptitude',
    color: 'from-orange-500 to-orange-600'
  }
];

const NewInterviewWrapper = ({
  questions,
  id,
  interviewType = 'mixed',
  companyName = 'TechCorp',
  jobTitle = 'Software Engineer',
  experienceLevel = 'mid',
  skills = ['JavaScript', 'React', 'Node.js'],
  userSelectedRounds = ['technical', 'dsa', 'behavioral', 'aptitude']
}: NewInterviewWrapperProps) => {
  // Core states
  const [started, setStarted] = useState(false)
  const [currentRound, setCurrentRound] = useState(0)
  const [cameraOn, setCameraOn] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isPaused, setIsPaused] = useState(false)

  // Interview data states
  const [roundConfigs, setRoundConfigs] = useState<InterviewRoundConfig[]>([])
  const [generatedQuestions, setGeneratedQuestions] = useState<{[roundType: string]: any[]}>({})
  const [companyData, setCompanyData] = useState<any>(null)
  const [currentRoundQuestions, setCurrentRoundQuestions] = useState<any[]>([])

  // Progress tracking
  const [activityAlerts, setActivityAlerts] = useState<ActivityAlert[]>([])
  const [interviewStartTime, setInterviewStartTime] = useState<Date | null>(null)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [roundTimeSpent, setRoundTimeSpent] = useState<{[roundId: string]: number}>({})
  const [completedRounds, setCompletedRounds] = useState<Set<string>>(new Set())
  const [roundProgress, setRoundProgress] = useState<{[roundId: string]: number}>({})

  // Initialize AI services
  const aiService = useMemo(() => EnhancedInterviewAI.getInstance(), [])
  const smartAIService = useMemo(() => SmartAIService.getInstance(), [])

  // Configure rounds based on user selection
  useEffect(() => {
    const configureRounds = () => {
      if (interviewType === 'mixed') {
        // Use user-selected rounds or default configuration
        const selectedRounds = DEFAULT_ROUND_CONFIGS
          .filter(config => userSelectedRounds.includes(config.type))
          .sort((a, b) => a.order - b.order)
          .map((config, index) => ({
            ...config,
            order: index + 1
          }))
        
        setRoundConfigs(selectedRounds)
      } else {
        // Single round interview
        const singleRound = DEFAULT_ROUND_CONFIGS.find(config => config.type === interviewType)
        if (singleRound) {
          setRoundConfigs([{
            ...singleRound,
            duration: 60,
            questionCount: 8,
            order: 1
          }])
        }
      }
    }

    configureRounds()
  }, [interviewType, userSelectedRounds])

  // Initialize interview session
  useEffect(() => {
    const initializeSession = async () => {
      if (roundConfigs.length === 0) return

      setIsLoading(true)
      try {
        // Research company
        const companyInfo = await aiService.researchCompany(companyName)
        setCompanyData(companyInfo)

        // Generate questions for all enabled rounds with timestamp to ensure uniqueness
        const timestamp = Date.now()
        const questionsResult: {[roundType: string]: any[]} = {}
        
        for (const round of roundConfigs) {
          if (!round.enabled) continue
          
          try {
            if (round.type === 'dsa') {
              // Generate DSA problems using SmartAIService with correct task type
              console.log(`🧮 Generating ${round.questionCount} DSA problems for ${companyName}...`);
              
              const result = await smartAIService.processRequest({
                task: 'dsa_generation',
                context: {
                  companyName,
                  jobTitle,
                  difficulty: experienceLevel === 'entry' ? 'easy' : experienceLevel === 'senior' ? 'hard' : 'medium',
                  count: round.questionCount,
                  experienceLevel
                }
              });
              
              if (result.success && Array.isArray(result.data) && result.data.length > 0) {
                questionsResult[round.type] = result.data;
                console.log(`✅ Generated ${result.data.length} DSA problems successfully`);
              } else {
                console.log('⚠️ DSA generation failed, using enhanced fallback problems');
                // Enhanced fallback DSA problems with proper format
                questionsResult[round.type] = generateEnhancedFallbackDSA(companyName, experienceLevel, round.questionCount);
              }
            } else if (round.type === 'aptitude') {
              // Generate aptitude questions - fallback for now
              const aptitudeQuestions = [
                {
                  id: `aptitude-1-${Date.now()}`,
                  question: `Aptitude Question 1: If a car travels 60 miles per hour for 2 hours, how far does it travel?`,
                  expectedAnswer: '120 miles',
                  category: 'aptitude',
                  difficulty: experienceLevel === 'entry' ? 'easy' : experienceLevel === 'senior' ? 'hard' : 'medium',
                  points: 10,
                  timeLimit: 5,
                  evaluationCriteria: ['Mathematical accuracy', 'Problem-solving approach'],
                  tags: ['aptitude', 'mathematics'],
                  hints: ['Use the formula: Distance = Speed × Time'],
                  companyRelevance: 5
                }
              ];
              questionsResult[round.type] = aptitudeQuestions
            } else {
              // Generate regular interview questions
              const roundQuestions = await aiService.generateInterviewQuestions({
                companyName,
                jobTitle,
                skills,
                experienceLevel,
                rounds: [round] // Generate for this specific round
              })
              questionsResult[round.type] = roundQuestions[round.type] || []
            }
          } catch (roundError) {
            console.error(`Error generating ${round.type} questions:`, roundError)
            // Use fallback questions for this round
            questionsResult[round.type] = questions.slice(0, round.questionCount)
          }
        }

        setGeneratedQuestions(questionsResult)

        // Set initial round questions if available
        if (roundConfigs[0] && questionsResult[roundConfigs[0].type]) {
          setCurrentRoundQuestions(questionsResult[roundConfigs[0].type])
        }

        toast.success(`🎉 Interview prepared for ${companyName}! ${Object.keys(questionsResult).length} rounds ready.`)
      } catch (error) {
        console.error('Error initializing interview:', error)
        toast.error('Failed to initialize interview. Using fallback questions.')
        
        // Use provided questions as fallback
        const fallbackQuestions = {
          [roundConfigs[0]?.type || 'technical']: questions
        }
        setGeneratedQuestions(fallbackQuestions)
        setCurrentRoundQuestions(questions)
      } finally {
        setIsLoading(false)
      }
    }

    initializeSession()
  }, [roundConfigs, aiService, smartAIService, companyName, jobTitle, skills, experienceLevel, questions])

  // Handle interview start
  const handleStart = useCallback(() => {
    setStarted(true)
    setInterviewStartTime(new Date())
    toast.success('Interview started! Good luck!')
  }, [])

  // Handle activity detection (moderate monitoring)
  const handleActivityDetected = useCallback((activity: ActivityAlert) => {
    setActivityAlerts(prev => [...prev.slice(-9), activity])
    
    // Only show alerts, don't pause interview (moderate monitoring)
    if (activity.severity === 'high') {
      toast.warning(`⚠️ ${activity.message}`)
    }
  }, [])

  // Handle round switching
  const handleRoundSwitch = useCallback((roundIndex: number) => {
    if (roundIndex < 0 || roundIndex >= roundConfigs.length) return

    const targetRound = roundConfigs[roundIndex]
    
    // Save current round time
    if (interviewStartTime && currentRound < roundConfigs.length) {
      const currentTime = Math.floor((new Date().getTime() - interviewStartTime.getTime()) / 1000)
      const existingTime = Object.values(roundTimeSpent).reduce((sum, time) => sum + time, 0)
      const roundTime = currentTime - existingTime
      
      setRoundTimeSpent(prev => ({
        ...prev,
        [roundConfigs[currentRound].id]: roundTime
      }))
    }

    setCurrentRound(roundIndex)
    
    // Load questions for new round
    if (generatedQuestions[targetRound.type]) {
      setCurrentRoundQuestions(generatedQuestions[targetRound.type])
    }

    // Clear activity alerts for new round
    setActivityAlerts([])
    
    toast.success(`Switched to ${targetRound.name}`)
  }, [roundConfigs, currentRound, interviewStartTime, roundTimeSpent, generatedQuestions])

  // Handle round completion
  const handleRoundComplete = useCallback(async (answers: any[], timeSpent: number) => {
    if (currentRound >= roundConfigs.length) return

    const currentRoundConfig = roundConfigs[currentRound]
    
    // Mark round as completed
    setCompletedRounds(prev => new Set([...prev, currentRoundConfig.id]))
    setRoundProgress(prev => ({
      ...prev,
      [currentRoundConfig.id]: 100
    }))

    // Update time tracking
    setRoundTimeSpent(prev => ({
      ...prev,
      [currentRoundConfig.id]: timeSpent
    }))

    toast.success(`${currentRoundConfig.name} completed!`)

    // Auto-advance to next round or complete interview
    if (currentRound + 1 < roundConfigs.length) {
      setTimeout(() => handleRoundSwitch(currentRound + 1), 1500)
    } else {
      // Interview completed
      toast.success('🎉 Interview completed! Generating feedback...')
      
      setTimeout(() => {
        window.location.href = `/interview/${id}/feedback`
      }, 2000)
    }
  }, [currentRound, roundConfigs, handleRoundSwitch, id])

  // Timer management
  useEffect(() => {
    if (!started || isPaused || !interviewStartTime) return

    const interval = setInterval(() => {
      setTimeElapsed(Math.floor((new Date().getTime() - interviewStartTime.getTime()) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [started, isPaused, interviewStartTime])

  // Helper functions
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const calculateProgress = () => {
    const totalRounds = roundConfigs.length
    const completedCount = completedRounds.size
    const currentProgress = currentRound < totalRounds ? (currentRound / totalRounds) * 100 : 100
    return Math.min(100, currentProgress + (completedCount / totalRounds) * 100)
  }

  const getCurrentRoundComponent = () => {
    if (currentRound >= roundConfigs.length) {
      return <div className="text-center p-8">Interview completed!</div>
    }

    const currentRoundConfig = roundConfigs[currentRound]
    const currentRoundQuestions = questions[currentRoundConfig.type] || []

    try {
      switch (currentRoundConfig.type) {
        case 'dsa':
          // Ensure we have DSA problems and pass the first one to DSACompiler
          const dsaProblems = currentRoundQuestions || []
        let dsaProblem = dsaProblems.length > 0 ? dsaProblems[0] : null
        
        // Debug logging to identify the issue
        console.log('DSA Problems:', dsaProblems)
        console.log('Selected DSA Problem:', dsaProblem)
        
        // Validate and sanitize the DSA problem structure
        if (dsaProblem && typeof dsaProblem === 'object') {
          try {
            // Check if it has the expected DSAProblem structure
            if (!dsaProblem.title || !dsaProblem.description) {
              console.warn('Invalid DSA problem structure, using fallback')
              dsaProblem = null
            } else {
              // Create a clean, serializable version of the DSA problem
              // This prevents React rendering issues with complex nested objects
              dsaProblem = {
                id: String(dsaProblem.id || 'fallback-dsa'),
                title: String(dsaProblem.title || 'Coding Challenge'),
                description: String(dsaProblem.description || 'Solve this coding problem'),
                difficulty: String(dsaProblem.difficulty || 'medium'),
                examples: Array.isArray(dsaProblem.examples) ? dsaProblem.examples.map(ex => ({
                  input: String(ex.input || ''),
                  output: String(ex.output || ''),
                  explanation: String(ex.explanation || '')
                })) : [],
                testCases: Array.isArray(dsaProblem.testCases) ? dsaProblem.testCases.map(tc => ({
                  id: String(tc.id || ''),
                  input: String(tc.input || ''),
                  expectedOutput: String(tc.expectedOutput || '')
                })) : [],
                constraints: Array.isArray(dsaProblem.constraints) ? dsaProblem.constraints.map(c => String(c)) : [],
                topics: Array.isArray(dsaProblem.topics) ? dsaProblem.topics.map(t => String(t)) : ['Programming'],
                hints: Array.isArray(dsaProblem.hints) ? dsaProblem.hints.map(h => String(h)) : []
              }
            }
          } catch (sanitizeError) {
            console.error('Error sanitizing DSA problem:', sanitizeError)
            dsaProblem = null
          }
        }
        
        return (
          <DSACompiler
            problem={dsaProblem}
            onSubmit={(code, results) => handleRoundComplete([code], results.timeSpent || 0)}
            timeLimit={currentRoundConfig.duration}
          />
        )
      
      case 'aptitude':
        return (
          <AptitudeQuiz
            questions={currentRoundQuestions || []}
            onComplete={(results) => handleRoundComplete(results, results.timeSpent || 0)}
            timeLimit={currentRoundConfig.duration}
          />
        )
      
      default:
        return (
          <InterviewClientForm 
            questions={currentRoundQuestions || []} 
            id={id}
            roundId={currentRoundConfig.id}
            onRoundComplete={handleRoundComplete}
          />
        )
      }
    } catch (error) {
      console.error('Error rendering round component:', error)
      return (
        <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Component Error</h3>
          <p className="text-red-600 mb-4">
            There was an issue loading this interview round. Please try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Refresh Page
          </button>
        </div>
      )
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6"
          />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Preparing Your Interview
          </h2>
          <p className="text-gray-600 mb-2">
            🔍 Researching {companyName}...
          </p>
          <p className="text-gray-600 mb-2">
            🧠 Generating tailored questions...
          </p>
          <p className="text-gray-600">
            ⚡ Setting up advanced monitoring...
          </p>
        </div>
      </div>
    )
  }

  // Intro modal
  if (!started) {
    return (
      <IntroModal 
        onStart={handleStart}
        companyName={companyName}
        jobTitle={jobTitle}
        interviewType={interviewType}
        estimatedDuration={roundConfigs.reduce((sum, round) => sum + round.duration, 0)}
        rounds={roundConfigs.map(config => ({
          id: config.id,
          type: config.type,
          status: 'pending' as const,
          questions: generatedQuestions[config.type] || [],
          duration: config.duration
        }))}
        companyIntelligence={companyData}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <div className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  {companyName} - {jobTitle}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    Round {currentRound + 1} of {roundConfigs.length}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTime(timeElapsed)}
                  </span>
                  {companyData && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      {companyData.difficulty} difficulty
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Progress</div>
                <div className="flex items-center gap-2">
                  <Progress value={calculateProgress()} className="w-24" />
                  <span className="text-sm font-medium">{Math.round(calculateProgress())}%</span>
                </div>
              </div>

              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Auto-Save Active
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Round Navigation */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Interview Rounds</h3>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {completedRounds.size} of {roundConfigs.length} completed
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {roundConfigs.map((round, index) => {
                const Icon = round.icon
                const isActive = index === currentRound
                const isCompleted = completedRounds.has(round.id)
                const canAccess = index <= currentRound || isCompleted

                return (
                  <motion.button
                    key={round.id}
                    whileHover={canAccess ? { scale: 1.02 } : {}}
                    whileTap={canAccess ? { scale: 0.98 } : {}}
                    onClick={() => canAccess && handleRoundSwitch(index)}
                    disabled={!canAccess}
                    className={`p-4 rounded-lg text-left transition-all ${
                      isActive 
                        ? `bg-gradient-to-r ${round.color} text-white shadow-lg`
                        : isCompleted
                        ? 'bg-green-50 border-2 border-green-200 text-green-800 hover:bg-green-100'
                        : canAccess
                        ? 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100'
                        : 'bg-gray-50 border-2 border-gray-200 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-5 h-5" />
                      <span className="font-semibold">{round.name}</span>
                      {isCompleted && <CheckCircle className="w-4 h-4 ml-auto" />}
                    </div>
                    <div className={`text-sm ${isActive ? 'text-white/90' : 'text-gray-600'}`}>
                      {round.duration} min • {round.questionCount} questions
                    </div>
                    {roundTimeSpent[round.id] && (
                      <div className={`text-xs mt-1 ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                        Time spent: {formatTime(roundTimeSpent[round.id])}
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Camera and Monitoring - Left Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-4">
              <AdvancedCameraMonitoring
                cameraOn={cameraOn}
                setCameraOn={setCameraOn}
                onActivityDetected={handleActivityDetected}
                isInterviewActive={started}
                monitoringLevel="moderate"
              />
              
              {/* Company Intelligence */}
              {companyData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        💡 {companyName} Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="font-medium">Industry:</span>
                          <span className="ml-2 text-gray-600">{companyData.industry}</span>
                        </div>
                        <div>
                          <span className="font-medium">Size:</span>
                          <span className="ml-2 text-gray-600">{companyData.size}</span>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="font-medium mb-1">Key Tech:</div>
                          <div className="flex flex-wrap gap-1">
                            {companyData.techStack.slice(0, 4).map((tech: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="font-medium mb-1">Quick Tip:</div>
                          <p className="text-gray-700">
                            {companyData.preparationTips[0]}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>

          {/* Interview Content - Right Columns */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={`round-${currentRound}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                {getCurrentRoundComponent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewInterviewWrapper