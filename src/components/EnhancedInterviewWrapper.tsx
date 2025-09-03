'use client'
import React, { useEffect, useState, useCallback } from 'react'
import IntroModal from './IntroModal'
import InterviewClientForm from './InterviewClientForm'
import { Question, InterviewRound } from '@/types/interview'
import EnhancedCameraFeed from './EnhancedCameraFeed'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Clock, AlertTriangle, CheckCircle, Circle } from 'lucide-react'
import { Button } from './ui/button'

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
  companyName,
  jobTitle
}: EnhancedInterviewWrapperProps) => {
  const [started, setStarted] = useState<boolean>(false)
  const [cameraOn, setCameraOn] = useState(true)
  const [currentRound, setCurrentRound] = useState(0)
  const [activityAlerts, setActivityAlerts] = useState<ActivityAlert[]>([])
  const [interviewStartTime, setInterviewStartTime] = useState<Date | null>(null)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // If no rounds provided, create default rounds based on interview type
  const interviewRounds: InterviewRound[] = rounds || createDefaultRounds(questions, interviewType)

  const handleStart = () => {
    setStarted(true)
    setInterviewStartTime(new Date())
  }

  const handleActivityDetected = useCallback((activity: ActivityAlert) => {
    setActivityAlerts(prev => [...prev, activity])
    
    // Auto-pause for high severity alerts
    if (activity.severity === 'high' && activity.type !== 'looking_away') {
      setIsPaused(true)
      setTimeout(() => setIsPaused(false), 3000) // Resume after 3 seconds
    }
  }, [])

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
    if (interviewRounds[currentRound]) {
      return interviewRounds[currentRound].questions
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
    const completed = interviewRounds.filter(r => r.status === 'completed').length
    return (completed / interviewRounds.length) * 100
  }

  if (!started) {
    return (
      <IntroModal 
        onStart={handleStart}
        companyName={companyName}
        jobTitle={jobTitle}
        interviewType={interviewType}
        estimatedDuration={interviewRounds.reduce((sum, round) => sum + round.duration, 0)}
        rounds={interviewRounds}
      />
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Interview Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {companyName} - {jobTitle}
            </h2>
            <p className="text-gray-600">
              Round {currentRound + 1} of {interviewRounds.length} - {interviewRounds[currentRound]?.type.toUpperCase()}
            </p>
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

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <Progress value={getRoundProgress()} className="h-2" />
        </div>

        {/* Round Status */}
        <div className="flex gap-2 flex-wrap">
          {interviewRounds.map((round, index) => (
            <div key={round.id} className="flex items-center gap-1">
              {round.status === 'completed' ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : round.status === 'in-progress' ? (
                <div className="w-4 h-4 border-2 border-blue-600 rounded-full border-t-transparent animate-spin" />
              ) : (
                <Circle className="w-4 h-4 text-gray-400" />
              )}
              <span className={`text-xs px-2 py-1 rounded ${
                index === currentRound ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {round.type}
              </span>
            </div>
          ))}
        </div>
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
          </div>
        </div>

        {/* Interview Questions - Right Columns */}
        <div className="lg:col-span-2">
          {!isPaused ? (
            <InterviewClientForm 
              questions={getCurrentRoundQuestions()} 
              id={id}
              roundId={interviewRounds[currentRound]?.id}
              onRoundComplete={() => {
                if (currentRound < interviewRounds.length - 1) {
                  setCurrentRound(prev => prev + 1)
                }
              }}
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

// Helper function to create default rounds
function createDefaultRounds(questions: Question[], interviewType: string): InterviewRound[] {
  if (interviewType === 'mixed') {
    const questionsPerRound = Math.ceil(questions.length / 4)
    return [
      {
        id: 'technical-round',
        type: 'technical',
        status: 'in-progress',
        questions: questions.slice(0, questionsPerRound),
        duration: 25
      },
      {
        id: 'behavioral-round',
        type: 'behavioral',
        status: 'pending',
        questions: questions.slice(questionsPerRound, questionsPerRound * 2),
        duration: 20
      },
      {
        id: 'aptitude-round',
        type: 'aptitude',
        status: 'pending',
        questions: questions.slice(questionsPerRound * 2, questionsPerRound * 3),
        duration: 15
      },
      {
        id: 'dsa-round',
        type: 'dsa',
        status: 'pending',
        questions: questions.slice(questionsPerRound * 3),
        duration: 20
      }
    ]
  } else {
    return [{
      id: `${interviewType}-round`,
      type: interviewType as any,
      status: 'in-progress',
      questions: questions,
      duration: 30
    }]
  }
}

export default EnhancedInterviewWrapper