'use client'
import React, { useEffect, useState, useCallback } from 'react'
import IntroModal from './IntroModal'
import InterviewClientForm from './InterviewClientForm'
import { Question, InterviewRound } from '@/types/interview'
import EnhancedCameraFeed from './EnhancedCameraFeed'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Clock, AlertTriangle, CheckCircle, Circle, Building2, Users, Brain, Target } from 'lucide-react'
import { Button } from './ui/button'
import EnhancedRoundManager, { InterviewSession, RoundResult } from '@/lib/enhancedRoundManager'
import CompanyIntelligenceService from '@/lib/companyIntelligence'

interface ActivityAlert {
  type: 'multiple_faces' | 'no_face' | 'looking_away' | 'tab_switch' | 'window_focus_lost';
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
}

interface EnhancedInterviewWrapperProps {
  questions: Question[];
  id: string;
  interviewType?: 'technical' | 'behavioral' | 'aptitude' | 'dsa' | 'mixed';
  rounds?: InterviewRound[];
  companyName?: string;
  jobTitle?: string;
}

const EnhancedInterviewWrapper = ({ 
  questions, 
  id, 
  interviewType = 'mixed',
  rounds,
  companyName = 'TechCorp',
  jobTitle = 'Software Engineer'
}: EnhancedInterviewWrapperProps) => {
  const [started, setStarted] = useState<boolean>(false)
  const [cameraOn, setCameraOn] = useState(true)
  const [currentRound, setCurrentRound] = useState(0)
  const [activityAlerts, setActivityAlerts] = useState<ActivityAlert[]>([])
  const [interviewStartTime, setInterviewStartTime] = useState<Date | null>(null)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [interviewSession, setInterviewSession] = useState<InterviewSession | null>(null)
  const [companyIntelligence, setCompanyIntelligence] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const roundManager = EnhancedRoundManager.getInstance()
  const intelligenceService = CompanyIntelligenceService.getInstance()

  // Initialize enhanced session
  useEffect(() => {
    const initializeEnhancedSession = async () => {
      setIsLoading(true)
      try {
        // Get company intelligence
        const intelligence = await intelligenceService.getCompanyIntelligence(companyName)
        setCompanyIntelligence(intelligence)

        // Initialize enhanced interview session
        const session = await roundManager.initializeSession(
          'current-user-id', // Would come from auth
          id,
          companyName,
          jobTitle,
          interviewType
        )
        setInterviewSession(session)
      } catch (error) {
        console.error('Error initializing enhanced session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeEnhancedSession()
  }, [companyName, jobTitle, interviewType, id])

  const handleStart = () => {
    setStarted(true)
    setInterviewStartTime(new Date())
    
    // Mark first round as in-progress
    if (interviewSession) {
      const updatedSession = { ...interviewSession }
      updatedSession.rounds[0].status = 'in-progress'
      setInterviewSession(updatedSession)
    }
  }

  const handleActivityDetected = useCallback((activity: ActivityAlert) => {
    setActivityAlerts(prev => [...prev, activity])
    
    // Auto-pause for high severity alerts
    if (activity.severity === 'high' && activity.type !== 'looking_away') {
      setIsPaused(true)
      setTimeout(() => setIsPaused(false), 3000) // Resume after 3 seconds
    }
  }, [])

  // Enhanced round completion handler
  const handleRoundComplete = async (answers: string[], timeSpent: number) => {
    if (!interviewSession) return

    try {
      console.log('Completing round:', { answers, timeSpent })
      
      const { session: updatedSession, roundResult } = await roundManager.completeRound(
        interviewSession,
        answers,
        timeSpent,
        activityAlerts.filter(alert => alert.severity === 'high')
      )

      setInterviewSession(updatedSession)
      
      // Move to next round if available
      if (updatedSession.currentRound < updatedSession.rounds.length) {
        setCurrentRound(updatedSession.currentRound)
        setActivityAlerts([]) // Clear alerts for new round
        
        // Show transition message
        toast.success(`Round ${currentRound + 1} completed! Moving to next round...`)
      } else {
        // Interview completed - generate final report
        try {
          const finalReport = await roundManager.generateFinalReport(updatedSession)
          console.log('Final Interview Report:', finalReport)
          
          // Save the final report and redirect to feedback
          toast.success("Interview completed! Generating your feedback...")
          
          // Wait a moment then redirect to feedback page
          setTimeout(() => {
            window.location.href = `/interview/${id}/feedback`
          }, 2000)
        } catch (error) {
          console.error('Error generating final report:', error)
          toast.error("Error generating feedback. Please check your results later.")
          
          // Fallback: redirect to home
          setTimeout(() => {
            window.location.href = '/'
          }, 1500)
        }
      }
    } catch (error) {
      console.error('Error completing round:', error)
      toast.error("Error completing round. Please try again.")
    }
  }

  // Timer for interview
  useEffect(() => {
    if (!started || isPaused || !interviewStartTime) return

    const interval = setInterval(() => {
      setTimeElapsed(Math.floor((new Date().getTime() - interviewStartTime.getTime()) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [started, isPaused, interviewStartTime])

  // Browser security - prevent leaving during interview
  useEffect(() => {
    if (!started) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
      return 'Are you sure you want to leave? Your interview progress may be lost.'
    }

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault()
      if (window.confirm('Are you sure you want to leave the interview? Your progress may be lost.')) {
        window.history.back()
      } else {
        window.history.pushState(null, '', window.location.href)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)
    window.history.pushState(null, '', window.location.href)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [started])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const getCurrentRoundQuestions = () => {
    if (interviewSession && interviewSession.rounds[currentRound]) {
      return interviewSession.rounds[currentRound].questions
    }
    return questions.slice(currentRound * 5, (currentRound + 1) * 5) // Fallback
  }

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getRoundProgress = () => {
    if (!interviewSession) return 0
    const completed = interviewSession.rounds.filter(r => r.status === 'completed').length
    return (completed / interviewSession.rounds.length) * 100
  }

  const getCompanyIcon = (roundType: string) => {
    switch (roundType) {
      case 'technical': return Brain
      case 'behavioral': return Users
      case 'system-design': return Target
      default: return Building2
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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

  const currentRoundData = interviewSession?.rounds[currentRound]

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Enhanced Interview Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                {companyName} - {jobTitle}
              </h2>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Round {currentRound + 1} of {interviewSession?.rounds.length || 1}</span>
              <span className="flex items-center gap-1">
                {currentRoundData && React.createElement(getCompanyIcon(currentRoundData.type), { className: "w-4 h-4" })}
                {currentRoundData?.type.toUpperCase() || 'INTERVIEW'}
              </span>
              {companyIntelligence && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  {companyIntelligence.companyData.difficulty} difficulty
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeElapsed)}</span>
            </div>
            {isPaused && (
              <Badge variant="destructive" className="animate-pulse">
                PAUSED - Suspicious Activity
              </Badge>
            )}
          </div>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Interview Progress</span>
            <span>{Math.round(getRoundProgress())}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${getRoundProgress()}%` }}
            ></div>
          </div>
        </div>

        {/* Enhanced Round Status */}
        <div className="flex gap-2 flex-wrap mt-4">
          {interviewSession?.rounds.map((round, index) => {
            const IconComponent = getCompanyIcon(round.type)
            return (
              <div key={round.id} className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2">
                {round.status === 'completed' ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : round.status === 'in-progress' ? (
                  <div className="w-4 h-4 border-2 border-blue-600 rounded-full border-t-transparent animate-spin" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-400" />
                )}
                <IconComponent className="w-4 h-4 text-gray-600" />
                <span className={`text-xs font-medium ${
                  index === currentRound ? 'text-blue-800' : 'text-gray-600'
                }`}>
                  {round.type}
                </span>
                {round.score && (
                  <Badge variant="secondary" className="text-xs ml-1">
                    {Math.round(round.score)}%
                  </Badge>
                )}
              </div>
            )
          })}
        </div>

        {/* Company Intelligence Insights */}
        {companyIntelligence && (
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                {companyName} Interview Focus
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {companyIntelligence.interviewInsights.keySkillsRequired.slice(0, 4).map((skill: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs border-blue-300 text-blue-700">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera Feed - Left Column */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <EnhancedCameraFeed 
              cameraOn={cameraOn} 
              setCameraOn={setCameraOn}
              onActivityDetected={handleActivityDetected}
              isInterviewActive={started}
            />
            
            {/* Activity Alerts */}
            {activityAlerts.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  Activity Monitor ({activityAlerts.length})
                </h3>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {activityAlerts.slice(-5).reverse().map((alert, index) => (
                    <div key={index} className={`text-xs p-2 rounded border ${getAlertSeverityColor(alert.severity)}`}>
                      <div className="font-medium">{alert.message}</div>
                      <div className="text-xs opacity-75">
                        {alert.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Company Tips */}
            {companyIntelligence && companyIntelligence.companyData.preparationTips.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <h4 className="text-sm font-medium text-green-800 mb-2">💡 {companyName} Tips</h4>
                <p className="text-xs text-green-700">
                  {companyIntelligence.companyData.preparationTips[0]}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Interview Questions - Right Columns */}
        <div className="lg:col-span-2">
          {!isPaused ? (
            <InterviewClientForm 
              questions={getCurrentRoundQuestions()} 
              id={id}
              roundId={currentRoundData?.id}
              onRoundComplete={handleRoundComplete}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-12 h-12 text-yellow-600 mb-4" />
              <h3 className="text-lg font-medium text-yellow-800 mb-2">Interview Paused</h3>
              <p className="text-yellow-700 text-center">
                Suspicious activity detected. Please ensure you're following interview guidelines.
                The interview will resume automatically.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EnhancedInterviewWrapper