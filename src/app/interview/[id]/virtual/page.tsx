'use client'
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertTriangle, ArrowLeft, Brain } from 'lucide-react'
import { toast } from 'sonner'
import VirtualInterviewWrapper from '@/components/VirtualInterviewWrapper'

interface Interview {
  _id: string
  companyName: string
  jobTitle: string
  interviewType: string
  questions: any[]
  status: string
  createdAt: string
}

const VirtualInterviewPage = () => {
  const params = useParams()
  const router = useRouter()
  const interviewId = params.id as string

  const [interview, setInterview] = useState<Interview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (interviewId) {
      fetchInterview()
    }
  }, [interviewId])

  const fetchInterview = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/interviews/${interviewId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch interview')
      }

      const data = await response.json()
      setInterview(data.interview)
    } catch (error) {
      console.error('Error fetching interview:', error)
      setError('Failed to load interview. Please try again.')
      toast.error('Failed to load interview')
    } finally {
      setLoading(false)
    }
  }

  const handleInterviewComplete = async (results: any) => {
    try {
      // Navigate to results page
      router.push(`/interview/${interviewId}/results?type=virtual`)
      toast.success('🎉 Virtual interview completed! Redirecting to results...')
    } catch (error) {
      console.error('Error completing interview:', error)
      toast.error('Error completing interview')
    }
  }

  const handleBack = () => {
    router.push(`/interview/${interviewId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Loading Virtual Interview</h3>
            <p className="text-gray-600 text-center">
              Preparing your AI-powered interview experience...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !interview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Error Loading Interview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              {error || 'Interview not found or failed to load.'}
            </p>
            <div className="flex space-x-2">
              <Button onClick={() => router.push('/dashboard')} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <Button onClick={fetchInterview}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if interview is suitable for virtual mode
  if (interview.status === 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="w-5 h-5 mr-2 text-purple-600" />
              Interview Already Completed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              This interview has already been completed. You can view the results or start a new interview.
            </p>
            <div className="flex space-x-2">
              <Button 
                onClick={() => router.push(`/interview/${interviewId}/results`)} 
                variant="outline"
              >
                View Results
              </Button>
              <Button onClick={() => router.push('/dashboard')}>
                New Interview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Virtual AI Interview
                </h1>
                <p className="text-sm text-gray-500">
                  {interview.jobTitle} at {interview.companyName}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                <Brain className="w-3 h-3 mr-1" />
                AI Powered
              </Badge>
              <Badge variant="outline">
                {interview.interviewType}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8">
        <VirtualInterviewWrapper
          interviewId={interviewId}
          questions={interview.questions || []}
          companyName={interview.companyName}
          jobTitle={interview.jobTitle}
          interviewType={interview.interviewType}
          onComplete={handleInterviewComplete}
          onBack={handleBack}
        />
      </div>
    </div>
  )
}

export default VirtualInterviewPage