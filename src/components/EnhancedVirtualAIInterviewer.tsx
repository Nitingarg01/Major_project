'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
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
  RotateCcw,
  Settings,
  Zap,
  TrendingUp
} from 'lucide-react'
import { toast } from 'sonner';
import AdvancedCameraFeed from './AdvancedCameraFeed';
import { EnhancedVirtualInterviewerAI } from '@/lib/enhancedVirtualInterviewerAI';
import EmotionDetectionService, { type EmotionData } from '@/lib/emotionDetectionService';

interface EnhancedVirtualAIInterviewerProps {
  questions: any[]
  onComplete: (results: any) => void
  companyName?: string
  jobTitle?: string
  interviewType?: string
  timeLimit?: number
  personality?: 'professional' | 'friendly' | 'strict' | 'encouraging'
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
    analysis?: any
  }>
}

const EnhancedVirtualAIInterviewer: React.FC<EnhancedVirtualAIInterviewerProps> = ({
  questions,
  onComplete,
  companyName = 'Company',
  jobTitle = 'Position',
  interviewType = 'Technical',
  timeLimit = 45,
  personality = 'professional'
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
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isInterviewPaused, setIsInterviewPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [useElevenLabs, setUseElevenLabs] = useState(true);
  const [currentPersonality, setCurrentPersonality] = useState(personality);
  
  // Technical state
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [aiAvatarState, setAiAvatarState] = useState<'idle' | 'speaking' | 'listening' | 'thinking'>('idle');
  const [realTimeScore, setRealTimeScore] = useState<number>(0);

  // Refs
  const questionStartTimeRef = useRef<Date | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const virtualAI = useRef(EnhancedVirtualInterviewerAI.getInstance());
  const recognitionRestartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const speakTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isCleaningUpRef = useRef<boolean>(false);

  // Initialize speech services
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize Speech Recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;
        
        recognition.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
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
          console.error('Speech recognition error:', event.error);
          
          // Handle specific errors
          if (event.error === 'no-speech') {
            console.log('No speech detected, continuing...');
          } else if (event.error === 'aborted') {
            console.log('Recognition aborted');
          } else if (event.error !== 'network') {
            toast.error(`Speech recognition error: ${event.error}`);
          }
          
          setInterviewState(prev => ({ ...prev, isListening: false }));
        }

        recognition.onend = () => {
          // Only auto-restart if still in listening mode and not cleaning up
          if (!isCleaningUpRef.current && interviewState.isListening && !isInterviewPaused) {
            console.log('Recognition ended, scheduling restart...');
            // Clear any existing restart timeout
            if (recognitionRestartTimeoutRef.current) {
              clearTimeout(recognitionRestartTimeoutRef.current);
            }
            
            recognitionRestartTimeoutRef.current = setTimeout(() => {
              // Double-check conditions before restarting
              if (!isCleaningUpRef.current && interviewState.isListening && !isInterviewPaused) {
                try {
                  recognition.start();
                  console.log('✓ Recognition restarted');
                } catch (e: any) {
                  // Only log if it's not "already started" error
                  if (!e.message?.includes('already started')) {
                    console.warn('Could not restart recognition:', e)
                  }
                }
              }
            }, 300) // Increased delay for better stability
          }
        }

        setSpeechRecognition(recognition);
      } else {
        toast.error('Speech recognition not supported in this browser. Please use Chrome or Edge.');
      }
    }

    return () => {
      // Cleanup timeouts
      if (recognitionRestartTimeoutRef.current) {
        clearTimeout(recognitionRestartTimeoutRef.current);
        recognitionRestartTimeoutRef.current = null;
      }
    }
  }, [])

  // Timer management
  useEffect(() => {
    if (isInterviewStarted && !isInterviewPaused) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleInterviewComplete();
            return 0;
          }
          return prev - 1;
        })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [isInterviewStarted, isInterviewPaused])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Set cleanup flag
      isCleaningUpRef.current = true;
      
      // Clear all timeouts
      if (recognitionRestartTimeoutRef.current) {
        clearTimeout(recognitionRestartTimeoutRef.current);
        recognitionRestartTimeoutRef.current = null;
      }
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current);
        speakTimeoutRef.current = null;
      }
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Stop speech and recognition
      virtualAI.current.stopSpeaking()
      if (speechRecognition) {
        try {
          speechRecognition.stop();
        } catch (e) {
          console.log('Recognition cleanup:', e)
        }
      }
    }
  }, [speechRecognition])

  // AI Avatar Animation
  const updateAvatarState = useCallback((state: typeof aiAvatarState) => {
    setAiAvatarState(state);
  }, [])

  // Speech-to-Text functions
  const startListening = useCallback(() => {
    if (speechRecognition && micEnabled && !interviewState.isSpeaking) {
      try {
        speechRecognition.start();
        setInterviewState(prev => ({ ...prev, isListening: true }));
        updateAvatarState('listening');
        toast.success('🎤 Listening... Speak your answer');
      } catch (error: any) {
        if (error.message.includes('already started')) {
          console.log('Recognition already running');
          setInterviewState(prev => ({ ...prev, isListening: true }));
          updateAvatarState('listening');
        } else {
          console.error('Error starting speech recognition:', error);
          toast.error('Could not start microphone. Please check permissions.');
        }
      }
    }
  }, [speechRecognition, micEnabled, interviewState.isSpeaking, updateAvatarState])

  const stopListening = useCallback(() => {
    if (speechRecognition) {
      try {
        // Clear restart timeout when manually stopping
        if (recognitionRestartTimeoutRef.current) {
          clearTimeout(recognitionRestartTimeoutRef.current);
          recognitionRestartTimeoutRef.current = null;
        }
        speechRecognition.stop();
      } catch (e) {
        console.log('Recognition stop error:', e)
      }
      setInterviewState(prev => ({ ...prev, isListening: false }));
      updateAvatarState('thinking');
    }
  }, [speechRecognition, updateAvatarState])

  // Enhanced Text-to-Speech with ElevenLabs
  const speakText = useCallback(async (text: string) => {
    if (!audioEnabled) return

    updateAvatarState('speaking');
    setInterviewState(prev => ({ ...prev, isSpeaking: true }));

    try {
      await virtualAI.current.speak(text, {
        useElevenLabs,
        personality: currentPersonality,
        onStart: () => {
          updateAvatarState('speaking');
          setInterviewState(prev => ({ ...prev, isSpeaking: true }));
        },
        onEnd: () => {
          updateAvatarState('idle');
          setInterviewState(prev => ({ ...prev, isSpeaking: false }));
        },
        onError: (error) => {
          console.error('Speech error:', error);
          updateAvatarState('idle');
          setInterviewState(prev => ({ ...prev, isSpeaking: false }));
        }
      })
    } catch (error) {
      console.error('Speech error:', error);
      updateAvatarState('idle');
      setInterviewState(prev => ({ ...prev, isSpeaking: false }));
    }
  }, [audioEnabled, useElevenLabs, currentPersonality, updateAvatarState])

  // Interview flow functions
  const startInterview = useCallback(() => {
    setIsInterviewStarted(true);
    setInterviewState(prev => ({
      ...prev,
      startTime: new Date()
    }))
    questionStartTimeRef.current = new Date();
    
    // Generate welcome message
    const welcomeResponse = virtualAI.current.generateWelcomeMessage({
      companyName,
      jobTitle,
      interviewType,
      currentQuestionIndex: 0,
      totalQuestions: questions.length,
      conversationHistory: [],
      personality: currentPersonality
    })
    
    setInterviewState(prev => ({
      ...prev,
      aiResponse: welcomeResponse.message,
      conversationHistory: [{
        speaker: 'ai',
        message: welcomeResponse.message,
        timestamp: new Date()
      }]
    }))

    speakText(welcomeResponse.message);
    
    // Ask first question after welcome
    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
    }
    speakTimeoutRef.current = setTimeout(() => {
      if (!isCleaningUpRef.current) {
        askCurrentQuestion();
      }
    }, 5000)

    toast.success('🎬 Interview started! Good luck!');
  }, [companyName, jobTitle, interviewType, questions.length, currentPersonality, speakText])

  const askCurrentQuestion = useCallback(() => {
    const currentQuestion = questions[interviewState.currentQuestionIndex]
    if (!currentQuestion) return

    const questionText = `Question ${interviewState.currentQuestionIndex + 1}: ${currentQuestion.question}`;
    
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

    speakText(questionText);
    questionStartTimeRef.current = new Date();
  }, [questions, interviewState.currentQuestionIndex, speakText])

  const submitResponse = useCallback(async () => {
    if (!interviewState.userResponse.trim()) {
      toast.error('Please provide an answer before submitting.');
      return
    }

    // Stop listening
    if (interviewState.isListening) {
      stopListening();
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

    updateAvatarState('thinking');

    // Analyze response in real-time
    const analysis = await virtualAI.current.analyzeResponse(
      interviewState.userResponse,
      currentQuestion.question,
      {
        companyName,
        jobTitle,
        interviewType,
        currentQuestionIndex: interviewState.currentQuestionIndex,
        totalQuestions: questions.length,
        conversationHistory: interviewState.conversationHistory,
        personality: currentPersonality
      }
    )

    // Update real-time score
    setRealTimeScore(analysis.score);

    // Generate AI follow-up
    const followUpResponse = await virtualAI.current.generateFollowUp(
      interviewState.userResponse,
      currentQuestion.question,
      {
        companyName,
        jobTitle,
        interviewType,
        currentQuestionIndex: interviewState.currentQuestionIndex,
        totalQuestions: questions.length,
        conversationHistory: interviewState.conversationHistory,
        personality: currentPersonality
      }
    )
    
    const aiMessage = {
      speaker: 'ai' as const,
      message: followUpResponse.message,
      timestamp: new Date()
    }

    // Save response with analysis
    const response = {
      questionIndex: interviewState.currentQuestionIndex,
      question: currentQuestion.question,
      userAnswer: interviewState.userResponse,
      timestamp: new Date(),
      responseTime,
      aiFollowUp: followUpResponse.message,
      analysis
    }

    setInterviewState(prev => ({
      ...prev,
      conversationHistory: [...prev.conversationHistory, userMessage, aiMessage],
      responses: [...prev.responses, response],
      userResponse: ''
    }))

    speakText(followUpResponse.message);

    // Show quick feedback
    toast.success(`Score: ${analysis.score}/10 - ${analysis.feedback.substring(0, 50)}...`);

    // Move to next question after follow-up
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    transitionTimeoutRef.current = setTimeout(() => {
      if (!isCleaningUpRef.current) {
        moveToNextQuestion();
      }
    }, 6000)

  }, [interviewState, questions, stopListening, speakText, currentPersonality, companyName, jobTitle, interviewType, updateAvatarState])

  const moveToNextQuestion = useCallback(() => {
    if (interviewState.currentQuestionIndex < questions.length - 1) {
      // Generate transition
      const transition = virtualAI.current.generateTransition(
        interviewState.currentQuestionIndex,
        questions.length,
        {
          companyName,
          jobTitle,
          interviewType,
          currentQuestionIndex: interviewState.currentQuestionIndex,
          totalQuestions: questions.length,
          conversationHistory: interviewState.conversationHistory,
          personality: currentPersonality
        }
      )

      setInterviewState(prev => ({
        ...prev,
        aiResponse: transition.message,
        conversationHistory: [...prev.conversationHistory, {
          speaker: 'ai',
          message: transition.message,
          timestamp: new Date()
        }],
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }))

      speakText(transition.message);

      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      transitionTimeoutRef.current = setTimeout(() => {
        if (!isCleaningUpRef.current) {
          askCurrentQuestion();
        }
      }, 2000)
    } else {
      handleInterviewComplete();
    }
  }, [interviewState.currentQuestionIndex, interviewState.conversationHistory, questions.length, speakText, currentPersonality, companyName, jobTitle, interviewType, askCurrentQuestion])

  const handleInterviewComplete = useCallback(() => {
    setIsInterviewStarted(false);
    isCleaningUpRef.current = true;
    
    // Clear all timeouts
    if (recognitionRestartTimeoutRef.current) {
      clearTimeout(recognitionRestartTimeoutRef.current);
    }
    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
    }
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    
    // Stop any ongoing speech/listening
    virtualAI.current.stopSpeaking()
    if (speechRecognition) {
      try {
        speechRecognition.stop();
      } catch (e) {
        console.log('Recognition cleanup on complete:', e)
      }
    }
    
    const completionMessage = "Thank you for completing the interview. Your responses have been recorded and analyzed. You'll receive detailed feedback shortly.";
    speakText(completionMessage);

    // Calculate overall results
    const totalScore = interviewState.responses.reduce((sum, r) => sum + (r.analysis?.score || 0), 0);
    const avgScore = interviewState.responses.length > 0 ? totalScore / interviewState.responses.length : 0;

    const results = {
      totalQuestions: questions.length,
      answeredQuestions: interviewState.responses.length,
      totalTime: interviewState.startTime ? Date.now() - interviewState.startTime.getTime() : 0,
      averageResponseTime: interviewState.responses.reduce((sum, r) => sum + r.responseTime, 0) / Math.max(interviewState.responses.length, 1),
      conversationHistory: interviewState.conversationHistory,
      responses: interviewState.responses,
      completedAt: new Date(),
      overallScore: avgScore,
      personality: currentPersonality,
      usedElevenLabs: useElevenLabs,
      metadata: {
        virtualAI: true,
        enhancedVersion: true,
        realTimeAnalysis: true
      }
    }

    const completionTimeoutRef = setTimeout(() => {
      if (!isCleaningUpRef.current) {
        onComplete(results);
      }
    }, 3000)

    // Store timeout for cleanup
    speakTimeoutRef.current = completionTimeoutRef;

    toast.success('🎉 Interview completed successfully!');
  }, [questions.length, interviewState, onComplete, speakText, currentPersonality, useElevenLabs, speechRecognition])

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // AI Avatar Component
  const AIAvatar = () => (
    <div className="relative w-32 h-32 mx-auto mb-4">
      <div className={`w-full h-full rounded-full border-4 transition-all duration-300 ${
        aiAvatarState === 'speaking' ? 'border-green-400 animate-pulse shadow-lg shadow-green-200' :
        aiAvatarState === 'listening' ? 'border-blue-400 animate-pulse shadow-lg shadow-blue-200' :
        aiAvatarState === 'thinking' ? 'border-yellow-400 animate-spin shadow-lg shadow-yellow-200' :
        'border-purple-300 shadow-md'
      } bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 flex items-center justify-center`}>
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
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
              <Brain className="w-8 h-8 text-purple-600" />
              Enhanced Virtual AI Interview
            </CardTitle>
            <p className="text-gray-600">
              {interviewType} Interview for {jobTitle} at {companyName}
            </p>
            <Badge className="mx-auto mt-2 bg-gradient-to-r from-purple-600 to-blue-600">
              <Zap className="w-3 h-3 mr-1" />
              Powered by ElevenLabs AI Voice
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <AIAvatar />
            
            <div className="text-center space-y-4">
              <p className="text-lg text-gray-700">
                Welcome! I'm your Enhanced AI interviewer with realistic voice and advanced analysis.
                I'll ask you {questions.length} questions and provide real-time feedback.
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
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  <span>Real-time Scoring</span>
                </div>
              </div>
            </div>

            {/* Personality Selector */}
            <Card className="p-4 bg-white/70">
              <h4 className="font-medium mb-3 flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Interviewer Personality
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(['professional', 'friendly', 'strict', 'encouraging'] as const).map((p) => (
                  <Button
                    key={p}
                    variant={currentPersonality === p ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPersonality(p)}
                    className="capitalize"
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </Card>

            {/* Camera and Audio Setup */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 bg-white/70">
                <h4 className="font-medium mb-2 flex items-center">
                  <Camera className="w-4 h-4 mr-2" />
                  Camera Feed
                </h4>
                <AdvancedCameraFeed
                  isRecording={false}
                  onRecordingChange={() => {}}
                  enableFaceDetection={true}
                  className="h-32 rounded-lg"
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

              <Card className="p-4 bg-white/70">
                <h4 className="font-medium mb-2 flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Audio Settings
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
                  <div className="flex items-center justify-between">
                    <span className="text-sm">ElevenLabs Voice</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUseElevenLabs(!useElevenLabs)}
                    >
                      <Badge variant={useElevenLabs ? 'default' : 'secondary'}>
                        {useElevenLabs ? 'ON' : 'OFF'}
                      </Badge>
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            <div className="text-center">
              <Button
                onClick={startInterview}
                size="lg"
                className="px-8 py-3 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={!cameraEnabled || !micEnabled}
              >
                <Play className="w-5 h-5 mr-2" />
                Start Interview
              </Button>
              {(!cameraEnabled || !micEnabled) && (
                <p className="text-sm text-red-500 mt-2">
                  Please enable camera and microphone to start
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
      <Card className="bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-200">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-600" />
                Enhanced Virtual AI Interview - Q {interviewState.currentQuestionIndex + 1}/{questions.length}
              </CardTitle>
              <p className="text-gray-600">{jobTitle} at {companyName}</p>
            </div>
            <div className="text-right space-y-1">
              <div className="text-2xl font-bold text-blue-600">
                {formatTime(timeRemaining)}
              </div>
              <div className="text-sm text-gray-500">Time Remaining</div>
              {realTimeScore > 0 && (
                <Badge className="bg-green-500">
                  Score: {realTimeScore}/10
                </Badge>
              )}
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
        <Card className="lg:col-span-1 border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Bot className="w-5 h-5 text-purple-600" />
              AI Interviewer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AIAvatar />
            
            {/* AI Response Display */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg min-h-[120px] border border-purple-200">
              <div className="flex items-start space-x-2">
                <Bot className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
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
                    speakText(interviewState.aiResponse);
                  }
                }}
                disabled={interviewState.isSpeaking}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUseElevenLabs(!useElevenLabs)}
              >
                <Badge variant={useElevenLabs ? 'default' : 'secondary'} className="text-xs">
                  {useElevenLabs ? 'Premium' : 'Standard'}
                </Badge>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Response Panel */}
        <Card className="lg:col-span-2 border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Your Response
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Camera Feed */}
            <div className="h-48 rounded-lg overflow-hidden border-2 border-blue-200">
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
                className="w-full h-32 p-3 border-2 border-blue-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={interviewState.isListening}
              />

              {/* Controls */}
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Button
                    variant={interviewState.isListening ? "destructive" : "default"}
                    onClick={interviewState.isListening ? stopListening : startListening}
                    disabled={!micEnabled || interviewState.isSpeaking}
                    className={interviewState.isListening ? 'animate-pulse' : ''}
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
                  className="px-6 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                >
                  Submit Response
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversation History */}
      <Card className="border-2 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Conversation History
          </CardTitle>
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
                      : 'bg-purple-100 text-gray-800 border border-purple-200'
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

export default EnhancedVirtualAIInterviewer;
