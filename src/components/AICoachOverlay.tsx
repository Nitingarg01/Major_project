'use client'
import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { X, Lightbulb, AlertTriangle, MessageSquare, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import type { CoachHint } from '@/lib/aiInterviewCoach';
import { AIInterviewCoach } from '@/lib/aiInterviewCoach';

interface AICoachOverlayProps {
  isEnabled: boolean
  onToggle: () => void
  currentHints: CoachHint[]
  onDismissHint: (hintId: string) => void
}

const AICoachOverlay: React.FC<AICoachOverlayProps> = ({
  isEnabled,
  onToggle,
  currentHints,
  onDismissHint
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [visibleHints, setVisibleHints] = useState<CoachHint[]>([]);

  useEffect(() => {
    if (isEnabled) {
      setVisibleHints(currentHints.slice(-3)) // Show last 3 hints;
    }
  }, [currentHints, isEnabled])

  if (!isEnabled) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={onToggle}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
          data-testid="ai-coach-enable-button"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Enable AI Coach
        </Button>
      </div>
    )
  }

  const getIcon = (type: CoachHint['type']) => {
    switch (type) {
      case 'tip': return <Lightbulb className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      case 'suggestion': return <MessageSquare className="w-4 h-4" />
      case 'encouragement': return <Sparkles className="w-4 h-4" />
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md" data-testid="ai-coach-overlay">
      <Card className="bg-white shadow-2xl border-2 border-purple-200 overflow-hidden">
        {/* Header */}
        <div 
          className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">AI Interview Coach</span>
            <Badge variant="secondary" className="bg-white/20 text-white text-xs">
              Active
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded);
              }}
              className="text-white hover:bg-white/20 rounded p-1"
              data-testid="ai-coach-toggle-expand"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggle();
              }}
              className="text-white hover:bg-white/20 rounded p-1"
              data-testid="ai-coach-close-button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hints Display */}
        {isExpanded && (
          <div className="p-4 max-h-96 overflow-y-auto space-y-3">
            {visibleHints.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Sparkles className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Listening and ready to help!</p>
                <p className="text-xs mt-1">I'll provide hints as you progress</p>
              </div>
            ) : (
              visibleHints.map((hint) => (
                <div
                  key={hint.id}
                  className={`p-3 rounded-lg border-2 ${AIInterviewCoach.getHintColor(hint.priority)} transition-all duration-300 animate-slideIn`}
                  data-testid={`coach-hint-${hint.type}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1">
                      <div className="mt-0.5">
                        {getIcon(hint.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold uppercase">
                            {hint.type}
                          </span>
                          {hint.priority === 'high' && (
                            <Badge variant="destructive" className="text-xs">
                              Important
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed">
                          {hint.message}
                        </p>
                        <p className="text-xs opacity-60 mt-1">
                          {new Date(hint.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onDismissHint(hint.id)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                      data-testid="dismiss-hint-button"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}

            {visibleHints.length > 0 && (
              <div className="text-center pt-2">
                <p className="text-xs text-gray-500">
                  {AIInterviewCoach.getHintIcon('tip')} Keep going! You're doing great!
                </p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}

export default AICoachOverlay;
