'use client'
import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { 
  Video, 
  MessageSquare, 
  Brain, 
  ArrowLeft, 
  Settings,
  Info,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'
import EnhancedVirtualAIInterviewer from './EnhancedVirtualAIInterviewer'
import { EnhancedVirtualInterviewerAI } from '@/lib/enhancedVirtualInterviewerAI'

interface VirtualInterviewWrapperProps {
  interviewId: string
  questions: any[]
  companyName: string
  jobTitle: string
  interviewType: string
  onComplete: (results: any) => void
  onBack?: () => void
}

const VirtualInterviewWrapper: React.FC<VirtualInterviewWrapperProps> = ({
  interviewId,
  questions,
  companyName,
  jobTitle,
  interviewType,
  onComplete,
  onBack
}) => {
  const [isReady, setIsReady] = useState(false)
  const [showPreparation, setShowPreparation] = useState(true)
  const [systemChecks, setSystemChecks] = useState({
    camera: false,
    microphone: false,
    speakers: false,
    browser: false
  })
  const [virtualAI] = useState(() => VirtualInterviewerAI.getInstance())

  // System compatibility checks
  useEffect(() => {
    performSystemChecks()
  }, [])

  const performSystemChecks = async () => {
    const checks = { ...systemChecks }

    // Check browser compatibility
    checks.browser = !!(navigator.mediaDevices && window.SpeechRecognition || window.webkitSpeechRecognition)
    
    // Check camera and microphone
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      checks.camera = true
      checks.microphone = true
      
      // Stop the stream after checking
      stream.getTracks().forEach(track => track.stop())
    } catch (error) {
      console.error('Media access error:', error)
      toast.error('Please allow camera and microphone access for the virtual interview')
    }

    // Check speakers (basic check)
    checks.speakers = !!(window.speechSynthesis)

    setSystemChecks(checks)
    setIsReady(Object.values(checks).every(check => check))
  }

  const handleInterviewComplete = async (results: any) => {
    try {
      // Process results with AI analysis
      const enhancedResults = await processInterviewResults(results)
      
      // Save to backend
      await saveInterviewResults(interviewId, enhancedResults)
      
      onComplete(enhancedResults)
      toast.success('🎉 Virtual interview completed successfully!')
    } catch (error) {
      console.error('Error processing interview results:', error)
      toast.error('Error saving interview results')
      onComplete(results) // Fallback to original results
    }
  }

  const processInterviewResults = async (results: any) => {
    const analysisPromises = results.responses.map(async (response: any) => {
      const analysis = await virtualAI.analyzeResponse(
        response.userAnswer,
        response.question,
        {
          companyName,
          jobTitle,
          interviewType,
          currentQuestionIndex: response.questionIndex,
          totalQuestions: questions.length,
          conversationHistory: results.conversationHistory
        }
      )
      
      return {
        ...response,
        analysis
      }
    })

    const analyzedResponses = await Promise.all(analysisPromises)
    
    // Calculate overall metrics
    const overallScore = analyzedResponses.reduce((sum, r) => sum + r.analysis.score, 0) / analyzedResponses.length
    const totalStrengths = analyzedResponses.flatMap(r => r.analysis.strengths)
    const totalImprovements = analyzedResponses.flatMap(r => r.analysis.improvements)

    return {
      ...results,
      responses: analyzedResponses,
      overallScore,
      strengths: [...new Set(totalStrengths)],
      improvements: [...new Set(totalImprovements)],
      interviewType: 'virtual-ai',
      metadata: {
        aiInterviewer: true,
        conversationFlow: true,
        realTimeAnalysis: true,
        speechToText: true,
        textToSpeech: true
      }
    }
  }

  const saveInterviewResults = async (interviewId: string, results: any) => {
    try {
      const response = await fetch('/api/interviews/save-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          interviewId,
          results,
          type: 'virtual-ai'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save results')
      }
    } catch (error) {
      console.error('Error saving interview results:', error)
      throw error
    }
  }

  if (showPreparation) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center">
                  <Brain className="w-8 h-8 mr-3 text-purple-600" />
                  Virtual AI Interview
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  {interviewType} Interview for {jobTitle} at {companyName}
                </p>
              </div>
              {onBack && (
                <Button variant="outline" onClick={onBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Introduction */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Video className="w-5 h-5 mr-2 text-purple-600" />
                Experience the Future of Interviews
              </h3>
              <p className="text-gray-700 mb-4">
                You're about to experience a revolutionary AI-powered interview that feels like talking to a real person. 
                Our virtual interviewer will conduct a natural conversation, ask follow-up questions, and provide 
                real-time feedback just like a human interviewer would.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Natural conversation flow</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Real-time speech recognition</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>AI voice responses</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Intelligent follow-up questions</span>
                </div>
              </div>
            </div>

            {/* System Requirements Check */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  System Requirements Check
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Video className="w-4 h-4 mr-2" />
                        Camera Access
                      </span>
                      <Badge variant={systemChecks.camera ? "default" : "destructive"}>
                        {systemChecks.camera ? "✓ Ready" : "✗ Required"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Microphone Access
                      </span>
                      <Badge variant={systemChecks.microphone ? "default" : "destructive"}>
                        {systemChecks.microphone ? "✓ Ready" : "✗ Required"}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Brain className="w-4 h-4 mr-2" />
                        Browser Support
                      </span>
                      <Badge variant={systemChecks.browser ? "default" : "destructive"}>
                        {systemChecks.browser ? "✓ Compatible" : "✗ Unsupported"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Settings className="w-4 h-4 mr-2" />
                        Audio Output
                      </span>
                      <Badge variant={systemChecks.speakers ? "default" : "secondary"}>
                        {systemChecks.speakers ? "✓ Available" : "⚠ Check"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {!isReady && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start">
                      <Info className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800">Setup Required</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Please ensure camera and microphone access are granted. 
                          Click "Allow" when prompted by your browser.
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={performSystemChecks}
                        >
                          Retry System Check
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interview Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Interview Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
                    <div className="text-sm text-gray-600">Questions</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">45</div>
                    <div className="text-sm text-gray-600">Minutes</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">AI</div>
                    <div className="text-sm text-gray-600">Powered</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <h4 className="font-medium">Natural Conversation</h4>
                      <p className="text-sm text-gray-600">The AI interviewer will speak to you naturally. Respond as you would in a real interview.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <h4 className="font-medium">Voice or Text</h4>
                      <p className="text-sm text-gray-600">You can speak your answers (recommended) or type them. The AI will respond with voice and text.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <h4 className="font-medium">Follow-up Questions</h4>
                      <p className="text-sm text-gray-600">The AI may ask follow-up questions based on your responses, just like a real interviewer.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                    <div>
                      <h4 className="font-medium">Real-time Analysis</h4>
                      <p className="text-sm text-gray-600">Your responses are analyzed in real-time for comprehensive feedback at the end.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Start Button */}
            <div className="text-center">
              <Button
                onClick={() => setShowPreparation(false)}
                disabled={!isReady}
                size="lg"
                className="px-8 py-3 text-lg"
              >
                <Brain className="w-5 h-5 mr-2" />
                Start Virtual Interview
              </Button>
              
              {!isReady && (
                <p className="text-sm text-red-500 mt-2">
                  Please complete the system requirements check above
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <VirtualAIInterviewer
      questions={questions}
      onComplete={handleInterviewComplete}
      companyName={companyName}
      jobTitle={jobTitle}
      interviewType={interviewType}
      timeLimit={45}
    />
  )
}

export default VirtualInterviewWrapper