'use client'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  Brain, 
  MessageSquare, 
  Video, 
  Mic, 
  Clock, 
  Star,
  ArrowRight,
  CheckCircle,
  Zap
} from 'lucide-react'

interface InterviewModeSelectorProps {
  interviewId: string
  onModeSelect: (mode: 'standard' | 'virtual') => void
  companyName: string
  jobTitle: string
  questionCount: number
}

const InterviewModeSelector: React.FC<InterviewModeSelectorProps> = ({
  interviewId,
  onModeSelect,
  companyName,
  jobTitle,
  questionCount
}) => {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Choose Your Interview Experience
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select how you'd like to take your {jobTitle} interview at {companyName}. 
          Both modes provide comprehensive evaluation and feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Standard Interview Mode */}
        <Card className="relative overflow-hidden border-2 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center">
                <MessageSquare className="w-6 h-6 mr-3 text-blue-600" />
                Standard Interview
              </CardTitle>
              <Badge variant="secondary">Traditional</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600">
              Take the interview at your own pace with text-based questions and responses. 
              Perfect for thoughtful, detailed answers.
            </p>

            {/* Features */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Features:</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Text-based questions and answers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Take your time to think</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Edit answers before submitting</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Works on any device</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{questionCount}</div>
                <div className="text-xs text-gray-600">Questions</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">∞</div>
                <div className="text-xs text-gray-600">Time Limit</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">Easy</div>
                <div className="text-xs text-gray-600">Setup</div>
              </div>
            </div>

            <Button 
              onClick={() => onModeSelect('standard')}
              className="w-full"
              variant="outline"
            >
              Start Standard Interview
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Virtual AI Interview Mode */}
        <Card className="relative overflow-hidden border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="absolute top-4 right-4">
            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <Star className="w-3 h-3 mr-1" />
              NEW
            </Badge>
          </div>
          
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center">
              <Brain className="w-6 h-6 mr-3 text-purple-600" />
              Virtual AI Interview
            </CardTitle>
            <p className="text-sm text-purple-700 font-medium">
              🚀 Experience the future of interviews
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-700">
              Have a natural conversation with an AI interviewer that speaks, listens, 
              and responds just like a human interviewer. Revolutionary technology!
            </p>

            {/* Features */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Advanced Features:</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-purple-500" />
                  <span className="text-sm">AI voice conversation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mic className="w-4 h-4 text-purple-500" />
                  <span className="text-sm">Speech-to-text recognition</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Video className="w-4 h-4 text-purple-500" />
                  <span className="text-sm">Face-to-face interaction</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-purple-500" />
                  <span className="text-sm">Intelligent follow-up questions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-purple-500" />
                  <span className="text-sm">Natural conversation flow</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <div className="text-lg font-bold text-purple-600">{questionCount}</div>
                <div className="text-xs text-gray-600">Questions</div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <div className="text-lg font-bold text-purple-600">45</div>
                <div className="text-xs text-gray-600">Minutes</div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <div className="text-lg font-bold text-purple-600">AI</div>
                <div className="text-xs text-gray-600">Powered</div>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white/70 p-4 rounded-lg border border-purple-200">
              <h5 className="font-medium text-gray-800 mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-purple-600" />
                Requirements:
              </h5>
              <div className="text-sm text-gray-600 space-y-1">
                <div>• Camera and microphone access</div>
                <div>• Modern browser (Chrome, Firefox, Safari)</div>
                <div>• Stable internet connection</div>
              </div>
            </div>

            <Button 
              onClick={() => onModeSelect('virtual')}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <Brain className="w-4 h-4 mr-2" />
              Start Virtual AI Interview
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Table */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-center">Feature Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Feature</th>
                  <th className="text-center py-3 px-4">Standard</th>
                  <th className="text-center py-3 px-4">Virtual AI</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                <tr className="border-b">
                  <td className="py-3 px-4">Voice Interaction</td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Real-time Conversation</td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Follow-up Questions</td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Edit Answers</td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">❌</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Time Pressure</td>
                  <td className="text-center py-3 px-4">Low</td>
                  <td className="text-center py-3 px-4">Realistic</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Setup Required</td>
                  <td className="text-center py-3 px-4">None</td>
                  <td className="text-center py-3 px-4">Camera/Mic</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Interview Experience</td>
                  <td className="text-center py-3 px-4">Traditional</td>
                  <td className="text-center py-3 px-4">Realistic</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default InterviewModeSelector