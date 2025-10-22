'use client'
import React, { useEffect, useState, useCallback } from 'react';
import IntroModal from './IntroModal';
import InterviewClientForm from './InterviewClientForm';
import DSACompiler from './DSACompiler';
import AptitudeQuiz from './AptitudeQuiz';
import EnhancedRoundSwitcher from './EnhancedRoundSwitcher';
import { Question, InterviewRound } from '@/types/interview';
import EnhancedCameraFeed from './EnhancedCameraFeed';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Clock, AlertTriangle, CheckCircle, Building2, Users, Brain, Target, Code, Calculator, Zap, Trophy, Save, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';
import EnhancedRoundManager, { InterviewSession, RoundResult } from '@/lib/enhancedRoundManager';
import CompanyIntelligenceService from '@/lib/companyIntelligence';
import { motion, AnimatePresence } from 'framer-motion';

interface ActivityAlert {
  type: 'multiple_faces' | 'no_face' | 'looking_away' | 'tab_switch' | 'window_focus_lost';
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date
}

interface SuperEnhancedInterviewWrapperProps {
  questions: Question[];
  id: string;
  interviewType?: 'technical' | 'behavioral' | 'aptitude' | 'dsa' | 'mixed';
  rounds?: InterviewRound[];
  companyName?: string;
  jobTitle?: string
}

// Sample DSA problems for the DSA round
const sampleDSAProblems = [;
  {
    id: 'two-sum';
    title: 'Two Sum';
    difficulty: 'easy' as const;
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    examples: [
      {
        input: '[2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].';
      }
    ],
    testCases: [
      { id: '1', input: '[2,7,11,15]\n9', expectedOutput: '[0,1]' },
      { id: '2', input: '[3,2,4]\n6', expectedOutput: '[1,2]' },
      { id: '3', input: '[3,3]\n6', expectedOutput: '[0,1]' }
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
      'For each number, check if target - number exists in your hash map'
    ]
  }
]

// Sample aptitude questions
const sampleAptitudeQuestions = [;
  {
    id: 'verbal-1';
    type: 'verbal' as const;
    question: 'Choose the word that best completes the sentence: "The new policy will _____ significant changes in the workflow."';
    options: ['necessitate', 'alleviate', 'deteriorate', 'fabricate'],
    correctAnswer: 0;
    explanation: 'Necessitate means to make necessary as a result or consequence, which fits the context.',
    difficulty: 'medium' as const;
    timeLimit: 60
  },
  {
    id: 'numerical-1';
    type: 'numerical' as const;
    question: 'If a product costs $80 after a 20% discount, what was the original price?',
    options: ['$96', '$100', '$104', '$120'],
    correctAnswer: 1;
    explanation: 'If $80 is 80% of the original price, then original price = $80 ÷ 0.8 = $100',
    difficulty: 'medium' as const;
    timeLimit: 90
  },
  {
    id: 'logical-1';
    type: 'logical' as const;
    question: 'All roses are flowers. Some flowers fade quickly. Therefore:';
    options: [
      'All roses fade quickly',
      'Some roses fade quickly',
      'No roses fade quickly',
      'Cannot be determined'
    ],
    correctAnswer: 3;
    explanation: 'We cannot determine if roses specifically fade quickly based on the given information.';
    difficulty: 'medium' as const;
    timeLimit: 75
  },
  {
    id: 'spatial-1';
    type: 'spatial' as const;
    question: 'Which shape comes next in the sequence: Circle, Square, Triangle, Circle, Square, ?',
    options: ['Circle', 'Square', 'Triangle', 'Pentagon'],
    correctAnswer: 2;
    explanation: 'The pattern repeats every 3 shapes: Circle, Square, Triangle.',
    difficulty: 'easy' as const;
    timeLimit: 45
  }
]

const SuperEnhancedInterviewWrapper = ({ 
  questions, 
  id, 
  interviewType = 'mixed',
  rounds,
  companyName = 'TechCorp',
  jobTitle = 'Software Engineer';
}: SuperEnhancedInterviewWrapperProps) => {
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
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create enhanced rounds based on interview type
    const enhancedRounds: InterviewRound[] = [];
    
    if (interviewType === 'mixed') {
      // Technical Round
      enhancedRounds.push({
        id: 'technical-round';
        type: 'technical';
        status: 'pending';
        questions: questions.filter(q => q.category === 'technical').slice(0, 5),
        duration: 45
      })
      
      // DSA Round
      enhancedRounds.push({
        id: 'dsa-round';
        type: 'dsa';
        status: 'pending';
        questions: [], // DSA uses problem format
        duration: 60
      })
      
      // Behavioral Round
      enhancedRounds.push({
        id: 'behavioral-round';
        type: 'behavioral';
        status: 'pending';
        questions: questions.filter(q => q.category === 'behavioral').slice(0, 4),
        duration: 30
      })
      
      // Aptitude Round
      enhancedRounds.push({
        id: 'aptitude-round';
        type: 'aptitude';
        status: 'pending';
        questions: [], // Aptitude uses quiz format
        duration: 25
      })
    } else {
      // Single round based on type
      enhancedRounds.push({
        id: `${interviewType}-round`,
        type: interviewType;
        status: 'pending';
        questions: questions.slice(0, 8),
        duration: 60
      })
    }

    return {
      sessionId,
      userId: 'current-user-id';
      interviewId: id;
      companyName,
      jobTitle,
      rounds: enhancedRounds;
      currentRound: 0;
      sessionData: {
        startTime: new Date(),
        totalTimeSpent: 0;
        overallProgress: 0
      },
      roundResults: [];
      companyIntelligence: intelligence;
      sessionMetadata: {
        userAgent: navigator.userAgent;
        ipAddress: '';
        cameraEnabled: cameraOn;
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

    // Start auto-save
    const interval = setInterval(autoSaveProgress, 30000) // Auto-save every 30 seconds
    setAutoSaveInterval(interval);
  }

  const autoSaveProgress = useCallback(() => {
    if (interviewSession) {
      // Here you would save progress to backend
      console.log('Auto-saving progress...', {
        sessionId: interviewSession.sessionId;
        currentRound,
        timeElapsed,
        activityAlerts: activityAlerts.length
      })
    }
  }, [interviewSession, currentRound, timeElapsed, activityAlerts])

  const handleActivityDetected = useCallback((activity: ActivityAlert) => {
    setActivityAlerts(prev => [...prev, activity]);
    
    // Auto-pause for high severity alerts
    if (activity.severity === 'high' && activity.type !== 'looking_away') {
      setIsPaused(true);
      setTimeout(() => setIsPaused(false), 5000) // Resume after 5 seconds
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

    // Save current round time
    if (interviewStartTime) {
      const currentTime = Math.floor((new Date().getTime() - interviewStartTime.getTime()) / 1000);
      const roundTime = currentTime - Object.values(roundTimeSpent).reduce((sum, time) => sum + time, 0);
      
      setRoundTimeSpent(prev => ({
        ...prev,
        [interviewSession.rounds[currentRound].id]: roundTime
      }))
    }

    setCurrentRound(roundIndex);
    
    // Update session
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
    toast.success(`Switched to ${updatedSession.rounds[roundIndex].type} round`);
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
      console.log('Completing round:', { answers, timeSpent });
      
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
        
        toast.success(`Round ${currentRound + 1} completed! Moving to next round...`);
      } else {
        // Interview completed - generate final report
        try {
          const finalReport = await roundManager.generateFinalReport(updatedSession);
          console.log('Final Interview Report:', finalReport);
          
          toast.success("Interview completed! Generating your feedback...");
          
          // Clean up auto-save
          if (autoSaveInterval) {
            clearInterval(autoSaveInterval);
          }
          
          // Redirect to feedback page
          setTimeout(() => {
            window.location.href = `/interview/${id}/feedback`;
          }, 2000)
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

  // Timer for interview
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

  // Browser security - prevent leaving during interview
  useEffect(() => {
    if (!started) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return 'Are you sure you want to leave? Your interview progress may be lost.';
    }

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      if (window.confirm('Are you sure you want to leave the interview? Your progress may be lost.')) {
        if (autoSaveInterval) {
          clearInterval(autoSaveInterval);
        }
        window.history.back()
      } else {
        window.history.pushState(null, '', window.location.href)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    window.history.pushState(null, '', window.location.href)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    }
  }, [started, autoSaveInterval])

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
        return (
          <DSACompiler
            problem={sampleDSAProblems[0]} // In real app, select based on difficulty/company
            onSubmit={handleRoundComplete}
            timeLimit={currentRoundData.duration}
          />
        )
      
      case 'aptitude':
        return (
          <AptitudeQuiz
            questions={sampleAptitudeQuestions}
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-lg text-gray-600">Preparing your {companyName} interview experience...</p>
          <p className="text-sm text-gray-500">Loading company-specific questions and insights</p>
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
        estimatedDuration={interviewSession?.rounds.reduce((sum, round) => sum + round.duration, 0) || 90}
        rounds={interviewSession?.rounds || []}
        companyIntelligence={companyIntelligence}
      />
    )
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Enhanced Interview Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  {companyName} - {jobTitle}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Round {currentRound + 1} of {interviewSession?.rounds.length || 1}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTime(timeElapsed)}
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
                  className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                >
                  <AlertTriangle className="w-4 h-4" />
                  PAUSED - Suspicious Activity
                </motion.div>
              )}
              
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
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Round Switcher */}
        <div className="mb-6">
          <EnhancedRoundSwitcher
            rounds={interviewSession?.rounds || []}
            currentRound={currentRound}
            onRoundSwitch={handleRoundSwitch}
            canSwitchToRound={canSwitchToRound}
            timeSpent={roundTimeSpent}
            totalTimeLimit={interviewSession?.rounds.reduce((sum, round) => sum + round.duration, 0) || 90}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Camera Feed - Left Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <EnhancedCameraFeed 
                cameraOn={cameraOn} 
                setCameraOn={setCameraOn}
                onActivityDetected={handleActivityDetected}
                isInterviewActive={started}
              />
              
              {/* Company Tips */}
              {companyIntelligence && companyIntelligence.companyData.preparationTips.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200"
                >
                  <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    💡 {companyName} Tips
                  </h4>
                  <p className="text-xs text-green-700">
                    {companyIntelligence.companyData.preparationTips[0]}
                  </p>
                </motion.div>
              )}
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
                  className="flex flex-col items-center justify-center p-12 bg-gradient-to-r from-yellow-50 to-red-50 border-2 border-yellow-200 rounded-lg"
                >
                  <AlertTriangle className="w-16 h-16 text-yellow-600 mb-6" />
                  <h3 className="text-2xl font-bold text-yellow-800 mb-4">Interview Paused</h3>
                  <p className="text-yellow-700 text-center max-w-md mb-6">
                    Suspicious activity detected. Please ensure you're following interview guidelines.
                    The interview will resume automatically.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-yellow-600">
                    <Clock className="w-4 h-4" />
                    <span>Resuming in a few seconds...</span>
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

export default SuperEnhancedInterviewWrapper;