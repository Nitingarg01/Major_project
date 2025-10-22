'use client'
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Brain, Loader2, CheckCircle, AlertCircle, Lightbulb, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface StreamingFeedbackProps {
  question: string
  userAnswer: string
  expectedAnswer: string
  difficulty: string
  onFeedbackComplete?: (feedback: any) => void
}

interface FeedbackData {
  score: number
  feedback: string
  strengths: string[]
  improvements: string[]
  tips: string[]
}

const StreamingFeedback = ({ 
  question, 
  userAnswer, 
  expectedAnswer, 
  difficulty,
  onFeedbackComplete 
}: StreamingFeedbackProps) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [streamingText, setStreamingText] = useState('');

  const startStreaming = async () => {
    setIsStreaming(true);
    setProgress(0);
    setFeedback(null);
    setStreamingText('');

    try {
      const response = await fetch('/api/stream-response', {
        method: 'POST';
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          userAnswer,
          expectedAnswer,
          difficulty
        })
      })

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              switch (data.type) {
                case 'status':
                  setCurrentStatus(data.data);
                  setProgress(prev => Math.min(prev + 20, 90));
                  break;
                case 'feedback':
                  setFeedback(data.data);
                  setProgress(100);
                  setCurrentStatus('Analysis complete!');
                  if (onFeedbackComplete) {
                    onFeedbackComplete(data.data);
                  }
                  break;
                case 'complete':
                  setIsStreaming(false);
                  break;
                case 'error':
                  toast.error(data.data);
                  setIsStreaming(false);
                  break;
              }
            } catch (e) {
              console.error('Error parsing streaming data:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      toast.error('Failed to generate feedback');
      setIsStreaming(false);
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  }

  const getScoreIcon = (score: number) => {
    if (score >= 8) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 6) return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    return <AlertCircle className="w-5 h-5 text-red-600" />;
  }

  return (
    <div className="space-y-6">
      {/* Analysis Trigger */}
      {!isStreaming && !feedback && (
        <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Brain className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Get AI-Powered Feedback
            </h3>
            <p className="text-blue-600 text-center mb-4 max-w-md">
              Get instant, detailed analysis of your answer with personalized improvement suggestions
            </p>
            <Button onClick={startStreaming} className="bg-blue-600 hover:bg-blue-700">
              <Brain className="w-4 h-4 mr-2" />
              Analyze My Answer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Streaming Status */}
      {isStreaming && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Loader2 className="w-5 h-5 animate-spin" />
              AI Analysis in Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-blue-700">
                <span>{currentStatus}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            <p className="text-sm text-blue-600">
              Our AI is carefully analyzing your response across multiple dimensions...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Feedback Results */}
      {feedback && (
        <div className="space-y-4">
          {/* Score Card */}
          <Card className={`border-2 ${getScoreColor(feedback.score)}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getScoreIcon(feedback.score)}
                  <span>Your Score</span>
                </div>
                <Badge variant="outline" className={`text-lg px-3 py-1 ${getScoreColor(feedback.score)}`}>
                  {feedback.score}/10
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{feedback.feedback}</p>
            </CardContent>
          </Card>

          {/* Strengths */}
          {feedback.strengths && feedback.strengths.length > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <TrendingUp className="w-5 h-5" />
                  Your Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feedback.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-green-800">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Improvements */}
          {feedback.improvements && feedback.improvements.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <AlertCircle className="w-5 h-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feedback.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span className="text-orange-800">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          {feedback.tips && feedback.tips.length > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Lightbulb className="w-5 h-5" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feedback.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-blue-800">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

export default StreamingFeedback;