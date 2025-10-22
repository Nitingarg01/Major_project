'use client'
import React, { useEffect, useState } from 'react';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import LoadingWrapper from '@/components/LoadingWrapper';

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
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
  const { data: session, status } = useSession();
  const router = useRouter();
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState<PerformanceData | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return
    }

    if (status === 'authenticated') {
      fetchPerformanceData();
    }
  }, [status, router])

  const fetchPerformanceData = async () => {
    try {
      const response = await fetch('/api/performance-stats');
      const data = await response.json();

      if (data.success) {
        setPerformanceData(data.performances || []);
        setStats(data.stats || null);
      } else {
        throw new Error(data.error || 'Failed to fetch performance data');
      }
    } catch (error: any) {
      const response = await fetch('/api/user-performance');
      const data = await response.json();

      if (data.success) {
        setPerformanceData(data.performance);
      } else {
        // Create mock data for demo if API doesn't exist yet
        setPerformanceData({
          totalInterviews: 12;
          completedInterviews: 8;
          averageScore: 78;
          strongAreas: ['Technical Skills', 'Problem Solving', 'Communication'],
          improvementAreas: ['System Design', 'Behavioral Questions', 'Time Management'],
          recentFeedback: [
            {
              _id: '1';
              interviewId: 'int_1';
              companyName: 'Google';
              jobTitle: 'Software Engineer';
              score: 85;
              feedback: 'Strong technical skills and problem-solving approach. Excellent coding implementation.';
              strengths: ['Clean code', 'Algorithm optimization', 'Clear explanation'],
              improvements: ['System design depth', 'Edge case handling'],
              createdAt: new Date().toISOString()
            },
            {
              _id: '2';
              interviewId: 'int_2';
              companyName: 'Amazon';
              jobTitle: 'Senior SDE';
              score: 72;
              feedback: 'Good understanding of leadership principles. Need to work on system design complexity.';
              strengths: ['Leadership scenarios', 'Customer obsession'],
              improvements: ['Scalability discussions', 'Trade-off analysis'],
              createdAt: new Date(Date.now() - 86400000).toISOString()
            }
          ],
          performanceTrend: [65, 68, 72, 75, 78, 82, 78]
        })
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
      toast.error('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  }

  const filteredData = performanceData.filter(item => {
    const matchesType = filterType === 'all' || item.interviewType === filterType;
    const matchesSearch = searchTerm === '' ||;
      item.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch;
  })

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="w-4 h-4" />;
    if (score >= 60) return <Target className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short';
      day: 'numeric';
      year: 'numeric';
      hour: '2-digit';
      minute: '2-digit'
    })
  }

  const exportData = () => {
    const csvContent = [;
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

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'interview-performance.csv';
    a.click();
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
    return null;
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
    </LoadingWrapper>
    </div>
  )
}