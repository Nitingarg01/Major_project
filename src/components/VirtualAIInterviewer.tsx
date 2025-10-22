'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Camera, 
  CameraOff,
  MessageSquare,
  Brain,
  Clock,
  User,
  Bot,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'
import { toast } from 'sonner'
import AdvancedCameraFeed from './AdvancedCameraFeed'

interface VirtualAIInterviewerProps {
  questions: any[]
  onComplete: (results: any) => void
  companyName?: string
  jobTitle?: string
  interviewType?: string
  timeLimit?: number // in minutes
}

interface InterviewState {
  currentQuestionIndex: number
  isListening: boolean
  isSpeaking: boolean
  userResponse: string
  aiResponse: string
  conversationHistory: Array<{
    speaker: 'ai' | 'user'
    message: string
    timestamp: Date
    questionIndex?: number
  }>
  startTime: Date | null
  responses: Array<{
    questionIndex: number
    question: string
    userAnswer: string
    aiFollowUp?: string
    timestamp: Date
    responseTime: number
  }>
}

const VirtualAIInterviewer: React.FC<VirtualAIInterviewerProps> = ({
  questions,
  onComplete,
  companyName = 'Company',
  jobTitle = 'Position',
  interviewType = 'Technical',
  timeLimit = 45
}) => {
  // Core state
  const [interviewState, setInterviewState] = useState<InterviewState>({
    currentQuestionIndex: 0,
    isListening: false,
    isSpeaking: false,
    userResponse: '',
    aiResponse: '',
    conversationHistory: [],
    startTime: null,
    responses: []
  })

  // UI state
  const [isInterviewStarted, setIsInterviewStarted] = useState(false)
  const [isInterviewPaused, setIsInterviewPaused] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60)
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [micEnabled, setMicEnabled] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  
  // Technical state
  const [speechRecognition, setSpeechRecognition] = useState<any>(null)
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [aiAvatarState, setAiAvatarState] = useState<'idle' | 'speaking' | 'listening' | 'thinking'>('idle')

  // Refs
  const questionStartTimeRef = useRef<Date | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize speech services
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize Speech Recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'
        
        recognition.onresult = (event) => {
          let finalTranscript = ''
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript
            }
          }
          
          if (finalTranscript) {
            setInterviewState(prev => ({
              ...prev,
              userResponse: prev.userResponse + finalTranscript
            }))
          }
        }

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          toast.error('Speech recognition error. Please try again.')
          setInterviewState(prev => ({ ...prev, isListening: false }))
        }

        setSpeechRecognition(recognition)
      }

      // Initialize Speech Synthesis
      if (window.speechSynthesis) {
        setSpeechSynthesis(window.speechSynthesis)
      }
    }
  }, [])

  // Timer management
  useEffect(() => {
    if (isInterviewStarted && !isInterviewPaused) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleInterviewComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isInterviewStarted, isInterviewPaused])

  // AI Avatar Animation
  const updateAvatarState = useCallback((state: typeof aiAvatarState) => {
    setAiAvatarState(state)
  }, [])

  // Speech-to-Text functions
  const startListening = useCallback(() => {
    if (speechRecognition && micEnabled) {
      try {
        speechRecognition.start()
        setInterviewState(prev => ({ ...prev, isListening: true }))
        updateAvatarState('listening')
        toast.success('🎤 Listening... Speak your answer')
      } catch (error) {
        console.error('Error starting speech recognition:', error)
        toast.error('Could not start microphone. Please check permissions.')
      }
    }
  }, [speechRecognition, micEnabled, updateAvatarState])

  const stopListening = useCallback(() => {
    if (speechRecognition) {
      speechRecognition.stop()
      setInterviewState(prev => ({ ...prev, isListening: false }))
      updateAvatarState('thinking')
    }
  }, [speechRecognition, updateAvatarState])

  // Text-to-Speech functions
  const speakText = useCallback((text: string) => {
    if (speechSynthesis && audioEnabled) {
      // Cancel any ongoing speech
      speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1.1
      utterance.volume = 0.8
      
      // Try to use a professional voice
      const voices = speechSynthesis.getVoices()
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Microsoft') ||
        voice.name.includes('Alex') ||
        voice.name.includes('Samantha')
      )
      if (preferredVoice) {
        utterance.voice = preferredVoice
      }

      utterance.onstart = () => {
        setInterviewState(prev => ({ ...prev, isSpeaking: true }))
        updateAvatarState('speaking')
      }

      utterance.onend = () => {
        setInterviewState(prev => ({ ...prev, isSpeaking: false }))
        updateAvatarState('idle')
      }

      speechSynthesis.speak(utterance)
    }
  }, [speechSynthesis, audioEnabled, updateAvatarState])

  // Interview flow functions
  const startInterview = useCallback(() => {
    setIsInterviewStarted(true)
    setInterviewState(prev => ({
      ...prev,
      startTime: new Date()
    }))
    questionStartTimeRef.current = new Date()
    
    // Welcome message
    const welcomeMessage = `Hello! I'm your AI interviewer for the ${jobTitle} position at ${companyName}. This is a ${interviewType} interview. Let's begin with our first question.`
    
    setInterviewState(prev => ({
      ...prev,
      aiResponse: welcomeMessage,
      conversationHistory: [{
        speaker: 'ai',
        message: welcomeMessage,
        timestamp: new Date()
      }]
    }))

    speakText(welcomeMessage)
    
    // Ask first question after welcome
    setTimeout(() => {
      askCurrentQuestion()
    }, 3000)

    toast.success('🎬 Interview started! Good luck!')
  }, [jobTitle, companyName, interviewType, speakText])

  const askCurrentQuestion = useCallback(() => {
    const currentQuestion = questions[interviewState.currentQuestionIndex]
    if (!currentQuestion) return

    const questionText = `Question ${interviewState.currentQuestionIndex + 1}: ${currentQuestion.question}`
    
    setInterviewState(prev => ({
      ...prev,
      aiResponse: questionText,
      conversationHistory: [...prev.conversationHistory, {
        speaker: 'ai',
        message: questionText,
        timestamp: new Date(),
        questionIndex: prev.currentQuestionIndex
      }]
    }))

    speakText(questionText)
    questionStartTimeRef.current = new Date()
  }, [questions, interviewState.currentQuestionIndex, speakText])

  const submitResponse = useCallback(async () => {
    if (!interviewState.userResponse.trim()) {
      toast.error('Please provide an answer before submitting.')
      return
    }

    const currentQuestion = questions[interviewState.currentQuestionIndex]
    const responseTime = questionStartTimeRef.current 
      ? Date.now() - questionStartTimeRef.current.getTime()
      : 0

    // Add user response to conversation
    const userMessage = {
      speaker: 'user' as const,
      message: interviewState.userResponse,
      timestamp: new Date(),
      questionIndex: interviewState.currentQuestionIndex
    }

    // Save response
    const response = {
      questionIndex: interviewState.currentQuestionIndex,
      question: currentQuestion.question,
      userAnswer: interviewState.userResponse,
      timestamp: new Date(),
      responseTime
    }

    updateAvatarState('thinking')

    // Generate AI follow-up or feedback
    const followUpMessage = generateFollowUp(interviewState.userResponse, currentQuestion)
    
    const aiMessage = {
      speaker: 'ai' as const,
      message: followUpMessage,
      timestamp: new Date()
    }

    setInterviewState(prev => ({
      ...prev,
      conversationHistory: [...prev.conversationHistory, userMessage, aiMessage],
      responses: [...prev.responses, { ...response, aiFollowUp: followUpMessage }],
      userResponse: ''
    }))

    speakText(followUpMessage)

    // Move to next question after follow-up
    setTimeout(() => {
      moveToNextQuestion()
    }, 4000)

  }, [interviewState.userResponse, interviewState.currentQuestionIndex, questions, speakText, updateAvatarState])

  const generateFollowUp = (userAnswer: string, question: any): string => {
    // Simple follow-up generation - in production, use your AI service
    const followUps = [
      "That's an interesting perspective. Can you elaborate on that approach?",
      "Good answer. How would you handle this in a team environment?",
      "I see. What challenges might you face with that solution?",
      "Excellent. Can you walk me through your thought process?",
      "Thank you for that response. Let's move to the next question."
    ]
    
    return followUps[Math.floor(Math.random() * followUps.length)]
  }

  const moveToNextQuestion = useCallback(() => {
    if (interviewState.currentQuestionIndex < questions.length - 1) {
      setInterviewState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }))
      setTimeout(() => {
        askCurrentQuestion()
      }, 1000)
    } else {
      handleInterviewComplete()
    }
  }, [interviewState.currentQuestionIndex, questions.length, askCurrentQuestion])

  const handleInterviewComplete = useCallback(() => {
    setIsInterviewStarted(false)
    
    const completionMessage = "Thank you for completing the interview. Your responses have been recorded and will be evaluated shortly."
    speakText(completionMessage)

    // Calculate results
    const results = {
      totalQuestions: questions.length,
      answeredQuestions: interviewState.responses.length,
      totalTime: interviewState.startTime ? Date.now() - interviewState.startTime.getTime() : 0,
      averageResponseTime: interviewState.responses.reduce((sum, r) => sum + r.responseTime, 0) / interviewState.responses.length,
      conversationHistory: interviewState.conversationHistory,
      responses: interviewState.responses,
      completedAt: new Date()
    }

    setTimeout(() => {
      onComplete(results)
    }, 3000)

    toast.success('🎉 Interview completed successfully!')
  }, [questions.length, interviewState, onComplete, speakText])

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // AI Avatar Component
  const AIAvatar = () => (
    <div className="relative w-32 h-32 mx-auto mb-4">
      <div className={`w-full h-full rounded-full border-4 transition-all duration-300 ${
        aiAvatarState === 'speaking' ? 'border-green-400 animate-pulse' :
        aiAvatarState === 'listening' ? 'border-blue-400 animate-pulse' :
        aiAvatarState === 'thinking' ? 'border-yellow-400 animate-spin' :
        'border-gray-300'
      } bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center`}>
        <Bot className={`w-16 h-16 text-white transition-transform duration-300 ${
          aiAvatarState === 'speaking' ? 'scale-110' : 'scale-100'
        }`} />
      </div>
      
      {/* Status indicator */}
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
        <Badge variant={
          aiAvatarState === 'speaking' ? 'default' :
          aiAvatarState === 'listening' ? 'secondary' :
          aiAvatarState === 'thinking' ? 'outline' :
          'secondary'
        } className="text-xs">
          {aiAvatarState === 'speaking' ? '🗣️ Speaking' :
           aiAvatarState === 'listening' ? '👂 Listening' :
           aiAvatarState === 'thinking' ? '🤔 Thinking' :
           '😊 Ready'}
        </Badge>
      </div>
    </div>
  )

  if (!isInterviewStarted) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Virtual AI Interview
            </CardTitle>
            <p className="text-gray-600">
              {interviewType} Interview for {jobTitle} at {companyName}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <AIAvatar />
            
            <div className="text-center space-y-4">
              <p className="text-lg text-gray-700">
                Welcome! I'm your AI interviewer. I'll ask you {questions.length} questions 
                and we'll have a natural conversation about your experience and skills.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>Duration: {timeLimit} minutes</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-green-500" />
                  <span>Questions: {questions.length}</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Brain className="w-4 h-4 text-purple-500" />
                  <span>AI-Powered</span>
                </div>
              </div>
            </div>

            {/* Camera and Audio Setup */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">Setup Check</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Camera className="w-4 h-4 mr-2" />
                    Camera Feed
                  </h4>
                  <AdvancedCameraFeed
                    isRecording={false}
                    onRecordingChange={() => {}}
                    enableFaceDetection={true}
                    className="h-32"
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-gray-600">Camera Status</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCameraEnabled(!cameraEnabled)}
                    >
                      {cameraEnabled ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                    </Button>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Mic className="w-4 h-4 mr-2" />
                    Audio Setup
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Microphone</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setMicEnabled(!micEnabled)}
                      >
                        {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">AI Voice</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAudioEnabled(!audioEnabled)}
                      >
                        {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            <div className="text-center">
              <Button
                onClick={startInterview}
                size="lg"
                className="px-8 py-3 text-lg"
                disabled={!cameraEnabled || !micEnabled}
              >
                <Play className="w-5 h-5 mr-2" />
                Start Interview
              </Button>
              {(!cameraEnabled || !micEnabled) && (
                <p className="text-sm text-red-500 mt-2">
                  Please enable camera and microphone to start the interview
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main interview interface
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">
                Virtual AI Interview - Question {interviewState.currentQuestionIndex + 1}/{questions.length}
              </CardTitle>
              <p className="text-gray-600">{jobTitle} at {companyName}</p>
            </div>
            <div className="text-right space-y-1">
              <div className="text-2xl font-bold text-blue-600">
                {formatTime(timeRemaining)}
              </div>
              <div className="text-sm text-gray-500">Time Remaining</div>
            </div>
          </div>
          <Progress 
            value={(interviewState.currentQuestionIndex / questions.length) * 100} 
            className="mt-2"
          />
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Interviewer Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-center">AI Interviewer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AIAvatar />
            
            {/* AI Response Display */}
            <div className="bg-blue-50 p-4 rounded-lg min-h-[120px]">
              <div className="flex items-start space-x-2">
                <Bot className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div className="text-sm text-gray-700">
                  {interviewState.aiResponse || "I'm ready to begin the interview..."}
                </div>
              </div>
            </div>

            {/* Audio Controls */}
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAudioEnabled(!audioEnabled)}
              >
                {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (interviewState.aiResponse) {
                    speakText(interviewState.aiResponse)
                  }
                }}
                disabled={interviewState.isSpeaking}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Response Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Your Response</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Camera Feed */}
            <div className="h-48">
              <AdvancedCameraFeed
                isRecording={isRecording}
                onRecordingChange={setIsRecording}
                enableFaceDetection={true}
                className="h-full"
              />
            </div>

            {/* Response Input */}
            <div className="space-y-4">
              <textarea
                value={interviewState.userResponse}
                onChange={(e) => setInterviewState(prev => ({
                  ...prev,
                  userResponse: e.target.value
                }))}
                placeholder="Your response will appear here as you speak, or you can type directly..."
                className="w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={interviewState.isListening}
              />

              {/* Controls */}
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Button
                    variant={interviewState.isListening ? "destructive" : "default"}
                    onClick={interviewState.isListening ? stopListening : startListening}
                    disabled={!micEnabled || interviewState.isSpeaking}
                  >
                    {interviewState.isListening ? (
                      <>
                        <MicOff className="w-4 h-4 mr-2" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 mr-2" />
                        Start Recording
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setIsInterviewPaused(!isInterviewPaused)}
                  >
                    {isInterviewPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </Button>
                </div>

                <Button
                  onClick={submitResponse}
                  disabled={!interviewState.userResponse.trim() || interviewState.isSpeaking}
                  className="px-6"
                >
                  Submit Response
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversation History */}
      <Card>
        <CardHeader>
          <CardTitle>Conversation History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {interviewState.conversationHistory.map((entry, index) => (
              <div
                key={index}
                className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    entry.speaker === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {entry.speaker === 'ai' ? (
                      <Bot className="w-4 h-4 mt-1 flex-shrink-0" />
                    ) : (
                      <User className="w-4 h-4 mt-1 flex-shrink-0" />
                    )}
                    <div className="text-sm">{entry.message}</div>
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    {entry.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default VirtualAIInterviewer