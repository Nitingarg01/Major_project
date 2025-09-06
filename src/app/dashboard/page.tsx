'use client'
import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Plus, 
  Users, 
  FileText, 
  BarChart3, 
  Clock, 
  CheckCircle, 
  PlayCircle,
  Calendar,
  TrendingUp,
  BookOpen,
  Target,
  ArrowRight,
  Briefcase,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import LoadingWrapper from '@/components/LoadingWrapper'

interface Interview {
  _id: string
  jobTitle: string
  companyName: string
  status: string
  createdAt: string
  interviewType: string
  experienceLevel: string
}

interface DashboardStats {
  total: number
  completed: number
  inProgress: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [stats, setStats] = useState<DashboardStats>({ total: 0, completed: 0, inProgress: 0 })
  const [loading, setLoading] = useState(true)
  const [hasInitialized, setHasInitialized] = useState(false)

  useEffect(() => {
    console.log('Auth status changed:', status)
    console.log('Session:', session)
    
    // Prevent multiple initializations
    if (hasInitialized) {
      console.log('Already initialized, skipping...')
      return
    }
    
    if (status === 'loading') {
      console.log('Session still loading...')
      return
    }
    
    if (status === 'unauthenticated') {
      console.log('User not authenticated, redirecting to login')
      router.push('/login')
      return
    }

    if (status === 'authenticated' && session?.user?.id) {
      console.log('User authenticated, fetching interviews...')
      setHasInitialized(true)
      fetchUserInterviews()
    } else if (status === 'authenticated' && !session?.user?.id) {
      console.error('Authenticated but no user ID found')
      toast.error('Authentication error. Please try logging in again.')
      router.push('/login')
    }
  }, [status, hasInitialized, router])

  const fetchUserInterviews = async () => {
    // Prevent multiple simultaneous calls
    if (!loading) {
      console.log('Already loaded or loading, skipping fetch...')
      return
    }

    try {
      console.log('Starting to fetch user interviews...')
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        console.log('Request timeout - aborting...')
        controller.abort()
      }, 8000) // 8 second timeout
      
      console.log('Making API call to /api/user-interviews...')
      const response = await fetch('/api/user-interviews?limit=5', {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
        }
      })
      
      clearTimeout(timeoutId)
      console.log('API Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }
      
      const data = await response.json()
      console.log('API Response data:', data)

      if (data.success) {
        setInterviews(data.interviews || [])
        setStats(data.stats || { total: 0, completed: 0, inProgress: 0 })
        console.log('Successfully loaded interviews:', data.interviews?.length || 0)
      } else {
        console.error('API returned success: false', data.error)
        throw new Error(data.error || 'Failed to fetch data')
      }
    } catch (error) {
      console.error('Error fetching interviews:', error)
      if (error.name === 'AbortError') {
        toast.error('Request timeout. Please try again.')
      } else if (error.message.includes('401')) {
        console.error('Authentication error - redirecting to login')
        setHasInitialized(false) // Reset initialization flag
        router.push('/login')
        return
      } else {
        toast.error('Failed to load interviews. Please refresh the page.')
      }
      
      // Set empty data to prevent infinite loading
      setInterviews([])
      setStats({ total: 0, completed: 0, inProgress: 0 })
    } finally {
      console.log('Setting loading to false')
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'ready':
        return 'bg-blue-100 text-blue-800'
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'generating':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'ready':
        return <PlayCircle className="w-4 h-4" />
      case 'in-progress':
        return <Clock className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Show loading wrapper only when we're actually loading data or waiting for initial authentication
  if ((status === 'loading' && !hasInitialized) || (loading && hasInitialized && interviews.length === 0)) {
    return (
      <LoadingWrapper 
        isLoading={true}
        loadingMessage="Loading your dashboard..."
        loadingSubMessage="Please wait while we fetch your data"
      >
        <div />
      </LoadingWrapper>
    )
  }

  // If not authenticated, redirect (this should not show loading)
  if (status === 'unauthenticated') {
    return null
  }

  return (
    <LoadingWrapper isLoading={false}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{session?.user?.name}</span>!
            </h1>
            <p className="text-xl text-gray-600">Ready to ace your next interview?</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Interviews</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Link href="/create">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">New Interview</h3>
                <p className="text-gray-600 text-sm">Create and practice with AI-powered questions</p>
                <div className="flex items-center mt-3 text-blue-600 group-hover:text-blue-700">
                  <span className="text-sm font-medium">Get Started</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Link>

            <Link href="/resume-analyzer">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Resume Analyzer</h3>
                <p className="text-gray-600 text-sm">Get AI feedback on your resume</p>
                <div className="flex items-center mt-3 text-green-600 group-hover:text-green-700">
                  <span className="text-sm font-medium">Analyze Now</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Link>

            <Link href="/performance">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance & Feedback</h3>
                <p className="text-gray-600 text-sm">View your interview analytics and get personalized feedback</p>
                <div className="flex items-center mt-3 text-purple-600 group-hover:text-purple-700">
                  <span className="text-sm font-medium">View Stats & Feedback</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Link>
          </div>

          {/* Recent Interviews */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Recent Interviews</h2>
                <Link href="/interview">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="p-6">
              {interviews.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No interviews yet</h3>
                  <p className="text-gray-600 mb-6">Start your interview preparation journey by creating your first mock interview</p>
                  <Link href="/create">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Interview
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {interviews.map((interview) => (
                    <div
                      key={interview._id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{interview.jobTitle}</h3>
                          <p className="text-sm text-gray-600">{interview.companyName}</p>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
                              {getStatusIcon(interview.status)}
                              <span className="ml-1 capitalize">{interview.status}</span>
                            </span>
                            <span className="text-xs text-gray-500">
                              <Calendar className="w-3 h-3 inline mr-1" />
                              {formatDate(interview.createdAt)}
                            </span>
                            <span className="text-xs text-gray-500 capitalize">
                              {interview.interviewType} • {interview.experienceLevel}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {interview.status === 'ready' && (
                          <Link href={`/interview/${interview._id}`}>
                            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                              <PlayCircle className="w-4 h-4 mr-2" />
                              Start
                            </Button>
                          </Link>
                        )}
                        {interview.status === 'completed' && (
                          <Link href={`/interview/${interview._id}/feedback`}>
                            <Button size="sm" variant="outline">
                              <BarChart3 className="w-4 h-4 mr-2" />
                              View Results
                            </Button>
                          </Link>
                        )}
                        {interview.status === 'in-progress' && (
                          <Link href={`/interview/${interview._id}/perform`}>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <PlayCircle className="w-4 h-4 mr-2" />
                              Continue
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </LoadingWrapper>
  )
}