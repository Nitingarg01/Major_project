'use client'
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface PerformanceDebuggerProps {
  interviewId: string
}

export default function PerformanceDebugger({ interviewId }: PerformanceDebuggerProps) {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkInterviewStatus = async () => {
    setLoading(true);
    try {
      // Check interview status
      const response = await fetch(`/api/interview-debug?interviewId=${interviewId}`);
      const data = await response.json();
      setDebugInfo(data);
    } catch (error) {
      console.error('Debug check failed:', error);
      toast.error('Failed to get debug info');
    } finally {
      setLoading(false);
    }
  }

  const fixCompletedInterviews = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/fix-completed-interviews', {
        method: 'POST';
        headers: { 'Content-Type': 'application/json' }
      })
      const result = await response.json();
      
      if (result.success) {
        toast.success(`Fixed ${result.fixedInterviews} interviews and converted ${result.convertedUserIds} userId formats`);
        checkInterviewStatus() // Refresh debug info
      } else {
        toast.error(`Fix failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Fix failed:', error);
      toast.error('Fix operation failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkInterviewStatus();
  }, [interviewId])

  if (process.env.NODE_ENV === 'production') {
    return null // Don't show in production
  }

  return (
    <Card className="mb-6 border-2 border-yellow-300 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-yellow-800 flex items-center gap-2">
          🐛 Performance Debug Panel
          <Badge variant="outline">Dev Only</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={checkInterviewStatus} 
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading ? 'Checking...' : 'Check Status'}
            </Button>
            <Button 
              onClick={fixCompletedInterviews} 
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading ? 'Fixing...' : 'Fix Issues'}
            </Button>
          </div>
          
          {debugInfo && (
            <div className="bg-white p-4 rounded border">
              <pre className="text-xs overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}