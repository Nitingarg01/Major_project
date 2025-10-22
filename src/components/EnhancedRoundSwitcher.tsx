'use client'
import React from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Brain, 
  Users, 
  Calculator, 
  Code, 
  Play,
  Lock,
  ArrowRight 
} from 'lucide-react'
import { InterviewRound } from '@/types/interview';

interface EnhancedRoundSwitcherProps {
  rounds: InterviewRound[]
  currentRound: number
  onRoundSwitch: (roundIndex: number) => void
  canSwitchToRound?: (roundIndex: number) => boolean
  timeSpent?: { [roundId: string]: number }
  totalTimeLimit?: number
}

const EnhancedRoundSwitcher: React.FC<EnhancedRoundSwitcherProps> = ({
  rounds,
  currentRound,
  onRoundSwitch,
  canSwitchToRound = () => true,
  timeSpent = {},
  totalTimeLimit = 90;
}) => {
  const getRoundIcon = (roundType: string) => {
    switch (roundType) {
      case 'technical': return Code
      case 'behavioral': return Users
      case 'aptitude': return Calculator
      case 'dsa': return Brain
      default: return Circle
    }
  }

  const getRoundColor = (roundType: string) => {
    switch (roundType) {
      case 'technical': return 'from-blue-500 to-cyan-500'
      case 'behavioral': return 'from-green-500 to-emerald-500'
      case 'aptitude': return 'from-purple-500 to-pink-500'
      case 'dsa': return 'from-orange-500 to-red-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle
      case 'in-progress': return Play
      case 'pending': return Circle
      default: return Circle
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'in-progress': return 'text-blue-600'
      case 'pending': return 'text-gray-400'
      default: return 'text-gray-400'
    }
  }

  const getTotalProgress = () => {
    const completedRounds = rounds.filter(r => r.status === 'completed').length;
    return (completedRounds / rounds.length) * 100;
  }

  const getTotalTimeSpent = () => {
    return Object.values(timeSpent).reduce((sum, time) => sum + time, 0);
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Interview Progress</h3>
          <p className="text-sm text-gray-500">
            Round {currentRound + 1} of {rounds.length} • {Math.round(getTotalProgress())}% Complete
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Time Spent</div>
          <div className="text-lg font-semibold text-gray-800">
            {formatTime(Math.round(getTotalTimeSpent() / 60))} / {formatTime(totalTimeLimit)}
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mb-6">
        <Progress value={getTotalProgress()} className="h-2" />
      </div>

      {/* Round Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {rounds.map((round, index) => {
          const RoundIcon = getRoundIcon(round.type);
          const StatusIcon = getStatusIcon(round.status);
          const isCurrentRound = index === currentRound;
          const canSwitch = canSwitchToRound(index);
          const roundTime = timeSpent[round.id] || 0;

          return (
            <div
              key={round.id}
              className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer ${
                isCurrentRound
                  ? 'border-blue-500 bg-blue-50'
                  : round.status === 'completed';
                    ? 'border-green-300 bg-green-50'
                    : canSwitch
                      ? 'border-gray-200 hover:border-gray-300 bg-white'
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
              }`}
              onClick={() => canSwitch && onRoundSwitch(index)}
            >
              {/* Status Badge */}
              <div className="absolute top-2 right-2">
                <StatusIcon className={`w-5 h-5 ${getStatusColor(round.status)}`} />
              </div>

              {/* Lock Icon for unavailable rounds */}
              {!canSwitch && (
                <div className="absolute top-2 left-2">
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
              )}

              {/* Round Info */}
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${getRoundColor(round.type)}`}>
                  <RoundIcon className="w-5 h-5 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 capitalize truncate">
                    {round.type} Round
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {round.duration} min limit
                    </span>
                  </div>
                  
                  {/* Questions count */}
                  <div className="mt-2">
                    <span className="text-xs text-gray-500">
                      {round.questions?.length || 0} questions
                    </span>
                  </div>

                  {/* Score if completed */}
                  {round.status === 'completed' && round.score && (
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        Score: {Math.round(round.score)}%
                      </Badge>
                    </div>
                  )}

                  {/* Time spent */}
                  {roundTime > 0 && (
                    <div className="mt-1">
                      <span className="text-xs text-gray-500">
                        Time: {formatTime(Math.round(roundTime / 60))}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Current Round Indicator */}
              {isCurrentRound && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Round Navigation Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-4">
          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-600" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1">
              <Play className="w-3 h-3 text-blue-600" />
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-1">
              <Circle className="w-3 h-3 text-gray-400" />
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-gray-400" />
              <span>Locked</span>
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="flex items-center gap-2">
          {currentRound > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRoundSwitch(currentRound - 1)}
              disabled={!canSwitchToRound(currentRound - 1)}
            >
              Previous Round
            </Button>
          )}
          
          {currentRound < rounds.length - 1 && (
            <Button
              size="sm"
              onClick={() => onRoundSwitch(currentRound + 1)}
              disabled={!canSwitchToRound(currentRound + 1)}
              className="flex items-center gap-1"
            >
              Next Round
              <ArrowRight className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Current Round Details */}
      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        {(() => {
          const CurrentRoundIcon = getRoundIcon(rounds[currentRound]?.type);
          return (
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${getRoundColor(rounds[currentRound]?.type)}`}>
                <CurrentRoundIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">
                  Current: {rounds[currentRound]?.type.charAt(0).toUpperCase() + rounds[currentRound]?.type.slice(1)} Round
                </h4>
                <p className="text-sm text-gray-600">
                  {rounds[currentRound]?.questions?.length || 0} questions • {rounds[currentRound]?.duration} minutes
                </p>
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}

export default EnhancedRoundSwitcher;