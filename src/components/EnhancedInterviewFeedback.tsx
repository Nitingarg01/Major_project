'use client'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  Award, 
  AlertCircle,
  CheckCircle,
  Clock,
  MessageSquare,
  Brain,
  Smile,
  Frown,
  Meh,
  Target,
  BarChart3,
  Lightbulb
} from 'lucide-react'
import type { EmotionAnalytics } from '@/lib/emotionDetectionService'

interface InterviewResponse {
  questionIndex: number
  question: string
  userAnswer: string
  aiFollowUp?: string
  timestamp: Date
  responseTime: number
  analysis?: {
    score: number
    strengths: string[]
    improvements: string[]
    feedback: string
    confidence: number
    clarity: number
    relevance: number
  }
}

interface EnhancedInterviewFeedbackProps {
  responses: InterviewResponse[]
  emotionAnalytics?: EmotionAnalytics
  overallScore: number
  totalTime: number
  averageResponseTime: number
  interviewType: string
  jobTitle: string
  companyName: string
}

const EnhancedInterviewFeedback: React.FC<EnhancedInterviewFeedbackProps> = ({
  responses,
  emotionAnalytics,
  overallScore,
  totalTime,
  averageResponseTime,
  interviewType,
  jobTitle,
  companyName
}) => {
  // Calculate aggregate metrics
  const avgConfidence = responses.reduce((sum, r) => sum + (r.analysis?.confidence || 0), 0) / responses.length
  const avgClarity = responses.reduce((sum, r) => sum + (r.analysis?.clarity || 0), 0) / responses.length
  const avgRelevance = responses.reduce((sum, r) => sum + (r.analysis?.relevance || 0), 0) / responses.length

  // Collect all strengths and improvements
  const allStrengths = responses.flatMap(r => r.analysis?.strengths || [])
  const allImprovements = responses.flatMap(r => r.analysis?.improvements || [])

  // Get unique strengths and improvements
  const uniqueStrengths = [...new Set(allStrengths)]
  const uniqueImprovements = [...new Set(allImprovements)]

  // Get performance rating
  const getPerformanceRating = (score: number): { text: string; color: string; icon: React.ReactNode } => {
    if (score >= 8.5) return { text: 'Excellent', color: 'bg-green-500', icon: <Award className="w-5 h-5" /> }
    if (score >= 7) return { text: 'Good', color: 'bg-blue-500', icon: <CheckCircle className="w-5 h-5" /> }
    if (score >= 5.5) return { text: 'Average', color: 'bg-yellow-500', icon: <Meh className="w-5 h-5" /> }
    return { text: 'Needs Improvement', color: 'bg-red-500', icon: <AlertCircle className="w-5 h-5" /> }
  }

  const rating = getPerformanceRating(overallScore)

  // Format time
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  // Get emotion icon
  const getEmotionIcon = (emotion: string) => {
    const icons: Record<string, React.ReactNode> = {
      happy: <Smile className="w-4 h-4 text-green-500" />,
      focused: <Target className="w-4 h-4 text-blue-500" />,
      engaged: <Brain className="w-4 h-4 text-purple-500" />,
      neutral: <Meh className="w-4 h-4 text-gray-500" />,
      confused: <AlertCircle className="w-4 h-4 text-yellow-500" />,
      stressed: <Frown className="w-4 h-4 text-red-500" />
    }
    return icons[emotion] || icons.neutral
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Interview Performance Report</h1>
        <p className="text-gray-600">
          {interviewType} Interview for {jobTitle} at {companyName}
        </p>
      </div>

      {/* Overall Score Card */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-center text-2xl flex items-center justify-center gap-3">
            {rating.icon}
            Overall Performance: {rating.text}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-6xl font-bold text-purple-600 mb-2">
              {overallScore.toFixed(1)}<span className="text-3xl text-gray-500">/10</span>
            </div>
            <Progress value={overallScore * 10} className="h-3" />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-3 bg-white rounded-lg">
              <Clock className="w-5 h-5 mx-auto mb-1 text-blue-500" />
              <div className="text-sm text-gray-600">Total Time</div>
              <div className="font-semibold">{formatTime(totalTime)}</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <MessageSquare className="w-5 h-5 mx-auto mb-1 text-green-500" />
              <div className="text-sm text-gray-600">Questions</div>
              <div className="font-semibold">{responses.length}</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <Brain className="w-5 h-5 mx-auto mb-1 text-purple-500" />
              <div className="text-sm text-gray-600">Avg Response</div>
              <div className="font-semibold">{formatTime(averageResponseTime)}</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <Target className="w-5 h-5 mx-auto mb-1 text-orange-500" />
              <div className="text-sm text-gray-600">Confidence</div>
              <div className="font-semibold">{avgConfidence.toFixed(1)}/10</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {avgConfidence.toFixed(1)}/10
            </div>
            <Progress value={avgConfidence * 10} className="mb-2" />
            <p className="text-sm text-gray-600">
              {avgConfidence >= 7 ? 'Strong confidence in responses' : 
               avgConfidence >= 5 ? 'Moderate confidence level' :
               'Work on building confidence'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-500" />
              Clarity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {avgClarity.toFixed(1)}/10
            </div>
            <Progress value={avgClarity * 10} className="mb-2" />
            <p className="text-sm text-gray-600">
              {avgClarity >= 7 ? 'Clear and well-structured responses' :
               avgClarity >= 5 ? 'Responses could be more concise' :
               'Focus on clarity and structure'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              Relevance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {avgRelevance.toFixed(1)}/10
            </div>
            <Progress value={avgRelevance * 10} className="mb-2" />
            <p className="text-sm text-gray-600">
              {avgRelevance >= 7 ? 'Highly relevant responses' :
               avgRelevance >= 5 ? 'Mostly on-topic answers' :
               'Stay focused on the question'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Emotion Analytics */}
      {emotionAnalytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smile className="w-5 h-5 text-yellow-500" />
              Emotional Engagement Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Dominant Emotion</div>
                <div className="flex items-center justify-center gap-2">
                  {getEmotionIcon(emotionAnalytics.dominantEmotion)}
                  <span className="font-semibold capitalize">{emotionAnalytics.dominantEmotion}</span>
                </div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Engagement Score</div>
                <div className="text-2xl font-bold text-green-600">
                  {emotionAnalytics.engagementScore.toFixed(0)}%
                </div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Avg Confidence</div>
                <div className="text-2xl font-bold text-blue-600">
                  {(emotionAnalytics.averageConfidence * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-gray-700">Emotion Distribution</h4>
              {Object.entries(emotionAnalytics.emotionDistribution).map(([emotion, percentage]) => (
                <div key={emotion} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {getEmotionIcon(emotion)}
                      <span className="capitalize">{emotion}</span>
                    </div>
                    <span className="font-medium">{percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strengths */}
      {uniqueStrengths.length > 0 && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <TrendingUp className="w-5 h-5" />
              Key Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {uniqueStrengths.slice(0, 5).map((strength, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Improvements */}
      {uniqueImprovements.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Lightbulb className="w-5 h-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {uniqueImprovements.slice(0, 5).map((improvement, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <TrendingDown className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{improvement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Question-by-Question Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Question-by-Question Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {responses.map((response, idx) => (
            <div key={idx} className="p-4 border border-gray-200 rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Badge variant="outline" className="mb-2">Question {idx + 1}</Badge>
                  <p className="font-medium text-gray-800">{response.question}</p>
                </div>
                {response.analysis && (
                  <Badge 
                    className={`${
                      response.analysis.score >= 7 ? 'bg-green-500' :
                      response.analysis.score >= 5 ? 'bg-yellow-500' :
                      'bg-red-500'
                    } text-white`}
                  >
                    {response.analysis.score.toFixed(1)}/10
                  </Badge>
                )}
              </div>
              
              {response.analysis && (
                <>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Confidence:</span>
                      <span className="font-medium ml-1">{response.analysis.confidence.toFixed(1)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Clarity:</span>
                      <span className="font-medium ml-1">{response.analysis.clarity.toFixed(1)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Relevance:</span>
                      <span className="font-medium ml-1">{response.analysis.relevance.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <div className="text-sm bg-gray-50 p-3 rounded">
                    <span className="font-medium text-gray-700">Feedback: </span>
                    <span className="text-gray-600">{response.analysis.feedback}</span>
                  </div>
                </>
              )}
              
              <div className="text-xs text-gray-500">
                Response time: {formatTime(response.responseTime)}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default EnhancedInterviewFeedback
