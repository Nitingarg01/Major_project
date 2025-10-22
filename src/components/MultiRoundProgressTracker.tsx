'use client'
import React from 'react'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Check, Circle, Lock } from 'lucide-react'
import type { RoundProgress, InterviewRound } from '@/lib/multiRoundInterviewManager'

interface MultiRoundProgressTrackerProps {
  rounds: InterviewRound[]
  progress: RoundProgress[]
  currentRoundIndex: number
}

const MultiRoundProgressTracker: React.FC<MultiRoundProgressTrackerProps> = ({
  rounds,
  progress,
  currentRoundIndex
}) => {
  const getStatusIcon = (status: RoundProgress['status'], index: number) => {
    if (status === 'completed') {
      return <Check className="w-5 h-5 text-green-600" />
    } else if (status === 'active') {
      return <Circle className="w-5 h-5 text-blue-600 animate-pulse" />
    } else {
      return <Lock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: RoundProgress['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 border-green-300'
      case 'active': return 'bg-blue-100 border-blue-300 ring-2 ring-blue-400'
      case 'pending': return 'bg-gray-50 border-gray-200'
    }
  }

  const overallProgress = (progress.filter(p => p.status === 'completed').length / rounds.length) * 100

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50" data-testid="multi-round-tracker">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Overall Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800">Interview Progress</h3>
              <span className="text-sm font-medium text-gray-600">
                {Math.round(overallProgress)}% Complete
              </span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>

          {/* Round Steps */}
          <div className="space-y-4">
            {rounds.map((round, index) => {
              const roundProgress = progress[index]
              const isActive = index === currentRoundIndex

              return (
                <div
                  key={round.id}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                    getStatusColor(roundProgress.status)
                  } ${isActive ? 'transform scale-[1.02]' : ''}`}
                  data-testid={`round-step-${round.type.toLowerCase()}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                        roundProgress.status === 'completed' ? 'bg-green-200' :
                        roundProgress.status === 'active' ? 'bg-blue-200' :
                        'bg-gray-200'
                      }`}>
                        {round.icon}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-800">{round.name}</h4>
                        {getStatusIcon(roundProgress.status, index)}
                        {roundProgress.status === 'active' && (
                          <Badge className="bg-blue-600">In Progress</Badge>
                        )}
                        {roundProgress.status === 'completed' && (
                          <Badge className="bg-green-600">
                            Score: {roundProgress.score.toFixed(1)}/10
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{round.description}</p>
                      
                      {/* Focus Areas */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {round.focusAreas.slice(0, 3).map((area, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                        {round.focusAreas.length > 3 && (
                          <Badge variant="outline" className="text-xs text-gray-500">
                            +{round.focusAreas.length - 3} more
                          </Badge>
                        )}
                      </div>

                      {/* Progress Details */}
                      {roundProgress.status !== 'pending' && (
                        <div className="flex items-center gap-4 text-xs text-gray-600 mt-2">
                          {roundProgress.questionsTotal > 0 && (
                            <span>
                              Questions: {roundProgress.questionsAnswered}/{roundProgress.questionsTotal}
                            </span>
                          )}
                          {roundProgress.timeSpent > 0 && (
                            <span>
                              Time: {Math.round(roundProgress.timeSpent / 60)} min
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary */}
          <div className="pt-4 border-t border-gray-300">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-800">
                  {progress.filter(p => p.status === 'completed').length}
                </div>
                <div className="text-xs text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {progress.filter(p => p.status === 'active').length}
                </div>
                <div className="text-xs text-gray-600">Active</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {progress.filter(p => p.status === 'pending').length}
                </div>
                <div className="text-xs text-gray-600">Remaining</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default MultiRoundProgressTracker