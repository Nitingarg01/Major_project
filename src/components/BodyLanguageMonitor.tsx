'use client'
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Eye, User, Move, Target } from 'lucide-react';
import type { BodyLanguageData } from '@/lib/bodyLanguageService';

interface BodyLanguageMonitorProps {
  data: BodyLanguageData
  showRecommendations?: boolean
}

const BodyLanguageMonitor: React.FC<BodyLanguageMonitorProps> = ({
  data,
  showRecommendations = true;
}) => {
  const getPostureColor = (posture: string) => {
    switch (posture) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-300'
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'fair': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'poor': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }

  const getFidgetingColor = (fidgeting: string) => {
    switch (fidgeting) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'moderate': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <Card className="border-2 border-purple-200" data-testid="body-language-monitor">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="w-5 h-5 text-purple-600" />
          Body Language
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Confidence Score */}
        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
          <div className="text-3xl font-bold text-purple-600">
            {data.confidence}%
          </div>
          <p className="text-sm text-gray-600 mt-1">Non-Verbal Confidence</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Posture */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Target className="w-4 h-4" />
              <span>Posture</span>
            </div>
            <Badge 
              className={`w-full justify-center py-2 border-2 ${getPostureColor(data.posture)}`}
              variant="outline"
            >
              {data.posture.charAt(0).toUpperCase() + data.posture.slice(1)}
            </Badge>
          </div>

          {/* Eye Contact */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Eye className="w-4 h-4" />
              <span>Eye Contact</span>
            </div>
            <Badge 
              className={`w-full justify-center py-2 border-2 ${
                data.eyeContact >= 70 ? 'bg-green-100 text-green-800 border-green-300' :;
                data.eyeContact >= 50 ? 'bg-blue-100 text-blue-800 border-blue-300' :;
                'bg-yellow-100 text-yellow-800 border-yellow-300'
              }`}
              variant="outline"
            >
              {data.eyeContact}%
            </Badge>
          </div>

          {/* Fidgeting */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Move className="w-4 h-4" />
              <span>Movement</span>
            </div>
            <Badge 
              className={`w-full justify-center py-2 ${getFidgetingColor(data.fidgeting)}`}
            >
              {data.fidgeting.charAt(0).toUpperCase() + data.fidgeting.slice(1)}
            </Badge>
          </div>

          {/* Head Position */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <User className="w-4 h-4" />
              <span>Position</span>
            </div>
            <Badge 
              className={`w-full justify-center py-2 ${
                data.headPosition === 'centered' ? 'bg-green-100 text-green-800' :;
                'bg-blue-100 text-blue-800'
              }`}
            >
              {data.headPosition.charAt(0).toUpperCase() + data.headPosition.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Quick Feedback */}
        {showRecommendations && (
          <div className="pt-3 border-t">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800 leading-relaxed">
                {data.posture === 'poor' && '💺 Sit up straight for better posture. '}
                {data.eyeContact < 50 && '👁️ Try to look at the camera more often. '}
                {data.fidgeting === 'high' && '🤚 Minimize excessive movements. '}
                {data.posture === 'excellent' && data.eyeContact >= 70 && data.fidgeting === 'low' &&
                  '✅ Excellent body language! Keep it up!'}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default BodyLanguageMonitor;