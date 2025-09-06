'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Target,
  MessageSquare,
  Star,
  Calendar,
  Award,
  ThumbsUp,
  ThumbsDown,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface PerformanceData {
  totalInterviews: number
  completedInterviews: number
  averageScore: number
  strongAreas: string[]
  improvementAreas: string[]
  recentFeedback: FeedbackItem[]
  performanceTrend: number[]
}

interface FeedbackItem {
  _id: string
  interviewId: string
  companyName: string
  jobTitle: string
  score: number
  feedback: string
  strengths: string[]
  improvements: string[]
  createdAt: string
}

export default function PerformancePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchPerformanceData()
    }
  }, [status, router])

  const fetchPerformanceData = async () => {
    try {
      const response = await fetch('/api/user-performance')
      const data = await response.json()

      if (data.success) {
        setPerformanceData(data.performance)
      } else {
        // Create mock data for demo if API doesn't exist yet
        setPerformanceData({
          totalInterviews: 12,
          completedInterviews: 8,
          averageScore: 78,
          strongAreas: ['Technical Skills', 'Problem Solving', 'Communication'],
          improvementAreas: ['System Design', 'Behavioral Questions', 'Time Management'],
          recentFeedback: [
            {
              _id: '1',
              interviewId: 'int_1',
              companyName: 'Google',
              jobTitle: 'Software Engineer',
              score: 85,
              feedback: 'Strong technical skills and problem-solving approach. Excellent coding implementation.',
              strengths: ['Clean code', 'Algorithm optimization', 'Clear explanation'],
              improvements: ['System design depth', 'Edge case handling'],
              createdAt: new Date().toISOString()
            },
            {
              _id: '2',
              interviewId: 'int_2',
              companyName: 'Amazon',
              jobTitle: 'Senior SDE',
              score: 72,
              feedback: 'Good understanding of leadership principles. Need to work on system design complexity.',
              strengths: ['Leadership scenarios', 'Customer obsession'],
              improvements: ['Scalability discussions', 'Trade-off analysis'],
              createdAt: new Date(Date.now() - 86400000).toISOString()
            }
          ],
          performanceTrend: [65, 68, 72, 75, 78, 82, 78]
        })
      }
    } catch (error) {
      console.error('Error fetching performance data:', error)
      toast.error('Failed to load performance data')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading performance data...</p>
        </div>
      </div>
    )
  }

  if (!performanceData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Performance Data</h3>
          <p className="text-gray-600 mb-6">Complete some interviews to see your performance analytics</p>
          <Link href="/create">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Start Your First Interview
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Performance <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Analytics</span>
              </h1>
              <p className="text-xl text-gray-600 mt-2">Track your interview progress and get personalized feedback</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Interviews</p>
                <p className="text-2xl font-bold text-gray-900">{performanceData.totalInterviews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{performanceData.completedInterviews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{performanceData.averageScore}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round((performanceData.completedInterviews / performanceData.totalInterviews) * 100)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Strengths and Improvements */}
          <div className="lg:col-span-1 space-y-6">
            {/* Strong Areas */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ThumbsUp className="w-5 h-5 text-green-600 mr-2" />
                Strong Areas
              </h3>
              <div className="space-y-2">
                {performanceData.strongAreas.map((area, index) => (
                  <div key={index} className="flex items-center p-2 bg-green-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm text-green-800">{area}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Improvement Areas */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="w-5 h-5 text-orange-600 mr-2" />
                Areas for Improvement
              </h3>
              <div className="space-y-2">
                {performanceData.improvementAreas.map((area, index) => (
                  <div key={index} className="flex items-center p-2 bg-orange-50 rounded-lg">
                    <Clock className="w-4 h-4 text-orange-600 mr-2" />
                    <span className="text-sm text-orange-800">{area}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Feedback */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <MessageSquare className="w-5 h-5 text-purple-600 mr-2" />
                Recent Interview Feedback
              </h3>
              
              <div className="space-y-4">
                {performanceData.recentFeedback.map((feedback) => (
                  <div
                    key={feedback._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer"
                    onClick={() => setSelectedFeedback(feedback)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {feedback.companyName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{feedback.jobTitle}</h4>
                          <p className="text-sm text-gray-600">{feedback.companyName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(feedback.score)}`}>
                          {feedback.score}%
                        </span>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(feedback.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-3">{feedback.feedback}</p>
                    
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-green-700 mb-1">Strengths:</p>
                        <div className="flex flex-wrap gap-1">
                          {feedback.strengths.slice(0, 2).map((strength, index) => (
                            <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                              {strength}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-xs font-medium text-orange-700 mb-1">Improvements:</p>
                        <div className="flex flex-wrap gap-1">
                          {feedback.improvements.slice(0, 2).map((improvement, index) => (
                            <span key={index} className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                              {improvement}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {performanceData.recentFeedback.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No feedback available yet</p>
                  <Link href="/create">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Start an Interview
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Feedback Modal */}
        {selectedFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                      {selectedFeedback.companyName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{selectedFeedback.jobTitle}</h3>
                      <p className="text-sm text-gray-600">{selectedFeedback.companyName}</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedFeedback(null)}>
                    Close
                  </Button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Overall Score</h4>
                    <span className={`px-4 py-2 rounded-full text-lg font-bold ${getScoreColor(selectedFeedback.score)}`}>
                      {selectedFeedback.score}%
                    </span>
                  </div>
                  <p className="text-gray-700">{selectedFeedback.feedback}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-md font-semibold text-green-700 mb-3 flex items-center">
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Strengths
                    </h5>
                    <div className="space-y-2">
                      {selectedFeedback.strengths.map((strength, index) => (
                        <div key={index} className="p-3 bg-green-50 rounded-lg">
                          <span className="text-green-800">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-md font-semibold text-orange-700 mb-3 flex items-center">
                      <Target className="w-4 h-4 mr-2" />
                      Areas for Improvement
                    </h5>
                    <div className="space-y-2">
                      {selectedFeedback.improvements.map((improvement, index) => (
                        <div key={index} className="p-3 bg-orange-50 rounded-lg">
                          <span className="text-orange-800">{improvement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}