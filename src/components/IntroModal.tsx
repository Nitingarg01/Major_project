'use client'
import React from 'react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Clock, Camera, Mic, Brain, AlertTriangle, CheckCircle, Target } from 'lucide-react'
import { InterviewRound } from '@/types/interview'

interface IntroModalProps {
  onStart: () => void
  companyName?: string
  jobTitle?: string
  interviewType?: string
  estimatedDuration?: number
  rounds?: InterviewRound[]
}

const IntroModal = ({ 
  onStart, 
  companyName, 
  jobTitle, 
  interviewType,
  estimatedDuration,
  rounds 
}: IntroModalProps) => {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Brain className="w-10 h-10 text-blue-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            AI Mock Interview
          </h1>
          <Target className="w-10 h-10 text-purple-600" />
        </div>
        
        {companyName && jobTitle && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {jobTitle} at {companyName}
            </h2>
            <Badge variant="outline" className="mt-2">
              {interviewType?.toUpperCase()} Interview
            </Badge>
          </div>
        )}
      </div>

      {/* Interview Rounds */}
      {rounds && rounds.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            Interview Structure
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rounds.map((round, index) => (
              <div key={round.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium capitalize">{round.type} Round</h4>
                  <Badge variant="secondary">{round.duration} min</Badge>
                </div>
                <p className="text-sm text-gray-600">
                  {round.questions.length} questions • {round.type} focus
                </p>
              </div>
            ))}
          </div>
          {estimatedDuration && (
            <div className="mt-4 text-center">
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <Clock className="w-4 h-4" />
                <span className="font-medium">Total Duration: ~{estimatedDuration} minutes</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Requirements */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            Requirements
          </h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <Camera className="w-4 h-4 text-blue-500" />
              <span>Camera access for monitoring</span>
            </li>
            <li className="flex items-center gap-3">
              <Mic className="w-4 h-4 text-blue-500" />
              <span>Microphone for voice responses</span>
            </li>
            <li className="flex items-center gap-3">
              <Brain className="w-4 h-4 text-blue-500" />
              <span>Quiet environment</span>
            </li>
            <li className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Stable internet connection</span>
            </li>
          </ul>
        </div>

        {/* Guidelines */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-orange-600">
            <AlertTriangle className="w-5 h-5" />
            Guidelines
          </h3>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="text-orange-500">•</span>
              <span>Look directly at the camera</span>
            </li>
            <li className="flex gap-3">
              <span className="text-orange-500">•</span>
              <span>Avoid switching tabs or windows</span>
            </li>
            <li className="flex gap-3">
              <span className="text-orange-500">•</span>
              <span>Answer clearly and concisely</span>
            </li>
            <li className="flex gap-3">
              <span className="text-orange-500">•</span>
              <span>Take your time to think</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Features */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4 text-center">What You'll Experience</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-medium">AI-Powered Questions</h4>
            <p className="text-xs text-gray-600">Tailored to your experience and role</p>
          </div>
          
          <div className="space-y-2">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Camera className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-medium">Real-time Monitoring</h4>
            <p className="text-xs text-gray-600">Professional interview simulation</p>
          </div>
          
          <div className="space-y-2">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-medium">Instant Feedback</h4>
            <p className="text-xs text-gray-600">Detailed analysis and improvement tips</p>
          </div>
        </div>
      </div>

      {/* Privacy Note */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-500 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-gray-800 mb-1">Privacy & Security</p>
            <p className="text-gray-600">
              Your camera feed is processed locally for monitoring. No video is recorded or stored. 
              All data is encrypted and used only for interview analysis.
            </p>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="text-center">
        <Button 
          onClick={onStart}
          size="lg"
          className="px-12 py-4 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          Start Interview
        </Button>
        <p className="text-xs text-gray-500 mt-3">
          By starting, you agree to our monitoring and feedback policies
        </p>
      </div>
    </div>
  )
}

export default IntroModal