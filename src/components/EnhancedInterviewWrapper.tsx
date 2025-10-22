'use client'
import React, { useEffect, useState, useCallback } from 'react';
import IntroModal from './IntroModal';
import InterviewClientForm from './InterviewClientForm';
import AdvancedDSACompiler from './AdvancedDSACompiler';
import AptitudeQuiz from './AptitudeQuiz';
import EnhancedRoundSwitcher from './EnhancedRoundSwitcher';
import { Question, InterviewRound } from '@/types/interview';
import AdvancedCameraFeed from './AdvancedCameraFeed';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Building2, 
  Users, 
  Brain, 
  Target, 
  Code, 
  Calculator, 
  Zap, 
  Trophy, 
  Save, 
  PlayCircle,
  Activity,
  Shield,
  TrendingUp
} from 'lucide-react'
import { toast } from 'sonner';
import EnhancedRoundManager, { InterviewSession, RoundResult } from '@/lib/enhancedRoundManager';
import CompanyIntelligenceService from '@/lib/companyIntelligence';
import { motion, AnimatePresence } from 'framer-motion';

interface ActivityAlert {
  type: 'multiple_faces' | 'no_face' | 'looking_away' | 'tab_switch' | 'window_focus_lost' | 'face_obscured',
  message: string,
  severity: 'low' | 'medium' | 'high',
  timestamp: Date,
  confidence?: number
}

interface EnhancedInterviewWrapperProps {
  questions: Question[],
  id: string,
  interviewType?: 'technical' | 'behavioral' | 'aptitude' | 'dsa' | 'mixed',
  rounds?: InterviewRound[],
  companyName?: string,
  jobTitle?: string
}

// Enhanced DSA problems with better complexity
const enhancedDSAProblems = [;
  {
    id: 'two-sum-enhanced',
    title: 'Two Sum',
    difficulty: 'easy' as const,
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    examples: [
      {
        input: '[2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].';
      },
      {
        input: '[3,2,4], target = 6',
        output: '[1,2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].';
      }
    ],
    testCases: [
      { id: '1', input: '[2,7,11,15]\n9', expectedOutput: '[0,1]' },
      { id: '2', input: '[3,2,4]\n6', expectedOutput: '[1,2]' },
      { id: '3', input: '[3,3]\n6', expectedOutput: '[0,1]' },
      { id: '4', input: '[1,2,3,4,5]\n8', expectedOutput: '[2,4]' },
      { id: '5', input: '[-1,-2,-3,-4,-5]\n-8', expectedOutput: '[2,4]' }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    topics: ['Array', 'Hash Table'],
    hints: [
      'Try using a hash map to store the numbers you\'ve seen',
      'For each number, check if target - number exists in your hash map',
      'Think about the time complexity - can you do better than O(n²)?'
    ],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    companies: ['Amazon', 'Google', 'Microsoft', 'Facebook']
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'easy' as const,
    description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets, and open brackets must be closed in the correct order.',
    examples: [
      {
        input: '"()"',
        output: 'true',
        explanation: 'The string contains valid parentheses.'
      },
      {
        input: '"()[]{}"',
        output: 'true',
        explanation: 'All brackets are properly matched.'
      },
      {
        input: '"(]"',
        output: 'false',
        explanation: 'Mismatched bracket types.'
      }
    ],
    testCases: [
      { id: '1', input: '"()"', expectedOutput: 'true' },
      { id: '2', input: '"()[]{}"', expectedOutput: 'true' },
      { id: '3', input: '"(]"', expectedOutput: 'false' },
      { id: '4', input: '"([)]"', expectedOutput: 'false' },
      { id: '5', input: '"{[]}"', expectedOutput: 'true' }
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\''
    ],
    topics: ['String', 'Stack'],
    hints: [
      'Use a stack data structure',
      'Push opening brackets onto the stack',
      'When you see a closing bracket, check if it matches the top of the stack'
    ],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    companies: ['Google', 'Amazon', 'Microsoft', 'Bloomberg']
  }
]

// Enhanced aptitude questions with better variety
const enhancedAptitudeQuestions = [;
  {
    id: 'verbal-1-enhanced',
    type: 'verbal' as const,
    question: 'Choose the word that best completes the sentence: "The CEO\'s _____ approach to innovation has transformed the company\'s competitive position."',
    options: ['conventional', 'pioneering', 'reluctant', 'arbitrary'],
    correctAnswer: 1,
    explanation: 'Pioneering means being among the first to explore or settle a new area of knowledge or activity, which fits with transforming competitive position.',
    difficulty: 'medium' as const,
    timeLimit: 75
  },
  {
    id: 'numerical-1-enhanced',
    type: 'numerical' as const,
    question: 'A company\'s revenue increased by 25% in Q1, then decreased by 20% in Q2. If the final revenue is $60,000, what was the original revenue?',
    options: ['$48,000', '$50,000', '$60,000', '$75,000'],
    correctAnswer: 2,
    explanation: 'Let x be original revenue. After Q1: x × 1.25. After Q2: x × 1.25 × 0.8 = x × 1.0 = x. So original revenue was $60,000.',
    difficulty: 'hard' as const,
    timeLimit: 120
  },
  {
    id: 'logical-1-enhanced',
    type: 'logical' as const,
    question: 'In a tech company: All software engineers use version control. Some version control users work on mobile apps. Sarah works on mobile apps. Therefore:',
    options: [
      'Sarah is a software engineer',
      'Sarah uses version control',
      'All mobile app developers are software engineers',
      'Cannot be determined from given information'
    ],
    correctAnswer: 3,
    explanation: 'We cannot definitively conclude any of the first three options from the given premises. Sarah works on mobile apps, but we don\'t know if she\'s a software engineer or uses version control.',
    difficulty: 'hard' as const,
    timeLimit: 90
  },
  {
    id: 'spatial-1-enhanced',
    type: 'spatial' as const,
    question: 'A 3D cube is painted red on all faces, then cut into 27 smaller equal cubes. How many of the smaller cubes will have exactly 2 red faces?',
    options: ['8', '12', '6', '4'],
    correctAnswer: 1,
    explanation: 'The cubes with exactly 2 red faces are the edge cubes (not corners or centers). A 3×3×3 cube has 12 edge cubes.',
    difficulty: 'hard' as const,
    timeLimit: 120
  },
  {
    id: 'pattern-1-enhanced',
    type: 'logical' as const,
    question: 'What comes next in the sequence: 2, 6, 12, 20, 30, ?',
    options: ['40', '42', '44', '46'],
    correctAnswer: 1,
    explanation: 'The differences are 4, 6, 8, 10, so the next difference is 12. 30 + 12 = 42.',
    difficulty: 'medium' as const,
    timeLimit: 90
  }
]

const EnhancedInterviewWrapper = ({ 
  questions, 
  id, 
  interviewType = 'mixed',
  rounds,
  companyName = 'TechCorp',
  jobTitle = 'Software Engineer';
}: EnhancedInterviewWrapperProps) => {
  const [started, setStarted] = useState<boolean>(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [currentRound, setCurrentRound] = useState(0);
  const [activityAlerts, setActivityAlerts] = useState<ActivityAlert[]>([]);
  const [interviewStartTime, setInterviewStartTime] = useState<Date | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [interviewSession, setInterviewSession] = useState<InterviewSession | null>(null);
  const [companyIntelligence, setCompanyIntelligence] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [roundTimeSpent, setRoundTimeSpent] = useState<{ [roundId: string]: number }>({});
  const [autoSaveInterval, setAutoSaveInterval] = useState<NodeJS.Timeout | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    questionsAnswered: 0,
    averageTimePerQuestion: 0,
    accuracyScore: 0,
    focusScore: 100
  })

  const roundManager = EnhancedRoundManager.getInstance();
  const intelligenceService = CompanyIntelligenceService.getInstance();

  // Initialize enhanced session
  useEffect(() => {
    const initializeEnhancedSession = async () => {
      setIsLoading(true);
      try {
        // Get company intelligence
        const intelligence = await intelligenceService.getCompanyIntelligence(companyName);
        setCompanyIntelligence(intelligence);

        // Initialize enhanced interview session with dynamic rounds
        const session = await createEnhancedSession(intelligence);
        setInterviewSession(session);
      } catch (error) {
        console.error('Error initializing enhanced session:', error);
        toast.error('Failed to initialize interview session');
      } finally {
        setIsLoading(false);
      }
    }

    initializeEnhancedSession();
  }, [companyName, jobTitle, interviewType, id])

  const createEnhancedSession = async (intelligence: any): Promise<InterviewSession> => {
    const sessionId = `enhanced_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create enhanced rounds based on interview type and company intelligence
    const enhancedRounds: InterviewRound[] = [],
    
    if (interviewType === 'mixed') {
      // Technical Round - Enhanced based on company focus
      enhancedRounds.push({
        id: 'technical-round-enhanced',
        type: 'technical',
        status: 'pending',
        questions: questions.filter(q => q.category === 'technical').slice(0, 6),
        duration: 50 // Increased duration for thorough assessment
      })
      
      // DSA Round - Company-specific problems
      enhancedRounds.push({
        id: 'dsa-round-enhanced',
        type: 'dsa',
        status: 'pending',
        questions: [], // DSA uses problem format
        duration: 75 // Increased for complex problems
      })
      
      // Behavioral Round - Company culture focused
      enhancedRounds.push({
        id: 'behavioral-round-enhanced',
        type: 'behavioral',
        status: 'pending',
        questions: questions.filter(q => q.category === 'behavioral').slice(0, 5),
        duration: 35
      })
      
      // Aptitude Round - Industry specific
      enhancedRounds.push({
        id: 'aptitude-round-enhanced',
        type: 'aptitude',
        status: 'pending',
        questions: [], // Aptitude uses quiz format
        duration: 30
      })
    } else {
      // Single round based on type with enhanced duration
      const duration = getDurationForType(interviewType);
      enhancedRounds.push({
        id: `${interviewType}-round-enhanced`,
        type: interviewType,
        status: 'pending',
        questions: questions.slice(0, getQuestionCountForType(interviewType)),
        duration
      })
    }

    return {
      sessionId,
      userId: 'current-user-id',
      interviewId: id,
      companyName,
      jobTitle,
      rounds: enhancedRounds,
      currentRound: 0,
      sessionData: {
        startTime: new Date(),
        totalTimeSpent: 0,
        overallProgress: 0
      },
      roundResults: [],
      companyIntelligence: intelligence,
      sessionMetadata: {
        userAgent: navigator.userAgent,
        ipAddress: '',
        cameraEnabled: cameraOn,
        suspiciousActivity: []
      }
    }
  }

  const handleStart = () => {
    setStarted(true);
    setInterviewStartTime(new Date());
    
    // Mark first round as in-progress
    if (interviewSession) {
      const updatedSession = { ...interviewSession }
      if (updatedSession.rounds[0]) {
        updatedSession.rounds[0].status = 'in-progress';
        setInterviewSession(updatedSession);
      }
    }

    // Start auto-save and performance tracking
    const interval = setInterval(() => {
      autoSaveProgress();
      updatePerformanceMetrics();
    }, 20000) // Every 20 seconds
    setAutoSaveInterval(interval);

    toast.success('🚀 Enhanced interview session started!', {
      description: 'Your progress is being automatically saved'
    })
  }

  const autoSaveProgress = useCallback(() => {
    if (interviewSession) {
      const progress = {
        sessionId: interviewSession.sessionId,
        currentRound,
        timeElapsed,
        activityAlerts: activityAlerts.length,
        performanceMetrics,
        timestamp: new Date()
      }
      
      // Save to localStorage as backup
      localStorage.setItem(`interview_progress_${id}`, JSON.stringify(progress));
      
      console.log('Auto-saved enhanced progress:', progress)
    }
  }, [interviewSession, currentRound, timeElapsed, activityAlerts, performanceMetrics, id])

  const updatePerformanceMetrics = useCallback(() => {
    if (!interviewStartTime) return
    
    const currentTime = new Date();
    const totalTime = (currentTime.getTime() - interviewStartTime.getTime()) / 1000;
    const highSeverityAlerts = activityAlerts.filter(a => a.severity === 'high').length;
    
    setPerformanceMetrics(prev => ({
      ...prev,
      averageTimePerQuestion: totalTime / Math.max(1, prev.questionsAnswered),
      focusScore: Math.max(0, 100 - (highSeverityAlerts * 10))
    }))
  }, [interviewStartTime, activityAlerts])

  const handleActivityDetected = useCallback((activity: ActivityAlert) => {
    setActivityAlerts(prev => [...prev, activity]);
    
    // Enhanced activity handling
    if (activity.severity === 'high') {
      if (activity.type === 'tab_switch' || activity.type === 'window_focus_lost') {
        setIsPaused(true);
        toast.warning('⚠️ Interview paused - Please return focus to the interview', {
          description: 'The interview will resume automatically in 10 seconds'
        })
        setTimeout(() => setIsPaused(false), 10000) // Resume after 10 seconds
      } else if (activity.type === 'multiple_faces') {
        toast.error('🚨 Multiple people detected in camera', {
          description: 'Please ensure only you are visible in the camera'
        })
      } else if (activity.type === 'no_face') {
        toast.error('📷 No face detected', {
          description: 'Please position yourself properly in front of the camera'
        })
      }
    } else if (activity.severity === 'medium') {
      if (activity.type === 'looking_away') {
        toast.warning('👀 Please look at the screen', {
          description: 'Maintain eye contact with the camera for better evaluation'
        })
      }
    }
  }, [])

  const handleRoundSwitch = useCallback((roundIndex: number) => {
    if (!interviewSession || roundIndex < 0 || roundIndex >= interviewSession.rounds.length) {
      return
    }

    const canSwitch = canSwitchToRound(roundIndex);
    if (!canSwitch) {
      toast.error('This round is not available yet. Complete previous rounds first.');
      return
    }

    // Save current round time with enhanced tracking
    if (interviewStartTime) {
      const currentTime = Math.floor((new Date().getTime() - interviewStartTime.getTime()) / 1000);
      const roundTime = currentTime - Object.values(roundTimeSpent).reduce((sum, time) => sum + time, 0);
      
      setRoundTimeSpent(prev => ({
        ...prev,
        [interviewSession.rounds[currentRound].id]: roundTime
      }))
    }

    setCurrentRound(roundIndex);
    
    // Update session with enhanced state tracking
    const updatedSession = { ...interviewSession }
    
    // Mark previous round as completed if switching forward
    if (roundIndex > currentRound) {
      for (let i = currentRound; i < roundIndex; i++) {
        if (updatedSession.rounds[i].status === 'in-progress') {
          updatedSession.rounds[i].status = 'completed';
        }
      }
    }
    
    // Mark new round as in-progress
    if (updatedSession.rounds[roundIndex].status === 'pending') {
      updatedSession.rounds[roundIndex].status = 'in-progress';
    }
    
    setInterviewSession(updatedSession);
    
    // Clear alerts for new round
    setActivityAlerts([]);
    
    toast.success(`🎯 Switched to ${updatedSession.rounds[roundIndex].type} round`, {
      description: `Round ${roundIndex + 1} of ${updatedSession.rounds.length}`
    })
  }, [interviewSession, currentRound, interviewStartTime, roundTimeSpent])

  const canSwitchToRound = useCallback((roundIndex: number): boolean => {
    if (!interviewSession) return false
    
    const round = interviewSession.rounds[roundIndex];
    if (!round) return false
    
    // Can switch to current round or completed rounds
    if (roundIndex <= currentRound) return true;
    
    // Can switch to next round if current round has some progress
    if (roundIndex === currentRound + 1) {
      const currentRoundStatus = interviewSession.rounds[currentRound]?.status;
      return currentRoundStatus === 'in-progress' || currentRoundStatus === 'completed';
    }
    
    // Can't skip ahead more than one round
    return false;
  }, [interviewSession, currentRound])

  const handleRoundComplete = async (answers: string[] | any, timeSpent: number) => {
    if (!interviewSession) return

    try {
      console.log('Completing enhanced round:', { answers, timeSpent });
      
      // Update performance metrics
      setPerformanceMetrics(prev => ({
        ...prev,
        questionsAnswered: prev.questionsAnswered + (Array.isArray(answers) ? answers.length : 1)
      }))
      
      // Update round time tracking
      setRoundTimeSpent(prev => ({
        ...prev,
        [interviewSession.rounds[currentRound].id]: timeSpent
      }))

      const { session: updatedSession, roundResult } = await roundManager.completeRound(
        interviewSession,
        Array.isArray(answers) ? answers : [JSON.stringify(answers)],
        timeSpent,
        activityAlerts.filter(alert => alert.severity === 'high');
      )

      setInterviewSession(updatedSession);
      
      // Move to next round if available
      if (updatedSession.currentRound < updatedSession.rounds.length) {
        setCurrentRound(updatedSession.currentRound);
        setActivityAlerts([]) // Clear alerts for new round
        
        toast.success(`✅ Round ${currentRound + 1} completed successfully!`, {
          description: `Score: ${roundResult.score}/10 | Moving to next round...`
        })
      } else {
        // Interview completed - generate final report
        try {
          toast.loading('Generating your comprehensive interview report...', {
            description: 'Please wait while we analyze your performance'
          })
          
          const finalReport = await roundManager.generateFinalReport(updatedSession);
          console.log('Enhanced Final Interview Report:', finalReport);
          
          toast.success('🎉 Interview completed successfully!', {
            description: `Overall Score: ${finalReport.overallScore}/10 | Redirecting to detailed feedback...`
          })
          
          // Clean up auto-save
          if (autoSaveInterval) {
            clearInterval(autoSaveInterval);
          }
          
          // Clear saved progress
          localStorage.removeItem(`interview_progress_${id}`);
          
          // Redirect to feedback page
          setTimeout(() => {
            window.location.href = `/interview/${id}/feedback`;
          }, 3000)
        } catch (error) {
          console.error('Error generating final report:', error);
          toast.error("Error generating feedback. Please check your results later.");
        }
      }
    } catch (error) {
      console.error('Error completing round:', error);
      toast.error("Error completing round. Please try again.");
    }
  }

  // Enhanced timer with better UX
  useEffect(() => {
    if (!started || isPaused || !interviewStartTime) return

    const interval = setInterval(() => {
      setTimeElapsed(Math.floor((new Date().getTime() - interviewStartTime.getTime()) / 1000));
    }, 1000)

    return () => clearInterval(interval);
  }, [started, isPaused, interviewStartTime])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
      }
    }
  }, [autoSaveInterval])

  // Enhanced browser security
  useEffect(() => {
    if (!started) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Are you sure you want to leave? Your interview progress will be saved but the session will end.';
      return 'Are you sure you want to leave? Your interview progress will be saved but the session will end.';
    }

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      if (window.confirm('Are you sure you want to leave the interview? Your progress will be saved.')) {
        autoSaveProgress() // Save before leaving
        if (autoSaveInterval) {
          clearInterval(autoSaveInterval);
        }
        window.history.back()
      } else {
        window.history.pushState(null, '', window.location.href)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent common shortcuts that might disrupt interview
      if (e.ctrlKey && (e.key === 'r' || e.key === 'w' || e.key === 't')) {
        e.preventDefault();
        toast.warning('Keyboard shortcuts are disabled during interview');
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    document.addEventListener('keydown', handleKeyDown);
    window.history.pushState(null, '', window.location.href)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('keydown', handleKeyDown);
    }
  }, [started, autoSaveInterval, autoSaveProgress])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  const getCurrentRoundComponent = () => {
    if (!interviewSession || !interviewSession.rounds[currentRound]) {
      return <div>Loading round...</div>;
    }

    const currentRoundData = interviewSession.rounds[currentRound];

    switch (currentRoundData.type) {
      case 'dsa':
        const problemIndex = Math.floor(Math.random() * enhancedDSAProblems.length);
        return (
          <AdvancedDSACompiler
            problem={enhancedDSAProblems[problemIndex]}
            onSubmit={handleRoundComplete}
            timeLimit={currentRoundData.duration}
          />
        )
      
      case 'aptitude':
        return (
          <AptitudeQuiz
            questions={enhancedAptitudeQuestions}
            onComplete={(results) => handleRoundComplete(results, results.timeSpent || 0)}
            timeLimit={currentRoundData.duration}
          />
        )
      
      default:
        return (
          <InterviewClientForm 
            questions={currentRoundData.questions} 
            id={id}
            roundId={currentRoundData.id}
            onRoundComplete={handleRoundComplete}
          />
        )
    }
  }

  // Helper functions
  const getDurationForType = (type: string): number => {
    switch (type) {
      case 'technical': return 60
      case 'behavioral': return 40
      case 'dsa': return 90
      case 'aptitude': return 35
      default: return 60;
    }
  }

  const getQuestionCountForType = (type: string): number => {
    switch (type) {
      case 'technical': return 8
      case 'behavioral': return 6
      case 'dsa': return 3
      case 'aptitude': return 15
      default: return 8;
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6"
          />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Preparing Enhanced {companyName} Interview
          </h3>
          <p className="text-gray-600 mb-2">Loading company-specific questions and insights...</p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Brain className="w-4 h-4" />
            <span>AI-powered assessment initialization</span>
          </div>
        </div>
      </div>
    )
  }

  if (!started) {
    return (
      <IntroModal 
        onStart={handleStart}
        companyName={companyName}
        jobTitle={jobTitle}
        interviewType={interviewType}
        estimatedDuration={interviewSession?.rounds.reduce((sum, round) => sum + round.duration, 0) || 120}
        rounds={interviewSession?.rounds || []}
        companyIntelligence={companyIntelligence}
      />
    )
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Enhanced Interview Header */}
      <div className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-xl">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  {companyName} - {jobTitle}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    Round {currentRound + 1} of {interviewSession?.rounds.length || 1}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTime(timeElapsed)}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    Focus: {performanceMetrics.focusScore}%
                  </span>
                  {companyIntelligence && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      {companyIntelligence.companyData.difficulty} difficulty
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {isPaused && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                >
                  <AlertTriangle className="w-4 h-4" />
                  INTERVIEW PAUSED
                </motion.div>
              )}
              
              {/* Performance Indicators */}
              <div className="flex items-center gap-3 text-xs">
                <div className="text-center">
                  <div className="text-sm font-bold text-blue-600">
                    {performanceMetrics.questionsAnswered}
                  </div>
                  <div className="text-gray-500">Answered</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-green-600">
                    {performanceMetrics.focusScore}%
                  </div>
                  <div className="text-gray-500">Focus</div>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={autoSaveProgress}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Progress
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Interview Progress</span>
              <span>{Math.round(((currentRound + 1) / (interviewSession?.rounds.length || 1)) * 100)}%</span>
            </div>
            <Progress 
              value={((currentRound + 1) / (interviewSession?.rounds.length || 1)) * 100} 
              className="h-2"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Enhanced Round Switcher */}
        <div className="mb-6">
          <EnhancedRoundSwitcher
            rounds={interviewSession?.rounds || []}
            currentRound={currentRound}
            onRoundSwitch={handleRoundSwitch}
            canSwitchToRound={canSwitchToRound}
            timeSpent={roundTimeSpent}
            totalTimeLimit={interviewSession?.rounds.reduce((sum, round) => sum + round.duration, 0) || 120}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Enhanced Camera Feed - Left Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-4">
              <AdvancedCameraFeed 
                isRecording={started && cameraOn} 
                onRecordingChange={setCameraOn}
                onAnomalyDetected={(anomaly) => handleActivityDetected({ 
                  type: 'face_obscured', 
                  message: anomaly, 
                  severity: 'medium', 
                  timestamp: new Date() 
                })}
                enableFaceDetection={true}
                enableMisbehaviorDetection={true}
              />
              
              {/* Enhanced Company Tips */}
              {companyIntelligence && companyIntelligence.companyData.preparationTips.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200"
                >
                  <h4 className="text-sm font-medium text-green-800 mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    💡 {companyName} Success Tips
                  </h4>
                  <div className="space-y-2">
                    <p className="text-xs text-green-700">
                      {companyIntelligence.companyData.preparationTips[0]}
                    </p>
                    {companyIntelligence.companyData.preparationTips[1] && (
                      <p className="text-xs text-green-600 italic">
                        {companyIntelligence.companyData.preparationTips[1]}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Performance Summary */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Security Score:</span>
                    <span className={`font-medium ${performanceMetrics.focusScore >= 80 ? 'text-green-600' : performanceMetrics.focusScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>;
                      {performanceMetrics.focusScore}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Questions:</span>
                    <span className="font-medium text-blue-600">
                      {performanceMetrics.questionsAnswered}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Alerts:</span>
                    <span className={`font-medium ${activityAlerts.filter(a => a.severity === 'high').length === 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {activityAlerts.filter(a => a.severity === 'high').length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Interview Content - Right Columns */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {!isPaused ? (
                <motion.div
                  key={currentRound}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {getCurrentRoundComponent()}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center p-16 bg-gradient-to-r from-yellow-50 to-red-50 border-2 border-yellow-300 rounded-xl"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    <AlertTriangle className="w-20 h-20 text-yellow-600 mb-6" />
                  </motion.div>
                  <h3 className="text-3xl font-bold text-yellow-800 mb-4">Interview Paused</h3>
                  <p className="text-yellow-700 text-center max-w-md mb-6 text-lg">
                    The interview has been temporarily paused due to detected activity. 
                    Please follow the interview guidelines for a fair assessment.
                  </p>
                  <div className="flex items-center gap-2 text-yellow-600 bg-yellow-100 px-4 py-2 rounded-full">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">Resuming automatically...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedInterviewWrapper;