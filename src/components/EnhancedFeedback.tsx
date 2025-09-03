'use client'
import React from 'react'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Target, 
  Brain, 
  MessageCircle,
  Code,
  Users,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react'

interface FeedbackData {
  [key: string]: number
}

interface EnhancedFeedbackProps {
  data: number[]
  labels: string[]
  overallScore: number
}

// Icon mapping for different skill categories
const getSkillIcon = (label: string) => {
  const iconMap: { [key: string]: any } = {
    'Technical Knowledge': Code,
    'Problem Solving': Brain,
    'Communication Skills': MessageCircle,
    'Analytical Thinking': Target,
    'Practical Application': Award,
    'Behavioral': Users,
    'Technical': Code,
    'Communication': MessageCircle,
    'Problem-Solving': Brain,
    'Leadership': Users,
    'Teamwork': Users,
    'default': Target
  }
  
  return iconMap[label] || iconMap['default']
}

// Get color based on score
const getScoreColor = (score: number) => {
  if (score >= 8) return 'text-green-600 bg-green-50 border-green-200'
  if (score >= 6) return 'text-blue-600 bg-blue-50 border-blue-200'
  if (score >= 4) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  return 'text-red-600 bg-red-50 border-red-200'
}

const getProgressColor = (score: number) => {
  if (score >= 8) return 'bg-green-500'
  if (score >= 6) return 'bg-blue-500'
  if (score >= 4) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getScoreIcon = (score: number) => {
  if (score >= 8) return CheckCircle
  if (score >= 6) return Target
  if (score >= 4) return AlertCircle
  return XCircle
}

const EnhancedFeedback = ({ data, labels, overallScore }: EnhancedFeedbackProps) => {
  // Calculate average and identify strengths/improvements
  const averageScore = data.length > 0 ? Math.round(data.reduce((a, b) => a + b, 0) / data.length) : 0
  const maxScore = Math.max(...data)
  const minScore = Math.min(...data)
  
  const strengths = labels.filter((_, index) => data[index] >= 7)
  const needsImprovement = labels.filter((_, index) => data[index] < 5)

  return (
    <div className="space-y-6">
      {/* Overall Performance Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Performance Analysis</h2>
            <p className="text-gray-600">Detailed breakdown of your interview performance</p>
          </div>
          <div className={`text-right p-4 rounded-lg border-2 ${getScoreColor(overallScore)}`}>
            <div className="text-3xl font-bold">{overallScore}/10</div>
            <div className="text-sm font-medium">Overall Score</div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white p-3 rounded-lg border">
            <div className="text-xl font-bold text-green-600">{strengths.length}</div>
            <div className="text-sm text-gray-600">Strong Areas</div>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <div className="text-xl font-bold text-blue-600">{averageScore}</div>
            <div className="text-sm text-gray-600">Average Score</div>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <div className="text-xl font-bold text-yellow-600">{needsImprovement.length}</div>
            <div className="text-sm text-gray-600">Areas to Improve</div>
          </div>
        </div>
      </div>

      {/* Detailed Skill Breakdown */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Skill-wise Performance
        </h3>
        
        <div className="space-y-4">
          {labels.map((label, index) => {
            const score = data[index]
            const IconComponent = getSkillIcon(label)
            const ScoreIcon = getScoreIcon(score)
            
            return (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getScoreColor(score)}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{label}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <ScoreIcon className={`w-4 h-4 ${score >= 7 ? 'text-green-600' : score >= 5 ? 'text-yellow-600' : 'text-red-600'}`} />
                        <span className="text-sm text-gray-600">
                          {score >= 8 ? 'Excellent' : score >= 6 ? 'Good' : score >= 4 ? 'Average' : 'Needs Work'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800">{score}</div>
                    <div className="text-sm text-gray-500">/10</div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(score)}`}
                    style={{ width: `${(score / 10) * 100}%` }}
                  ></div>
                </div>
                
                {/* Performance Level */}
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Poor</span>
                  <span>Average</span>
                  <span>Excellent</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Strengths and Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Your Strengths ({strengths.length})
          </h3>
          {strengths.length > 0 ? (
            <div className="space-y-2">
              {strengths.map((strength, index) => (
                <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 text-sm">
                  {strength}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-green-700 text-sm">Keep practicing to develop strong areas!</p>
          )}
        </div>

        {/* Areas for Improvement */}
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            Focus Areas ({needsImprovement.length})
          </h3>
          {needsImprovement.length > 0 ? (
            <div className="space-y-2">
              {needsImprovement.map((area, index) => (
                <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800 text-sm">
                  {area}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-orange-700 text-sm">Great! No major areas of concern identified.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default EnhancedFeedback