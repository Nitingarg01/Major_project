'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { RotateCcw, Zap, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'

interface FeedbackLoaderProps {
  interviewId: string
}

export default function FeedbackLoader({ interviewId }: FeedbackLoaderProps) {
  const [status, setStatus] = useState<'checking' | 'generating' | 'ready' | 'error'>('checking')
  const [attempts, setAttempts] = useState(0)
  const [processingTime, setProcessingTime] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const startTime = Date.now()

    const checkFeedback = async () => {
      try {
        const response = await fetch(`/api/fast-feedback?interviewId=${interviewId}`)
        const data = await response.json()

        if (data.feedbackReady) {
          setStatus('ready')
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        } else {
          setStatus('generating')
          setProcessingTime(Date.now() - startTime)
        }
      } catch (error) {
        console.error('Error checking feedback:', error)
        if (attempts > 3) {
          setStatus('error')
        }
      }
    }

    const generateFeedback = async () => {
      try {
        setStatus('generating')
        const response = await fetch('/api/fast-feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ interviewId })
        })

        if (response.ok) {
          setStatus('ready')
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        } else {
          const errorData = await response.json().catch(() => ({}))
          console.error('Feedback generation failed:', errorData)
          throw new Error(errorData.error || 'Failed to generate feedback')
        }
      } catch (error) {
        console.error('Error generating feedback:', error)
        setStatus('error')
      }
    }

    // Initial check
    checkFeedback()

    // If not ready, try to generate
    const generateTimer = setTimeout(() => {
      if (status === 'checking' || status === 'generating') {
        generateFeedback()
      }
    }, 2000)

    // Polling mechanism
    const pollInterval = setInterval(() => {
      if (status === 'generating' && attempts < 6) {
        checkFeedback()
        setAttempts(prev => prev + 1)
      } else if (attempts >= 6) {
        setStatus('error')
      }
    }, 3000)

    return () => {
      clearTimeout(generateTimer)
      clearInterval(pollInterval)
    }
  }, [interviewId, attempts, status])

  const getStatusInfo = () => {
    switch (status) {
      case 'checking':
        return {
          icon: <Clock className="w-6 h-6 text-blue-600 animate-pulse" />,
          title: "Checking Feedback Status...",
          message: "Looking for existing analysis",
          color: "text-blue-600"
        }
      case 'generating':
        return {
          icon: <Zap className="w-6 h-6 text-purple-600 animate-bounce" />,
          title: "⚡ Generating AI Feedback...",
          message: `Using advanced Groq AI • ${Math.floor(processingTime / 1000)}s elapsed`,
          color: "text-purple-600"
        }
      case 'ready':
        return {
          icon: <CheckCircle className="w-6 h-6 text-green-600" />,
          title: "✅ Feedback Ready!",
          message: "Redirecting to your results...",
          color: "text-green-600"
        }
      case 'error':
        return {
          icon: <RotateCcw className="w-6 h-6 text-red-600" />,
          title: "Feedback Generation Issue",
          message: "Let's try a different approach",
          color: "text-red-600"
        }
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <div className='flex flex-col gap-4 font-semibold text-2xl items-center justify-center min-h-[50vh] p-8'>
      <div className='bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text text-center'>
        <span>{statusInfo.title}</span>
      </div>
      
      <div className="bg-white rounded-lg p-6 border border-gray-200 text-center max-w-md shadow-lg">
        <div className="flex justify-center mb-4">
          {status === 'generating' ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          ) : (
            statusInfo.icon
          )}
        </div>
        
        <span className={`text-lg ${statusInfo.color} mb-2 block`}>
          {statusInfo.message}
        </span>
        
        <div className='mt-4 text-sm text-gray-500'>
          {status === 'generating' && (
            <>
              <p>🧠 Analyzing your responses with cutting-edge AI</p>
              <p>⏱️ Typical completion time: 5-15 seconds</p>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(90, (processingTime / 20000) * 100)}%` }}
                ></div>
              </div>
            </>
          )}
          
          {status === 'ready' && (
            <p>🎉 Your detailed performance analysis is complete!</p>
          )}
          
          {status === 'error' && (
            <p>Don't worry - we can still generate your feedback</p>
          )}
        </div>
        
        <div className="flex gap-2 mt-4">
          {status === 'error' ? (
            <>
              <Button onClick={() => window.location.reload()} className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full">
                  Go to Dashboard
                </Button>
              </Link>
            </>
          ) : status === 'ready' ? (
            <Button onClick={() => window.location.reload()} className="w-full bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              View Results
            </Button>
          ) : (
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
              className="w-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}