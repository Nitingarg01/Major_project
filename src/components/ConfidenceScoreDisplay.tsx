'use client'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react'
import type { ConfidenceMetrics } from '@/lib/confidenceScoreService'

interface ConfidenceScoreDisplayProps {
  metrics: ConfidenceMetrics
  showDetails?: boolean
  compact?: boolean
}

const ConfidenceScoreDisplay: React.FC<ConfidenceScoreDisplayProps> = ({
  metrics,
  showDetails = true,
  compact = false
}) => {
  const getTrendIcon = () => {
    switch (metrics.trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-600" />
      case 'stable': return <Minus className="w-4 h-4 text-gray-600" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 65) return 'text-blue-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-100 border-green-300'
    if (score >= 65) return 'bg-blue-100 border-blue-300'
    if (score >= 50) return 'bg-yellow-100 border-yellow-300'
    return 'bg-red-100 border-red-300'
  }

  if (compact) {
    return (
      <div 
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 ${
          getScoreBackground(metrics.overallConfidence)
        }`}
        data-testid="confidence-score-compact"
      >
        <Activity className="w-4 h-4" />
        <span className={`font-bold ${getScoreColor(metrics.overallConfidence)}`}>
          {metrics.overallConfidence}%
        </span>
        <span className="text-xs text-gray-600">Confidence</span>
        {getTrendIcon()}
      </div>
    )
  }

  return (
    <Card className="border-2 border-blue-200" data-testid="confidence-score-display">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Confidence Score
          </CardTitle>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <span className="text-xs text-gray-600 capitalize">{metrics.trend}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="text-center">
          <div className={`text-5xl font-bold ${getScoreColor(metrics.overallConfidence)}`}>
            {metrics.overallConfidence}%
          </div>
          <p className="text-sm text-gray-600 mt-1">Overall Confidence</p>
        </div>

        {/* Progress Bar */}
        <div>
          <Progress 
            value={metrics.overallConfidence} 
            className="h-3"
          />
        </div>

        {/* Detailed Breakdown */}
        {showDetails && (
          <div className="space-y-3 pt-2 border-t">
            <div className="text-sm font-semibold text-gray-700 mb-2">Breakdown:</div>
            
            {/* Speech Confidence */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Speech & Communication</span>
                <span className="font-semibold">{metrics.speechConfidence}%</span>
              </div>
              <Progress value={metrics.speechConfidence} className="h-2" />
            </div>

            {/* Body Language */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Body Language</span>
                <span className="font-semibold">{metrics.bodyLanguageConfidence}%</span>
              </div>
              <Progress value={metrics.bodyLanguageConfidence} className="h-2" />
            </div>

            {/* Emotional State */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Emotional State</span>
                <span className="font-semibold">{metrics.emotionalConfidence}%</span>
              </div>
              <Progress value={metrics.emotionalConfidence} className="h-2" />
            </div>

            {/* Response Quality */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Response Quality</span>
                <span className="font-semibold">{metrics.responseQualityConfidence}%</span>
              </div>
              <Progress value={metrics.responseQualityConfidence} className="h-2" />
            </div>
          </div>
        )}

        {/* Feedback Badge */}
        <div className="flex items-center justify-center pt-2">
          <Badge 
            className={`${
              metrics.overallConfidence >= 80 ? 'bg-green-600' :
              metrics.overallConfidence >= 65 ? 'bg-blue-600' :
              metrics.overallConfidence >= 50 ? 'bg-yellow-600' :
              'bg-red-600'
            } text-white`}
          >
            {metrics.overallConfidence >= 80 ? '🌟 Excellent Confidence!' :
             metrics.overallConfidence >= 65 ? '👍 Good Confidence' :
             metrics.overallConfidence >= 50 ? '💪 Stay Focused' :
             '📈 Building Confidence'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

export default ConfidenceScoreDisplay