'use client'
import React from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { MessageSquare, Bot, Sparkles, Clock, Brain, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface InterviewModeSelectorProps {
  interviewId: string
  companyName: string
  jobTitle: string
  onModeSelect?: (mode: 'traditional' | 'virtual') => void
}

const InterviewModeSelector: React.FC<InterviewModeSelectorProps> = ({
  interviewId,
  companyName,
  jobTitle,
  onModeSelect
}) => {
  const router = useRouter()

  const handleModeSelection = (mode: 'traditional' | 'virtual') => {
    if (onModeSelect) {
      onModeSelect(mode)
    } else {
      // Navigate to interview with mode parameter
      router.push(`/interview/${interviewId}/perform?mode=${mode}`)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6" data-testid="interview-mode-selector">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Choose Your Interview Mode
        </h1>
        <p className="text-lg text-gray-600">
          {jobTitle} at {companyName}
        </p>
      </div>

      {/* Mode Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Traditional Mode */}
        <Card 
          className="border-2 border-blue-300 hover:border-blue-500 transition-all duration-300 hover:shadow-xl cursor-pointer group"
          onClick={() => handleModeSelection('traditional')}
          data-testid="traditional-mode-card"
        >
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>

              {/* Title */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Traditional Interview</h2>
                <Badge variant="outline" className="border-blue-300 text-blue-700">
                  Classic Format
                </Badge>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Text-Based Interview</p>
                    <p className="text-xs text-gray-600">Type your responses at your own pace</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Flexible Timing</p>
                    <p className="text-xs text-gray-600">Take your time to craft answers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Brain className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">AI Feedback</p>
                    <p className="text-xs text-gray-600">Get detailed analysis after completion</p>
                  </div>
                </div>
              </div>

              {/* Best For */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-xs font-semibold text-blue-800 mb-1">Best For:</p>
                <p className="text-xs text-blue-700">Candidates who prefer writing responses and want more time to think</p>
              </div>

              {/* CTA */}
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                data-testid="select-traditional-mode"
              >
                Start Traditional Interview
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Virtual AI Mode */}
        <Card 
          className="border-2 border-purple-300 hover:border-purple-500 transition-all duration-300 hover:shadow-xl cursor-pointer group relative overflow-hidden"
          onClick={() => handleModeSelection('virtual')}
          data-testid="virtual-mode-card"
        >
          {/* Premium Badge */}
          <div className="absolute top-4 right-4">
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <Sparkles className="w-3 h-3 mr-1" />
              Enhanced
            </Badge>
          </div>

          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform animate-pulse-slow">
                <Bot className="w-8 h-8 text-white" />
              </div>

              {/* Title */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Virtual AI Interview</h2>
                <Badge variant="outline" className="border-purple-300 text-purple-700">
                  Next-Gen Experience
                </Badge>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Bot className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">AI Voice Interviewer</p>
                    <p className="text-xs text-gray-600">Natural conversation with AI voice</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Speech Recognition</p>
                    <p className="text-xs text-gray-600">Speak your answers naturally</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Real-Time Analysis</p>
                    <p className="text-xs text-gray-600">Live feedback on confidence & body language</p>
                  </div>
                </div>
              </div>

              {/* Best For */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-200">
                <p className="text-xs font-semibold text-purple-800 mb-1">Best For:</p>
                <p className="text-xs text-purple-700">Realistic interview simulation with AI coach, emotion detection, and comprehensive feedback</p>
              </div>

              {/* CTA */}
              <Button 
                className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700"
                data-testid="select-virtual-mode"
              >
                <Bot className="w-4 h-4 mr-2" />
                Start Virtual AI Interview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-purple-200">
        <div className="flex items-start gap-4">
          <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Why Choose Virtual AI Interview?</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>Multi-Round Interviews:</strong> Experience HR, Technical, and Manager rounds in one session</li>
              <li>• <strong>AI Interview Coach:</strong> Get real-time hints and suggestions during practice</li>
              <li>• <strong>Confidence Tracking:</strong> Monitor your confidence score live</li>
              <li>• <strong>Body Language Analysis:</strong> Improve posture, eye contact, and presentation</li>
              <li>• <strong>ElevenLabs Voice:</strong> Natural, human-like AI interviewer voice</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InterviewModeSelector