'use client'
import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Clock,
  Target,
  Award,
  Brain,
  Users,
  CheckCircle,
  XCircle,
  Star,
  Download,
  Filter,
  Search,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import LoadingWrapper from '@/components/LoadingWrapper'

interface PerformanceData {
  _id: string
  interviewId: string
  jobTitle: string
  companyName: string
  interviewType: string
  experienceLevel: string
  completedAt: string
  totalQuestions: number
  correctAnswers: number
  score: number
  timeSpent: number
  feedback: {
    overall: string
    strengths: string[]
    improvements: string[]
    recommendations: string[]
  }
  roundResults: Array<{
    roundType: string
    score: number
    questionsAnswered: number
    totalQuestions: number
    timeSpent: number
  }>
}

interface PerformanceStats {
  totalInterviews: number
  averageScore: number
  totalTimeSpent: number
  improvementTrend: number
  strongestArea: string
  weakestArea: string
  recentPerformance: number[]
}

export default function PerformancePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([])
  const [stats, setStats] = useState<PerformanceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedInterview, setSelectedInterview] = useState<PerformanceData | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    
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
      const response = await fetch('/api/performance-stats')
      const data = await response.json()

      if (data.success) {
        setPerformanceData(data.performances || [])
        setStats(data.stats || null)
      } else {
        throw new Error(data.error || 'Failed to fetch performance data')
      }
    } catch (error: any) {
      console.error('Error fetching performance data:', error)
      toast.error('Failed to load performance data')
    } finally {
      setLoading(false)
    }
  }

  const filteredData = performanceData.filter(item => {
    const matchesType = filterType === 'all' || item.interviewType === filterType
    const matchesSearch = searchTerm === '' || 
      item.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="w-4 h-4" />
    if (score >= 60) return <Target className="w-4 h-4" />
    return <TrendingDown className="w-4 h-4" />
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const exportData = () => {
    const csvContent = [
      ['Date', 'Company', 'Position', 'Type', 'Score', 'Time Spent', 'Questions Answered'].join(','),
      ...filteredData.map(item => [
        formatDate(item.completedAt),
        item.companyName,
        item.jobTitle,
        item.interviewType,
        `${item.score}%`,
        formatDuration(item.timeSpent),
        `${item.correctAnswers}/${item.totalQuestions}`
      ].join(','))
    ].join('\\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'interview-performance.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <LoadingWrapper isLoading={true} loadingMessage="Loading performance data...">
        <div />
      </LoadingWrapper>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <LoadingWrapper isLoading={false}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Performance <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Analytics</span>
            </h1>
            <p className="text-xl text-gray-600">Track your interview progress and improvement over time</p>
          </div>

          {performanceData.length === 0 ? (
            <div className="text-center py-16">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Performance Data Yet</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Complete your first interview to start tracking your performance and see detailed analytics.
              </p>
              <Link href="/create">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Start Your First Interview
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Stats Overview */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Interviews</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.totalInterviews}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Target className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Average Score</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Practice Time</p>
                          <p className="text-2xl font-bold text-gray-900">{formatDuration(stats.totalTimeSpent)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          stats.improvementTrend > 0 ? 'bg-green-100' : stats.improvementTrend < 0 ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                          {stats.improvementTrend > 0 ? (
                            <TrendingUp className="w-6 h-6 text-green-600" />
                          ) : stats.improvementTrend < 0 ? (
                            <TrendingDown className="w-6 h-6 text-red-600" />
                          ) : (
                            <Target className="w-6 h-6 text-gray-600" />
                          )}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Improvement</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {stats.improvementTrend > 0 ? '+' : ''}{stats.improvementTrend}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Filters and Search */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by company or position..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Types</option>
                      <option value="technical">Technical</option>
                      <option value="behavioral">Behavioral</option>
                      <option value="mixed">Mixed</option>
                      <option value="dsa">DSA</option>
                    </select>
                  </div>
                  <Button onClick={exportData} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>

              {/* Performance History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Interview History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredData.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getScoreColor(item.score)}`}>
                            {getScoreIcon(item.score)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{item.jobTitle}</h3>
                            <p className="text-sm text-gray-600">{item.companyName}</p>
                            <div className="flex items-center space-x-3 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {item.interviewType}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                <Calendar className="w-3 h-3 inline mr-1" />
                                {formatDate(item.completedAt)}
                              </span>
                              <span className="text-xs text-gray-500">
                                <Clock className="w-3 h-3 inline mr-1" />
                                {formatDuration(item.timeSpent)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className={`text-lg font-bold ${getScoreColor(item.score).split(' ')[0]}`}>
                              {item.score}%
                            </p>
                            <p className="text-sm text-gray-500">
                              {item.correctAnswers}/{item.totalQuestions} correct
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedInterview(item)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Detailed View Modal */}
        {selectedInterview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedInterview.jobTitle}</h2>
                    <p className="text-gray-600">{selectedInterview.companyName}</p>
                  </div>
                  <Button variant="ghost" onClick={() => setSelectedInterview(null)}>
                    ×
                  </Button>
                </div>
              </div>
              
              <div className="p-6">
                {/* Performance Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{selectedInterview.score}%</p>
                    <p className="text-sm text-gray-600">Overall Score</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedInterview.correctAnswers}/{selectedInterview.totalQuestions}
                    </p>
                    <p className="text-sm text-gray-600">Questions Correct</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{formatDuration(selectedInterview.timeSpent)}</p>
                    <p className="text-sm text-gray-600">Time Spent</p>
                  </div>
                </div>

                {/* Round Results */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Round Performance</h3>
                  <div className="space-y-3">
                    {selectedInterview.roundResults.map((round, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 capitalize">{round.roundType}</p>
                          <p className="text-sm text-gray-600">
                            {round.questionsAnswered}/{round.totalQuestions} questions • {formatDuration(round.timeSpent)}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(round.score)}`}>
                          {round.score}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feedback */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Feedback</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Overall Assessment</h4>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedInterview.feedback.overall}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          Strengths
                        </h4>
                        <ul className="space-y-2">
                          {selectedInterview.feedback.strengths.map((strength, index) => (
                            <li key={index} className="text-sm text-gray-700 bg-green-50 p-2 rounded">
                              • {strength}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <Target className="w-4 h-4 text-orange-600 mr-2" />
                          Areas for Improvement
                        </h4>
                        <ul className="space-y-2">
                          {selectedInterview.feedback.improvements.map((improvement, index) => (
                            <li key={index} className="text-sm text-gray-700 bg-orange-50 p-2 rounded">
                              • {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Brain className="w-4 h-4 text-blue-600 mr-2" />
                        Recommendations
                      </h4>
                      <ul className="space-y-2">
                        {selectedInterview.feedback.recommendations.map((recommendation, index) => (
                          <li key={index} className="text-sm text-gray-700 bg-blue-50 p-2 rounded">
                            • {recommendation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </LoadingWrapper>
  )
}